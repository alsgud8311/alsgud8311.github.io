## 주요 작업
- 라이브러리
	- useState 설계 및 구현
		- function 형태의 state구현
		- state를 destructuring하는 과정을 파악하고 구조분해 할당에 대한 해결방법 고안
		- setter함수를 통한 상태 갱신
		- 파이버 생성 단계에서 갱신된 state가져오기
	- 멘토님 리뷰 반영
## 학습 키워드
- 즉시 실행 함수
- useState
## 고민 및 해결과정
### useState의 동작 방식과 이에 따른 렌더링 로직
기존에 내가 짠 로직을 보자
```js
import { Root } from "../dom/DomRoot";

/**
 *
 * @param {any} initialState
 * @returns {[any, function]}
 */
export function useState(initialState) {
  let state = initialState;

  
  const setState = (function () {
    const hostRoot = Root();
    // 클로저로 state에 해당하는 index를 setState에 묶어두기
    return function (value) {
      state = value;
      hostRoot.reRender();
    };
  })();

  return [state, setState];
}
```
내가 처음 짠 useState를 보면  initialState를 state라는 변수에 할당해놓고 반환하며, setState는 즉시 실행 함수를 통해 state의 값을 갱신해준 다음 리렌더링을 시키도록 로직이 짜여져 있다.

하지만 이러한 로직의 경우
- 여러 개의 state관리가 불가능
- 한 state에 여러번의 setState가 일어날 경우 반복해서 리렌더링
- 리렌더링한 후에 갱신된 결과를 알지 못함
등의 문제를 가지고 있다.
이러한 문제들을 하나씩 보완해가면서 구현을 완성시키려고 한다.

#### 문제: 리렌더링한 후에 갱신된 결과를 알지 못함
해당 문제는 state에서 가장 중요하게 생각하는 문제라 해당 문제부터 해결해야 했다. 값이 변해도 리렌더링 과정에서 새롭게 바뀐 값을 렌더링시키지 않는다면 state의 의미 자체가 없기 때문이다.

기존 내가 만든 jsx 프로젝트의 jsx 트랜스파일링된 결과를 보면
```js
import * as mhReact from "mhreact";
export default function Mainpage() {
  var _mhReact$useState = mhReact.useState(1),
    _mhReact$useState2 = _slicedToArray(_mhReact$useState, 2),
    numbers = _mhReact$useState2[0],
    setNumbers = _mhReact$useState2[1];
  function onClickButton() {
    console.log("click");
    setNumbers(5);
  }
  return mhReact.createElement("div", null, mhReact.createElement("h1", null, "\uBBFC\uD615\uC774\uC758 \uD22C\uB450\uB9AC\uC2A4\uD2B8"), mhReact.createElement("input", {
    type: "text",
    placeholder: "\uD560 \uC77C\uC744 \uC4F0\uC790"
  }), mhReact.createElement("button", {
    onClick: onClickButton
  }, numbers));
}
```
이런 식으로 내가 useState를 호출했을 때 나오는 리턴값인 배열을 구조분해할당 하는 모습을 볼 수 있다.
이러한 구조분해 할당을 통해 원시값을 state로 설정해놓은 numbers의 경우 numbers에는 원시값이 들어오게 되고, 원시값은 기존의 값이 변해도 새롭게 할당하지 않는 이상 변화를 알 수 없다는 점이 리렌더링된 element가 바뀐 state를 알 수 없는 문제를 낳았다.

#### 시도1 : rootFiber에서 global로 state관리
rootFiber에 global property를 두고 해당 객체에 states 프로퍼티를 두려고 했는데 rootFiber가 null값이 나왔다.
생각해보니 useState에 fiber를 두게 되면 가장 처음 root를 Render할 시점만 해도 fiber가 만들어지지 않은 상태이기 때문에 UseState안에서 싱글톤 패턴으로 만들어진 rootFiber를 가져오게  되면 null값이 뜰 수밖에 없었다.
그렇다면 이 useState를 어디서 가져와야 할까?

#### 시도2: root에서 global로 state관리
root에서 global이라는 프로퍼티를 두고, 여기서 각 state를 인덱스 : 값의 쌍으로  저장해놓으면 전역에서 모든 state들을 관리할 수 있기 때문에 효율적이지 않을까 생각했다.
이렇게 되면 각 컴포넌트에서 만약 사용하는 state의 경우에는 transpiling 과정에서 해당 state를 통해 해당 참조값을 가져올 수 있도록 해야 한다.
```js
state = root.global.states[index]
```
따라서 useState에 이런 식으로 state값을 내보내도록 하려고 했는데, 문제는 해댕하는 인덱스를 키값으로 갖는 value가 갱신이 되었음에도 리렌더링 하는 과정에서 제대로 참조를 못하고 있었다.
이 또한 구조분해할당으로 각 값을 계속 원시값으로 가지게 되서인 것으로 보인다.

