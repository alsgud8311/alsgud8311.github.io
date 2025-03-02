## 주요 작업
- 기본적인 ui 제작중
- 아이콘 컴포넌트들 제작
- ui 제작 과정에서 필요한 더미 데이터 제작
- 애니메이션 조금 하다가 미룬이..ㅎ
## 학습 키워드
- Fsd
- css grid
- animation
- tailwindcss

## 고민 및 해결과정
### 아이콘의 컴포넌트화 
```js
	<svg
            width="24"
            height="22"
            viewBox="0 0 24 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.0554 2.41708C19.7228 2.69364 20.3292 3.099 20.84 3.60999C21.351 4.12075 21.7563 4.72718 22.0329 5.39464C22.3095 6.0621 22.4518 6.77751 22.4518 7.49999C22.4518 8.22248 22.3095 8.93789 22.0329 9.60535C21.7563 10.2728 21.351 10.8792 20.84 11.39L19.78 12.45L12 20.23L4.22 12.45L3.16 11.39C2.1283 10.3583 1.54871 8.95903 1.54871 7.49999C1.54871 6.04096 2.1283 4.64169 3.16 3.60999C4.19169 2.5783 5.59096 1.9987 7.05 1.9987C8.50903 1.9987 9.9083 2.5783 10.94 3.60999L12 4.66999L13.06 3.60999C13.5708 3.099 14.1772 2.69364 14.8446 2.41708C15.5121 2.14052 16.2275 1.99817 16.95 1.99817C17.6725 1.99817 18.3879 2.14052 19.0554 2.41708Z"
              stroke="black"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
```
기존의 svg는 이와 같은 형태로 되어있다.

svg를 활용하는 방법은 다양하다. 
가장 쉬운 방법은 img 태그의 src 속성으로 가져오는 것이다.
img 태그의 `src` 속성으로 해당 svg를 그대로 import 해와도 아이콘은 정상 작동한다. 하지만 이런 경우 이미지로 svg가 들어가기 때문에 tint-color 와 같은 부분을 바꿀 수 있는 방법이 어렵다.  `filter`로 색상을 조절할 수는 있지만 이와 같은 경우 따로 설정이 필요하기 때문에 번거롭다고 생각했다.

나는 이러한 방법이 번거롭다고 생각했기 때문에 차라리 이를 컴포넌트화시키면 어떨까? 하고 생각해보았다.
```tsx
import { IconProps } from "./iconPropsType";

export const NewspaperIcon = ({ className, size }: IconProps) => {
  return (
    <svg
      width={size === "l" ? "24" : "16"}
      height={size === "l" ? "24" : "16"}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 3.75V18.5C19.9998 18.6249 20.0463 18.7455 20.1305 18.8378C ... 75 6.497Z"
        fill="#14212B"
        className={className}
      />
    </svg>
  );
};

```
이와 같이 사이즈는 기획서에 명시된 대로 `16px`과 `24px`밖에 없기 때문에 사이즈를 두가지로 나누어 삼항연산자를 통해 구분해줘도 괜찮을 것 같다고 생각했다.

하지만 각 컴포넌트에 대해서 굳이 하나씩 만들어줘야 하기 때문에 다소 불편하다는 느낌이 없잖아 있었다.
현재는 그렇게 많지는 않아서 괜찮았지만 나중에 아이콘들이 훨씬 많아진다면 enum처럼 관리하면서 각 아이콘의 path attribute인 d만 관리해서 사용할 수 있지 않을까? 하는 생각이 있다 .

