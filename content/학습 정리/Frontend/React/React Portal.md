## React Portal
React에는 참 신기한게 많다.
별별 것들을 다 해놓고 라이브러리라고 우기는게 되게 초보 사냥터에서 독식하는 고인물같다..

암튼 React Portal은 부모 컴포넌트의 DOM 계층 구조 바깥에 있는 DOM 노드로 자식을 렌더링하는 방식을 제공한다. 간단하게 생각해보자면 자식 컴포넌트를 다른 곳에 갖다 전달할 수 있다는 뜻이다. 

### 왜 사용할까?
React의 트리 구조에 따라서 부모 컴포넌트가 렌더링 될 경우에 자식 요소 또한 따라서 렌더링 될 수밖에 없다. 하지만 만약 자식 요소가 바뀌지 않는다면 굳이 렌더링을 다시 할 필요가 없고, 성능을 떨어뜨리는 원인밖에 되지 않으므로 포탈을 사용한다.

그렇게 포탈로 자식 컴포넌트를 바깥에 내놓음으로써 이러한 문제를 해결함과 동시에 DOM 요소에서는 부모-자식관계처럼 보이지만 이를 독립적으로 관리할 수 있기 때문에 사용한다.

### 사용하기
#### createPortal(children)
```js
<div>
  <SomeComponent />
  {createPortal(children, domNode, key?)}
</div>

// 적용 예시
import { createPortal } from 'react-dom';

// ...

<div>
  <p>This child is placed in the parent div.</p>
  {createPortal(
    <p>This child is placed in the document body.</p>,
    document.body
  )}
</div>
```
포탈을 사용하기 위해서는 **createPortal**을 실행하여 포탈을 생성해야 한다.
-  children: JSX 조각 (예: `<div />` 나 `<SomeComponent />`), Fragment (`<>...</>`), 문자열이나 숫자, 또는 이들의 배열과 같이 React로 렌더링할 수 있는 모든 것.
- domNode: `document.getElementById()`가 반환하는 것과 같은 일부 DOM 노드. 노드는 이미 존재하고 있어야 한다. 업데이트 중에 다른 DOM 노드를 전달하면 포털 콘텐츠가 다시 생성된다
- **선택적** `key`: 포털의 키로 사용할 고유 문자열 또는 숫자
이렇게 포탈을 생성하면 반환값으로 React node를 반환한다. 리액트는 렌더링 중에 이 포탈로 만들어진 React node를 보면 제공된 `children`을 설정한 `domNode` 안에 배치한다.

따라서 위와 같은 예시로 포탈을 만들게  되면 현재 코드 상에서 `<p>This child is placed in the document body.</p>`는 현재 우리가 보는 것과 같이 div 태그의 자식 요소처럼 보이지만 실제로 렌더링 할 때를 보면 다르다.
```js
<body>
  <div id="root">
    ...
      <div style="border: 2px solid black">
        <p>This child is placed inside the parent div.</p>
      </div>
    ...
  </div>
  <p>This child is placed in the document body.</p>
</body>
```
마치 이런식으로 포탈을 통해 뿅~ 넘어간 뒤 document의 body쪽으로 이동한 것이다.