따라서 나는 state를 함수로 만들어 보았다.
```js
import { Root } from "../dom/DomRoot";
import { RootFiber } from "../dom/rootFiber";

/**
 *
 * @param {any} initialState
 * @returns {[any, function]}
 */
export function useState(initialState) {
  const root = Root();
  if (!root.global.hasOwnProperty("states")) {
    root.global.states = {};
    root.global.statesIdx = 0;
  }

  const index = root.global.statesIdx;
  if (!root.global.states.hasOwnProperty(index)) {
    root.global.states[index] = initialState;
  }
  // state = root.global.states[index]
  const state = () => {
    console.log('루트',root); 
    return root.global.states[index]
  }
  const setState = (function () {
    // 클로저로 state에 해당하는 index를 setState에 묶어두기
    const currentIndex = index;
    return function (value) {
      if(typeof value === 'function'){
        root.global.states[currentIndex] = value(root.global.states[currentIndex])  
        root.reRender();
      } else{
        root.global.states[currentIndex] = value;
        console.log("state Changed", root.global.states[currentIndex]);
        root.reRender();
      }
    };
  })();

  root.global.statesIdx++;

  return [state, setState];
}
```
함수를 활용하게 될 경우에는 구조분해할당이 이루어지지 않기 때문에 root에 담겨있는 state들을 참조할 수 있다.

현재는 함수를 활용하는 방식을 사용하고 있지만 점점 할수록 문제가 하나둘씩 튀어나왔다.
#### map이 jsx로 변환될 때 나중에 변환하는 과정
```js
<TodoList todoList={todo} />
...
export default function TodoList({ todoList }) {
  return (
    <ul>
      {todoList.map((todo) => (
        <li>{todo}</li>
      ))}
    </ul>
  );
}

```
todo라는 배열로 된 state를 하나 만들고 이를 리액트처럼 데이터를 넘겨줘서 배열에 대해 map시킨 결과물을 모두 렌더링시키도록 만들었다.
```js
export default function TodoList(_ref) {
  var todoList = _ref.todoList;
  return mhReact.createElement("ul", null, todoList.map(function (todo) {
    return mhReact.createElement("li", null, todo);
  }));
}
```
이에 대한 트랜스파일링 결과물은 위와 같이 나온다.
```js
mhReact.createElement(TodoList, {
    todoList: todo
  }));
```
해당 함수는 다른 커스텀 컴포넌트들과 똑같이 상위에서 createElement pragma가 붙는다. 여기서 내가 넘겨준 todo라는 값이 props로 가는 것을 볼 수 있었다.
따라서 이런 props에 대해서 분기처리를 해주어 태그의 attribute로 갈 수 있는 것들을 제외한 것들은 데이터로 넘겨줄 수 있어야 했다.

```js
export function createElement(type, props, ...children) {
  props = devideValidProps(props);
  if (typeof type === "function") {
    if(type.name === "App") return;
    if (props && props.hasOwnProperty("refs")) return type(props.refs);
    return type();
  }
  return new MhElement(type, props, children.flat());
}
```
처음에 분기처리 해본 곳은 createElement였다. 하지만 여기서 컴포넌트에 대해 함수를 비리 실행시키게 된다면 상태를 사용하는 커스텀 컴포넌트에서는 이미 구조분해 할당이 이루어진 상태로 root의 node들이 할당되기 때문에 상태가 반영될 수 없다. 특히나 map 함수를 도는 곳이 있다면 결국 map을 통해 모든 element가 미리 만들어지니 새롭게 렌더링이 이루어지지 않는다.

다음으로는 함수형 컴포넌트의 경우에는 함수 그대로 풀지 않고 두고, 나중에 렌더링을 하는 과정에서 fiber를 만들어낼 때 풀어내면 되지 않을까 생각했다.
```js
export function destructuringFunctionalComponentWithRef(element){
  const duplicated = {}
  Object.entries(element.props.refs).forEach(([ref,val]) => {
    if(typeof val === "function") duplicated[ref] = val();
  })
  return element.type(duplicated)
}
```
이 과정에서도 원래는 element의 ref를 변경했다가 참조되어 있는 객체의 값이 영구히 변했던 문제도 있어 몇시간동안 쩔쩔매다 duplicated라는 객체 리터럴을 통해서 새롭게 복사하여 element를 만들어내도록 했다.

아무튼 이 함수는 `createFiberFromElement`에서 이를 destructuring할 수 있도록 해주었다.
```js
export function createFiberFromElement(
  element,
  parent = null,
  index = 0,
  key = null
) {
  //앞에서 state 없는 애들은 다 풀어놓음
  if (typeof element.type === "function") element = destructuringFunctionalComponentWithRef(element)
  if (typeof element !== "object") {
    parent.textNode = element;
    return null;
  }
...
```
이를 통해 functional component를 만났을 경우, 해당 참조값을 미리 destructuring하지 않게 하도록 하기 위해서 렌더링을 할 때마다 풀고 함수를 실행해서 state값을 가져오도록 했다.
하지만 state를 함수형으로 만들면서 여러가지 문제가 발생했다.
가장 큰 문제는 setter함수에 대해서 콜백을 넣게 되면 prev값을 가져올 수 있도록 하려고 했는데, prev값을 콜백에 인자로 넣는 과정에서 state 함수 자체가 들어가게 되므로, 정상적인 갱신이 아닌 함수형으로만 갱신이 되었다.
```js
const setState = (function () {
    // 클로저로 state에 해당하는 index를 setState에 묶어두기
    const currentIndex = index;
    return function (value) {
      if(typeof value === 'function'){
        root.global.states[currentIndex] = value(root.global.states[currentIndex])  
        root.reRender();
      } else{
        root.global.states[currentIndex] = value;
        console.log("state Changed", root.global.states[currentIndex]);
        root.reRender();
      }
    };
  })();
```
아직 해당 함수의 prev는 제대로 동작하지 않는데, 이를 어떻게 해결해야 할지 계속 고민중에 있다..