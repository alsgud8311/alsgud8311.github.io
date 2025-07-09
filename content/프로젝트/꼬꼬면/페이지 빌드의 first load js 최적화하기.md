---
title: 페이지 빌드의 first load js 최적화하기
created: 2025-06-28 19:28
updated: 2025-06-28 19:28
tags: []
categories: []
aliases: []
description: ""
status: "draft" # draft, in-progress, completed
---
## 문제상황
빌드 관련 문제를 고치다가, 생각보다 면접 페이지에서 `Three.js` 관련 라이브러리를 사용하다보니 몸집이 유난히 크다는 사실을 알게 됐다.
```
Route (pages)                                Size  First Load JS    
┌ ○ / (583 ms)                            2.62 kB         196 kB
├   /_app                                     0 B         187 kB
├ ○ /404 (583 ms)                         2.56 kB         200 kB
├ ○ /500 (584 ms)                         1.41 kB         196 kB
├ ƒ /interviews                           4.22 kB         227 kB
├ ƒ /interviews/[interviewId]              270 kB         486 kB
├ ƒ /interviews/[interviewId]/result      3.55 kB         205 kB
├ ○ /layout (589 ms)                        541 B         187 kB
├   └ css/2af4d3721e97fa9b.css              278 B
├ ƒ /login                                2.03 kB         193 kB
└ ƒ /login/callback                       1.91 kB         212 kB
+ First Load JS shared by all              197 kB
  ├ chunks/framework-eade7c0f56f49d6b.js  57.9 kB
  ├ chunks/main-b9d465a1082aa9a1.js        120 kB
  └ other shared chunks (total)           18.6 kB

ƒ Middleware                              95.5 kB
```
무려 혼자만 `486kB`를 잡아먹는 모습!
덕분에 첫 로드하는 JS가 많다보니 로딩도 늦게 된다. 특히 흰 화면이 약 1초 이상 지속되는 상태가 지속되어 사용자 경험이 떨어진다. First Load JS를 줄여 기본적인 UI정도는 보여주고, 로딩 상태를 보여주는 편이 낫겠다고 생각했다.

