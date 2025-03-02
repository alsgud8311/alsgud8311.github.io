React의 내부 동작은 크게 네 개의 단계로 구현된다.

- Render 단계: JSX 선언 또는 `React.createElement()`를 통해 일반 객체인 React Element를 생성한다.
- Reconcile 단계: 이전에 렌더링된 실제 DOM 트리와 새로 렌더링할 React Element를 비교하여 변경점을 적용한다.
- Commit 단계: 새로운 DOM Element를 브라우저 뷰에 커밋한다.
- Update 단계: props, state 변경 시 해당 컴포넌트와 하위 컴포넌트에 대해 위 과정을 반복한다.


https://d2.naver.com/helloworld/2690975