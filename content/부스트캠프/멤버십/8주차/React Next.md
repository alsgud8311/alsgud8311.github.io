크롱님 마스터클래스
첫 페이지 로딩은 중요
# Core Web Vitals
## First contentful paint

최초 콘텐츠풀 페인트(FCP)는 브라우저가 DOM에서 첫 번째 콘텐츠 비트를 렌더링하여, 페이지가 실제로 로드되고 있다는 첫 번째 피드백을 사용자에게 제공하는 경우입니다. FCP 이후에 사용자는 웹 페이지가 로드되어 있다는 것을 느낄 수 있습니다.

최초 콘텐츠풀 페인트 타임스탬프는 브라우저가 텍스트, 이미지(배경 이미지 포함), 비디오, 그려진 캔버스 또는 비어있지 않은 SVG를 처음 렌더링한 시점입니다. 이것은 iframe의 모든 콘텐츠를 제외하지만 보류 중인 웹 글꼴이 있는 텍스트를 포함합니다. 사용자가 페이지 콘텐츠를 소비하기 시작한 것은 이 시점이 처음입니다.


## Largest Contentful Paint(제일 중요)
LCP는 사용자가 페이지로 처음 이동한 시점을 기준으로 표시 영역에 표시되는 가장 큰 이미지, 텍스트 블록 또는 동영상의 렌더링 시간을 보고합니다.


## Cumulative Layout Shift
방문자에게 콘텐츠가 얼마나‌ 불안정한 지 측정하는 사용자 경험 측정 항목 

현재 보고 있는 페이지에 갑자기 발생하는 레이아웃의 변경은 시각적으로 거슬리며 사용자의 주의를 산만하게 함
또한 잘못된 클릭을 유도하여 실제 피해를 일으킬 수도 있고 아주 실망스러운 사용자 경험으로 이어질 수 있음

**CLS(Cumulative Layout Shift)** 측정은 사용자에게 발생하는 레이아웃 이동(layout shift) 빈도를 측정하여 이 문제를 해결하는 데 도움이 됩니다.