## 분석하기
`@next/bundle-analyzer`를 사용하면 번들에서 뭐가 제일 사이즈를 많이 차지하는지 빌드하면서 시각적으로 보여준다. 
![](https://i.imgur.com/boqJl1W.jpeg)
보면 three 관련 core 모듈들이 큰 사이즈를 가지고 있는 것을 알 수 있다.
결국 three를 쓰는 면접 페이지에서 3D 면접관을 띄워주는 UI쪽에서 최적화가 필요하다는 것을 의미한다.
## 개선하기
그 전에 빌드를 효과적으로 관리하는 방법은 여러 가지가 있다. 
### 빌드를 효과적으로 관리하는 법들
#### 배럴 파일 지양하기
[[배럴 파일에 대한 고찰]]
배럴 파일에 대한 설명은 이전에도 썼던 적이 있다.
결국 핵심은 하나만 import 해오면 될 걸 전체를 다 import해오니 문제이다.
전체를 import해와야만 하는 것이 아니라면, 개별로 import해와서 사용하는 것이 좋다.
#### splitChunks
```ts
const nextConfig: NextConfig = {
  ...
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
      };
    }
    return config;
  },
};

```

`config.optimization.splitChunks = { chunks: 'all' }`는 Webpack의 SplitChunksPlugin을 활성화하는 설정이다.
여기서 `chunks: 'all'`은
- 동적 import (import())된 청크뿐만 아니라,
- 모든 동기적(import) 청크까지도 자동으로 공통 모듈을 추출하여 별도의 파일로 분리한다

예를 들어 다음과 같은 코드가 있다고 할 때:

```js
// page1.js
import _ from "lodash";

// page2.js
import _ from "lodash";
```
기본 설정에서는 `lodash`가 각 페이지에 중복 포함될 가능성이 있다.
하지만 위 설정(`chunks: 'all'`)을 사용하면 `lodash`는 공통 청크로 분리되어 `vendors~page1~page2.js` 같은 파일로 나뉘고, `page1.js`, `page2.js`는 같은 공통 청크를 참조하게 된다.

추가적으로 여기서 청크를 더 정교하게 사용하려면 속성들을 조절할 수 있다.
```ts
splitChunks: {
  // 어떤 청크를 분할할지 지정: 'all'이면 동기 + 비동기(import()) 모두 분할
  chunks: 'all',
  // 분할할 최소 청크 크기 (byte 기준), 20KB 이상일 때만 분할됨
  minSize: 20000,
  // 분할할 최대 청크 크기, 0이면 제한 없음 (청크가 무제한 커질 수 있음)
  maxSize: 0,
  // 최소 공유 모듈 수: 1개 이상 청크에서 공유되는 경우 분할 대상
  minChunks: 1,
  // 비동기 요청 개수 제한 (import()를 통해 병렬로 로드 가능한 최대 청크 수)
  maxAsyncRequests: 30,
  // 초기 로딩 시 병렬로 가져올 수 있는 최대 청크 수 (entry point 기준)
  maxInitialRequests: 30,
  // 자동 생성되는 청크 이름들 사이에 들어갈 구분자 (예: vendors~page1.js)
  automaticNameDelimiter: '~',
  // 청크 그룹(모듈 그룹화 전략) 정의
  cacheGroups: {
    vendors: {
      // node_modules 안에 있는 모듈들을 대상으로 설정
      test: /[\\/]node_modules[\\/]/,
      // 분리된 청크 이름을 'vendors'로 설정
      name: 'vendors',
      // 동기/비동기 상관없이 모두 분할 대상으로 포함
      chunks: 'all',
    },
  },
}
```

#### ts 증분빌드 사용
```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true
  }
}
```
Nextjs는 빌드를 여러번 할 경우에 기존의 캐시를 이용하여 변경된 부분을 재활용하는 설정이 추가되어 있다.
하지만 ts의 경우에는 `compilerOptions`에 incremental 속성을 추가해줘야 증분 빌드를 사용할 수 있다.
#### dynamic import
가장 핵심적으로 First Load js를 줄일 수 있는 부분이다.
처음에 가져오는 자바스크립트의 양을 줄이고, 나중에 무거운 부분을 `dynamic import` 함으로써 기본적인 UI에 Suspense를 활용하여 Fallback UI를 보여주면 처음에 흰 화면만 보일 때보다 사용자 경험이 좋다.

```tsx
import { useState } from 'react';
import dynamic from 'next/dynamic';

// 1. 기본 동적 임포트 - 컴포넌트를 lazy loading
const DynamicComponent = dynamic(() => import('../components/HeavyComponent'), {
  // 로딩 중 표시할 컴포넌트
  loading: () => <p>Loading...</p>,
  // 서버사이드 렌더링 비활성화 (클라이언트에서만 렌더링)
  ssr: false
});

// 2. 조건부 동적 임포트 - 특정 조건에서만 컴포넌트 로드
const ConditionalComponent = dynamic(
  () => import('../components/AdminPanel'),
  { 
    loading: () => <div>관리자 패널 로딩 중...</div>,
    ssr: false 
  }
);

// 3. 라이브러리 동적 임포트 예시
const ChartPage = () => {
  const [showChart, setShowChart] = useState(false);
  const [ChartComponent, setChartComponent] = useState(null);

  // 버튼 클릭 시 차트 라이브러리를 동적으로 로드
  const loadChart = async () => {
    try {
      // Chart.js 라이브러리를 동적으로 임포트
      const { Chart } = await import('chart.js/auto');
      
      // 실제로는 Chart 컴포넌트를 동적으로 임포트하는 것이 일반적
      const DynamicChart = dynamic(() => import('../components/Chart'), {
        loading: () => <div>차트 로딩 중...</div>
      });
      
      setChartComponent(DynamicChart);
      setShowChart(true);
    } catch (error) {
      console.error('차트 로딩 실패:', error);
    }
  };

  return (
    <div>
      <h1>동적 임포트 예시 페이지</h1>
      
      {/* 항상 렌더링되는 일반 컴포넌트 */}
      <div>
        <h2>일반 컴포넌트</h2>
        <p>이 컴포넌트는 페이지 로드 시 바로 렌더링됩니다.</p>
      </div>

      {/* 동적으로 로드되는 무거운 컴포넌트 */}
      <div>
        <h2>동적 컴포넌트</h2>
        <DynamicComponent />
      </div>

      {/* 조건부 렌더링과 함께 사용하는 동적 컴포넌트 */}
      <div>
        <h2>조건부 동적 컴포넌트</h2>
        <ConditionalComponent />
      </div>

      {/* 사용자 액션에 따른 동적 로딩 */}
      <div>
        <h2>온디맨드 차트</h2>
        {!showChart ? (
          <button onClick={loadChart}>
            차트 로드하기
          </button>
        ) : (
          ChartComponent && <ChartComponent />
        )}
      </div>
    </div>
  );
};

export default ChartPage;
```


### 내가 선택한 방법
에서는 다른 것들도 모두 사용했긴 했지만 `dynamic import`를 가장 많이 활용하였다.
결국 내가 해결하고자 하는 문제는 `first load js`를 줄이는 문제인데, 이는 주로 의존성을 줄일만큼 줄였고, 결국 큰 리소스가 필요한 곳인 3D 렌더링 영역만 동적으로 import하면 처음 로드하는 js를 줄일 수 있기 때문이다.

#### 추상화 하기
결국 dynamic import를 하려면 컴포넌트를 쪼개야 하는 필요성이 생기고, 이에 따라 추상화를 다시 해줄 필요가 있었다.
```
Suspense (최상위)
└── AiInterviewInterface (Canvas)
    └── Suspense (2차)
        ├── Interviewer
        │   └── Suspense (3차)
        │       └── AvatarMesh (🧩 dynamic import)
        ├── Environment
        └── InterviewBackground (🧩 dynamic import)
```

![](https://i.imgur.com/tH7iMVh.png)


이렇게 컴포넌트를 추상화하여 구조화했고, 이런 구조로 가게 된다면 
```
처음 빈 캔버스 + Fallback -> 배경 -> 면접관 캐릭터 Fallback -> 면접관
```
순서로 나오기 때문에 캔버스 화면 내의 모든 것들이 빈 화면만 보고 있지 않아도 된다.

해당 페이지에서는 가장 리소스를 많이 잡아먹는 three.js 라이브러리를 사용해서 인터뷰 인터페이스를 보여주는 UI인데, dynamic import를 통해 최적화를 진행한 후에는 처음에 참조하는 파일(Chunk)가 크게 줄어들고, 전체 사용량 또한 크게 줄어든 것을 볼 수 있다.

![](https://i.imgur.com/QAYIlXG.png)

한번에 볼 수 있는 빌드 결과 또한 이를 명확하게 보여준다.

```
Route (pages)                                Size  First Load JS    
┌ ○ / (583 ms)                            2.62 kB         196 kB
├   /_app                                     0 B         187 kB
├ ○ /404 (583 ms)                         2.56 kB         200 kB
├ ○ /500 (584 ms)                         1.41 kB         196 kB
├ ƒ /interviews                           4.22 kB         227 kB
├ ƒ /interviews/[interviewId]              270 kB         486 kB
├ ƒ /interviews/[interviewId]/result      3.55 kB         205 kB
├ ○ /layout (589 ms)                        541 B         187 kB
├   └ css/2af4d3721e97fa9b.css              278 B
├ ƒ /login                                2.03 kB         193 kB
└ ƒ /login/callback                       1.91 kB         212 kB
+ First Load JS shared by all              197 kB
  ├ chunks/framework-eade7c0f56f49d6b.js  57.9 kB
  ├ chunks/main-b9d465a1082aa9a1.js        120 kB
  └ other shared chunks (total)           18.6 kB

ƒ Middleware                              95.5 kB
```

최적화 이전에는 인터뷰 인터페이스를 처음 들어갔을 때, 처음 로드되는 JS는 **486kB**나 됐었다.

```
Route (pages)                                Size  First Load JS    
┌ ○ / (683 ms)                            2.62 kB         197 kB
├   /_app                                     0 B         188 kB
├ ○ /404 (684 ms)                         2.56 kB         201 kB
├ ○ /500 (682 ms)                         1.41 kB         197 kB
├ ƒ /interviews                           4.21 kB         228 kB
├ ƒ /interviews/[interviewId]             8.72 kB         226 kB
├ ƒ /interviews/[interviewId]/result      3.55 kB         206 kB
├ ○ /layout (683 ms)                        539 B         188 kB
├   └ css/2af4d3721e97fa9b.css              278 B
├ ƒ /login                                2.03 kB         194 kB
└ ƒ /login/callback                       1.89 kB         213 kB
+ First Load JS shared by all              198 kB
  ├ chunks/framework-e014ade20ec142cc.js  57.9 kB
  ├ chunks/main-de6294b63b86fa93.js        120 kB
  └ other shared chunks (total)           19.5 kB

ƒ Middleware                              95.6 kB
```
이게 최적화 이후인데, **`486 -> 226kB`** 로 약 **`250kB`** 이상, 거의 두배정도 최적화한 것으로 볼 수 있다.


## 결론
기존의 `First Load JS` 에서 가장 많은 로드양이 나는 페이지에 대해서 약 2배정도 최적화를 진행하면서 기존의 속도 대비 2배가 빨라진다는 사실이 생각보다 크게 다가왔다.

이전까지는 그냥 `lazy loading`, `dynamic import` 라는 개념 자체가 그냥 프로젝트하면서 사용자를 많이 생각하지 않았던 탓에 해보지 않았는데, 이번에 직접 해보면서 사용자경험의 중요성 또한 깨달았다. 그리고 '잘' 만든 애플리케이션이 얼마나 어려운지 다시금 느끼게 되었다.

동적으로 요소들을 가져온다 하더라도 이를 위해서는 nextjs에서는 한 단계의 추상화가 더 필요하다. 추상화 정도가 높아진다는 것은 곧 코드가 더 분할돼서 복잡성이 높아진다는 뜻이기도 하다. 결국 이를 위해서는 어떻게 컴포넌트명을 잘 써서 개발자들이 더 잘 알아볼 수 있는지도 중요하고, 오히려 필요없는 부분을 과하게 추상화한 다음에 무조건 `dynamic import`하는 것도 `silver bullet`이 아니기 때문에 이를 컴포넌트에서 어떻게 분석하고, 이를 기반으로 컴포넌트를 분할하는 시각이 더 중요하다는 사실을 알게 되었다.