### 리뷰 요청
안녕하세요 멘토님! 고생 많으십니다ㅎㅎ
오늘은 ui 구성하면서 애니메이션이 낯설어서 계속 헤매다가 크게 진전된게 없네요ㅎㅎ..
금일 리뷰 요청드리고 싶은 것은 폴더 구조입니다.
```json
client
   ├─ .prettierrc
   ├─ README.md
   ├─ eslint.config.js
   ├─ index.html
   ├─ package-lock.json
   ├─ package.json
   ├─ postcss.config.js
   ├─ public
   │  └─ fonts
   ├─ src
   │  ├─ app
   │  │  └─ App.tsx
   │  ├─ entities
   │  │  ├─ PressItem
   │  │  │  ├─ api
   │  │  │  ├─ index.tsx
   │  │  │  ├─ lib
   │  │  │  ├─ model
   │  │  │  └─ ui
   │  │  │     └─ pressItem.tsx
   │  │  ├─ article
   │  │  │  ├─ api
   │  │  │  ├─ lib
   │  │  │  ├─ model
   │  │  │  └─ ui
   │  │  │     └─ article.tsx
   │  │  ├─ autoRollingNews
   │  │  │  ├─ api
   │  │  │  ├─ index.tsx
   │  │  │  ├─ lib
   │  │  │  │  └─ dummy.ts
   │  │  │  ├─ model
   │  │  │  │  └─ useNewsData.ts
   │  │  │  └─ ui
   │  │  │     ├─ autoRollingNews.tsx
   │  │  │     ├─ autoRollingNewsItem.tsx
   │  │  │     └─ shortNews.tsx
   │  │  ├─ category
   │  │  │  ├─ api
   │  │  │  ├─ lib
   │  │  │  ├─ model
   │  │  │  └─ ui
   │  │  ├─ mainArticle
   │  │  │  ├─ api
   │  │  │  ├─ lib
   │  │  │  ├─ model
   │  │  │  └─ ui
   │  │  ├─ newsHeader
   │  │  │  ├─ api
   │  │  │  ├─ index.tsx
   │  │  │  ├─ lib
   │  │  │  ├─ model
   │  │  │  └─ ui
   │  │  │     └─ newsHeader.tsx
   │  │  └─ subArticle
   │  │     ├─ api
   │  │     ├─ lib
   │  │     ├─ model
   │  │     └─ ui
   │  ├─ features
   │  ├─ index.css
   │  ├─ main.tsx
   │  ├─ shared
   │  │  ├─ lib
   │  │  │  ├─ getToday.ts
   │  │  │  └─ index.ts
   │  │  └─ ui
   │  │     ├─ alert.tsx
   │  │     ├─ badge.tsx
   │  │     ├─ button.tsx
   │  │     ├─ header.tsx
   │  │     ├─ icons
   │  │     │  ├─ chevron-right.tsx...
   │  │     ├─ index.tsx
   │  │     ├─ logo.tsx
   │  │     └─ todaysDate.tsx
   │  ├─ vite-env.d.ts
   │  └─ widgets
   │     ├─ articles
   │     │  ├─ api
   │     │  ├─ lib
   │     │  ├─ model
   │     │  │  ├─ dummy.json
   │     │  │  └─ dummy.ts
   │     │  └─ ui
   │     │     └─ ariticles.tsx
   │     └─ subArticles
   │        ├─ api
   │        ├─ lib
   │        ├─ model
   │        └─ ui
   ├─ tailwind.config.js
   ├─ tsconfig.app.json
   ├─ tsconfig.json
   ├─ tsconfig.node.json
   └─ vite.config.ts
```
현재 저의 폴더구조입니다.
저는 이번 프로젝트를 통해서 비즈니스 로직, 데이터, ui등 관심사를 분리하기 위해 `fsd 패턴`의 요소를 일부 가져와 활용하려고 합니다.
하지만 막상 관심사를 분류하라! 라고 했을 때 무엇을 어떻게 나누어야 할까?에 대한 고민이 계속 듭니다. 아직은 관심사에 대한 개념 자체가 부족한 것 같습니다.

현재 제가 계획하고 있는 바로는 크게 보았을 때(layer)
- entities : 비즈니스 로직을 담고 있는 독립적인 데이터들을 다루는 컴포넌트(api fetch)
- widget: entities들이 모여 하나의 섹션, 즉 페이지에서 활용하는 큰 단위의 독립적 컴포넌트들. entities들을 묶고 하위 entites로 필요한 state를 내려주는 역할
- feature: 각 컴포넌트에 부여될 수 있는 이벤트들을 도메인별로 묶어 놓는 디렉토리
- app : 엔트리 포인트이자 전역 스타일, 현재는 단일 페이지므로 해당 app에 안쪽 요소를 채워넣을 예정
- shared: 공통적으로 어디서나 쓰일 수 있고 데이터를 담고 있지 않는 컴포넌트들
이 정도로 디렉토리를 나누었고, entitie나 widgets의 경우는 컴포넌트별로 디렉토리를 나누었습니다.

하위 디렉토리로는
- ui: 기본적인 디자인 요소
- api: 필요한 api fetching하는 함수들
- lib: 컴포넌트에서 필요한 유틸함수들
- model: 비즈니스적인 로직
을 담고 있습니다.

여기서 질문드리고 싶은 점은
- ~~전체적인 디렉토리의 구조를 통해 관심사 분리가 잘 이루어지고 있는지 궁금합니다.~~
	- 이 부분은 아직 제대로 완성된 게 없다보니 나중에 다시금 피드백 요청드리겠습니다.
- 비즈니스적인 로직은 api와는 다른가?
	- 여러 자료들을 찾아보았음에도 아직도 비즈니스 로직과 api 호출의 과정을 명확하게 구분짓는 것이 머릿속에서는 어렵습니다. 
	- fsd 패턴대로라면, 만약 블로그 서비스에서 어떤 글을 작성한다고 칠 때,
		- 작성 버튼을 눌렀을 때 실행되어야 하는 함수 -> feature의 함수
		- 작성 버튼을 눌렀을 때 실행된 함수 안에서 api 호출 및 에러에 대한 처리, navigate 등 -> 비즈니스 로직
		- state로 관리하는 작성하는 글의 데이터(제목, 본문 등) -> model
		- 오로치 fetch만 하는 함수 -> api
	- 이런 식으로 이해했는데, 제가 이해한 비즈니스 로직과 api, 모델의 방향이 맞는지 궁금합니다.

오늘은 많이 한 것이 없어 이것만 따로 질문드립니다ㅠ.ㅠ 다음번엔 조금 더 준비해서 가져와보도록 하겠습니다..! 
감사합니다 좋은 하루 되세요☺️