![](https://wit.nts-corp.com/wp-content/uploads/2020/12/01.gif)



## 반응속도 관련 지표 - Interaction to Next Paint
https://ui.toast.com/posts/ko_20220512
다음 페인트에 대한 상호작용(Interaction to Next Paint, INP)은 응답성을 평가하는 실험적인 필드 메트릭
INP는 전체 페이지 라이프 사이클동안 일어난 모든 상호작용에 대한 지연을 기록한다. 이러한 상호작용은 가장 높은 값(또는 많은 상호 작용이 있는 페이지의 경우 가장 높은 값에 가까운 값)이 페이지의 INP로 기록된다. INP가 낮다면 해당 페이지가 항상 안정적으로 응답할 수 있다는 걸 보장한다.



## 개선해야 할 항목
- 첫 페이지 로딩을 빠르게 
- 훌륭한 반응
- 부드럽게 이어져 보이기

## 최적화 작업 진행 방법
`**진단 > 개선 > 테스트 > 진단**`

1. 진단
	- 어디가 왜 얼마큼 느린가?
	- 어느 인터랙션이 사용자에게 중요한 가치를 주는가?
	- 정량적인 지표는 얼마인가?
	- 어떻게 진단하는가?
	    - **크롬 개발자도구 - lighthouse**
	    - 크롬 개발자도구 - performance, memory(누수는 없나?)
	    - pagespeed insights
2. 개선
    
3. 테스트
    - side effect는 없는가?
        
4. 진단
    - 어디가 얼마큼 빨라졌는가?


## 실제 문제 해결방법

### 1. 첫 페이지 로딩 지연문제 해결
- **HTML Parsing 방해하지 않기**
    - `script` 위치 조정 (body 끝으로 이동)
    - `defer`/`async` 속성 활용
- **Build를 통한 코드 최적화**
    - 코드 압축 (minification) 및 번들링
	    - 번들링을 안하면 파일 수가 많아지고, 서버에 그때마다 요청하기 때문에 비용이 큼. 번들링을 통해서 http request 수를 줄이기
	    - 배포하는 파일을 줄임으로써 관리 또한 쉬워짐
    - 코드 스플리팅 (Code Splitting)
	    - 너무 큰 코드를 나누기. 실질적으로 사용하는 부분은 적은데 처음부터 많이 받으면 첫 렌더링 속도가 느려짐
	    - 적절한 코드 스플리팅을 통해 필요한 부분만 받고 캐시 효과를 보면서 최적화
	- 난독화
    - **Vite**, **ESBuild**와 같은 최신 빌드 도구 활용
- **클라이언트 동적 렌더링 피하기**
    - Server-Side Rendering (SSR)
	    - 동적으로 서버에서 렌더링 해서 주는 것들로 컴파일되는 효과
	    - 서버사이드 렌더링이 첫 렌더링 때는 훨씬 좋음
	    - 하지만 서버가 복잡해지고 view를 관리하기 어려움
	    - 초기 페이지는 서버사이드 렌더링 , 나머지는 클라이언트 사이드 렌더링이 이상적인데 서버에서는 이를 분리해서 관리하기 어려움
    - Pre-Rendering (예: [prerender-loader](https://www.npmjs.com/package/prerender-loader))
    - **Static Site Generation (SSG)** 활용 가능 여부 확인
    - 리액트에서 제공하는 API를 활용해서 해보기
- **Lazy Loading(지연로딩)**
	- 스크롤이 내려지는 시점에 단계적으로 가져올 수 있게 하는 것
    - Lazy Component Loading (Dynamic JS Loading)
    - Image Lazy Loading (`loading="lazy"`)
	- React.lazy를 통해 그때그때 컴포넌트 가져오기
    - **IntersectionObserver API** 활용
        
- **HTTP Header의 속성 활용**
    - Cache-Control (`max-age`, `no-cache`, `no-store`)
    - Expires (캐시 만료 시간)
    - Last-Modified / If-Modified-Since (마지막 갱신 시간)
    - **ETag** 활용: 리소스 변경 여부를 서버에서 판단
        - 서버가 리소스를 제공할 때 ETag 값을 생성해 응답 헤더에 포함 (ETag: "abc123")
        - 브라우저는 이후 요청에서 If-None-Match 헤더에 ETag 값을 포함 (If-None-Match: "abc123")
        - 서버는 ETag를 비교 (값이 같으면 리소스가 변경되지 않았으므로 304 Not Modified를 반환)
            
- **이미지 최적화**
    - WebP, AVIF 포맷으로 이미지 변환
    - WOFF2 폰트 활용: WOFF보다 더 작은 크기로 압축 가능
    - 기존 폰트 파일을 WOFF2로 변환하여 로딩 속도 개선
        

---
### 2. 반응 지연, 애니메이션 지연 해결

- **메인 스레드 Blocking 방지**
    - DOM 수정 최소화 (Reflow와 Repaint 단계 제거 노력)
	    - reflow나 repaint가 최근들어서는 리액트에서 최적화를 시켜줌
    - **Reflow 줄이기**
        - Composite 단계에서 동작하도록 GPU 가속 속성 사용
        - 3D Transform (`translate3d`)
        - Video/Canvas 요소 활용
        - `transform`/`opacity` 기반 CSS 애니메이션 (Keyframes, Transition)
        - `will-change` 속성 적용
            
- **중복 계산 줄이기**
    - Memoization (`useMemo`)
	    - 같은 작업이 일어날 확률이 은 계산에 대해서 메모이제이션
	    - 훨씬 빠르게 캐시된 결과를 가져올 수 있도록 함
	    - 리렌더링마다 key value에 보관하고 있는 캐싱 방법
        
- **네트워크 요청 캐시 전략**
    - Service Worker 및 PWA를 활용한 캐싱
        - [참고](https://developers.google.com/web/fundamentals/primers/service-workers#%EC%9A%94%EC%B2%AD_%EC%BA%90%EC%8B%9C_%EB%B0%8F_%EB%B0%98%ED%99%98)
    - Cache Header 전략
    - Stale-while-Revalidate
	    - 어느 순간까지는 캐시에서 가져오고 그 뒤부터는 서버에서 가져올 수 있도록 함
- **Prefetch 및 Preload 활용**
    - **Preload 사용** :
    - 특정 리소스가 사용될 것을 확실히 알고 있을 때, 브라우저가 이를 우선적으로 다운로드
    
    ```
    <link rel="preload" href="/styles/main.css" as="style">
    <link rel="preload" href="/scripts/main.js" as="script">
    ```
    - **Prefetch 사용** :
    - 예측 로딩이나 사용자가 다음에 필요할 리소스를 미리 로드할 때 사용.
	    - react-helmet 등을 사용
        
    
    ```
    <link rel="prefetch" href="/images/background.jpg">
    ```
    

---

# 성능 관점으로 보는 HTTP의 발전

### 1. HTTP/1.1 (1997년)
- TLS 암호화 통신
- Keep-Alive 기본 제공 (TCP 연결 재사용)
- XMLHttpRequest
	- fetch -> Promise패턴이 적용되어 있지만 XMLHttpRequest는 패턴이 안적용돼있음
    

---

### 2. HTTP/1.1의 한계
- 리소스 우선순위 없이 다운로드
- 헤더 크기 증가
- 동시성을 위해 여러 개의 연결(connection) 필요
    

---

### 3. HTTP/2.0 (2015년)

- **HTTP/2.0의 스트림-프레임 관계**
    - 여러 개의 스트림을 동시에 전송 가능
    - 각 스트림은 다수의 프레임으로 구성
        - 예:
            - 스트림 1 → 프레임 A, B, C
            - 스트림 2 → 프레임 X, Y, Z
    - 프레임은 독립적으로 전송되며 고유 ID를 가짐
    - 스트림과 프레임의 독립적 처리를 통해 병렬 데이터 전송 가능
        
- **기능 개선**
    - 다중 요청/응답 처리 (Multiplexing)
    - 헤더 필드 압축 (HPACK)
	    - header packing
    - Server Push 지원
        

---

### 4. HTTP/3 (2020년)

- **QUIC 프로토콜 기반**
    - UDP 위에서 동작하며 TCP의 오버헤드를 제거
    - 3-way Handshake 생략
	    - 접속 정보를 캐싱(RTT) 등을 통해 신뢰성 확보
    - 패킷 손실 복구를 위해 **패킷 재전송 및 일련번호 지정**
- **병렬 처리 강화**
    - 여러 개의 요청과 응답이 하나의 연결에서 동시에 처리
    - 프레임 단위로 분리된 UDP 패킷 사용
- **HTTP/3 적용 사례**
    - 주요 CDN 제공자들이 HTTP/3 지원 (Cloudflare, AWS CloudFront 등)