## 주요 작업
- 파일 구조 일부 수정
- express 연결 및 작동 확인
- 서버에서 html 요소를 보내주는 방식으로 교체
- express와 pug 연결하여 pug 형식으로 템플릿 교체
- 카드 컴포넌트 제작(default)
- 기존 메인페이지 각 컴포넌트화
- nodemon 연결
## 학습 키워드
- 논블로킹/블로킹
- 비동기
- 이벤트루프
- nodejs 디버깅
- express
- JIT 컴파일러

학습정리(1주차)
https://luxurious-share-af6.notion.site/1-baed698a7b3c40bbbd6b94fb1097dc42?pvs=4

## 고민 및 해결과정
### 컴포넌트 사용
기존에 계획했던 방식으로는 컴포넌트를 모두 클래스 객체로 만들어 웹 컴포넌트의 형식으로 shadowDOM에 추가하여 렌더링을 시키는 방식을 구상했었다.

하지만 이후에 금일에는 express와 클라이언트를 연결시키는 과정에서 서버 자체가 페이지의 모든 요소들을 보낼 수 있도록 하게 만들면서 웹 컴포넌트가 어떤 과정으로 렌더링되는지 그 흐름을 보다 알기 어렵게 느껴졌다. 또한, 문자열로 내보내는 html 요소들은 안에서 이벤트 등을 다루기에는 너무 복잡해지면서 나중에는 알아보기도 어려워질 것이라 생각해서 이를 어떻게 할지 고민을 많이 했었다.

이 과정에서 맨 처음 계획했듯이, 카드를 Pug 를 통해서 미리 만들어진 html을 보낼 수 있도록 하려고 했는데, 그냥 모든 html 요소들을 모두 pug로 만들어도 괜찮을 것 같다는 생각에 기존의 메인페이지들을 컴포넌트로 나누고, 이를 pug확장자로 제작하여 서버에서 응답으로 보내도록 구상하였다.

```pug
style
    | @import url('/app/css/app.css')
.body
    include ../shared/card/component/card.pug
    include ../shared/section/component/section.pug
    header TASKIFY
    main
        +section("해야 할 일")
        +section("하고 있는 일")
        +section("완료한 일")

```

pug의 mixin과 attribute, include와 같이 가독성이 훨씬 좋은 장점이 있어 아직까지는 컴포넌트를 만들면서 그렇게 문제가 되는 점은 발견하지 못했다. 나중에는 이를 발전시켜 해당 pug로 만들어진 html 요소를 어떻게 동적으로 관리할 수 있을지 고민해봐야 될 것 같다.