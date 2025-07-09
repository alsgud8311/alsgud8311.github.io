## 주요 작업
- 라이브러리
	- useState 보완
		- 이벤트와 attribute, refs를 구분한 뒤 element 생성 과정에서 attribute, event, ref에 따라 별도 처리(devideValidProps)
		- prop 구분별로 배열로 관리
		- useState에 콜백을 넣을 시에 이전 state값을 인자로 들어갈 수 있도록 리팩토링
		- setter함수에서 state가 들어갔을 경우 함수형태의 state값이 제대로 렌더링되지 않는 문제
- 서버
	- db 생성하기
		- firebase firestore를 통해 따로 안하
		- 카드 정보 erd 만들기
	- 기본적인 api 설계 및 구현
		- firebase functions로 서버리스 서버 구축
		- 카드 추가
		- 카드 삭제
		- 카드 수정
		- 카드 조회
## 학습 키워드
- useState
- firestore & firebase functions
## 고민 및 해결과정
### useState가 props로 들어갔을 때 이벤트와 attribute 구분
저번 PR에서 고민했던 state의 참조 문제를 해결하고자 state 자체를 함수화시켜 참조값이 복사되는 문제를 해결하고 그때그때 함수를 호출시켜 참조값을 가져오는 방식으로 state를 바꾸었다.
하지만 이를 해결하는 과정에서
- 렌더링 과정에서 다른 state 안에 state가 들어가 있을 경우 함수가 중첩되어 있기 때문에 하나가 풀리지 않아 제대로 렌더링 되지 않음
- `input`의 value와 같은 attribute에 state값을 넣을 경우 attribute쪽에서 함수인 것을 모르고 렌더링하기 때문에 오류 발생하여 렌더링 되지 않음
과 같은 문제가 발견되었다.

이를 어떻게 하면 해결할 수 있을까 고민하다가 props로 들어오는 요소들에 대해서 구분화할 필요가 있다고 느겼다.
기존의 element 안에서 들어가야 할 요소는
- attribue -> 태그의 속성으로 들어가는 값들
- event -> 함수로 들어가 렌더링 과정에서 이벤트 등록
이 있었고, 추가적으로 커스텀 컴포넌트의 경우에는 내가 받고자 하는 참조 값에 대해 설정해놨을 경우 해당 참조값을 받는 코드가 트랜스파일링 과정에서 생기게 된다.
```js
// 이렇게 커스텀 컴포넌트를 설정했을 경우...
<TodoList todoList={todo} />

//이런 식으로 트랜스파일링 된다.
 mhReact.createElement(TodoList, {
    todoList: todo
  })

//이게 커스텀 컴포넌트가 트랜스파일됐을 때
export default function TodoList(_ref) {
  var todoList = _ref.todoList;
  return mhReact.createElement("ul", null, todoList.map(function (todo) {
    return mhReact.createElement("li", null, todo);
  }));
}
```
트랜스파일링된 형태는 props에 우리가 설정한 커스텀 컴포넌트의 ref 이름이 붙게 되고, 이에 대해서 값을 인자로 넘겨주고 있다.
여기서 상위 컴포넌트는 props를 통해 todoList를 넘겨주고 TodoList는 이를 객체 형태의 인자로 받아 구조분해 할당을 할 수 있음을 알 수 있다.
따라서 나는 이러한 커스텀 컴포넌트가 인자를 요구로 할 때 제대로 값을 함께 넘겨주면서 함수를 실행시켜 줄 수 있도록 props를 `refs`,` events`,` attrs`로 나누어 props를 조금 더 구분화할 수 있도록 하였다.

```js
export function createElement(type, props, ...children) {
  props = devideValidProps(props);
  if (typeof type === "function") {
    if (type.name === "App") return;
    if (props && props.hasOwnProperty("refs"))
      return new MhElement(type, props, children.flat());
    return type();
  }
  return new MhElement(type, props, children.flat());
}
```
createElement에서는 props를 받아 그대로 사용하는 것이 아닌, element를 만들기 전에 미리 props에 대한 전처리 과정을 거치도록 해주었다.
```js
function devideValidProps(props) {
  if (!props) return null;

  const prop = {
    events: {},
    attrs: {},
    refs: {},
  };

  Object.entries(props).forEach(([attr, val]) => {
    if (propList.includes(attr)) {
      prop.attrs[attr] = val;
    } else if (Object.keys(eventHandlers).includes(attr)) {
      prop.events[eventHandlers[attr]] = val;
    } else {
      prop.refs[attr] = val;
    }
  });

  return prop;
}
```
prop이라는 객체 리터럴을 만들고, attr에 들어가야 하는 요소, 이벤트로 들어가야 할 요소, refs로 들어가야 하는 요소를 구분하여 다시금 구조화 시킨 객체를 가지도록 해주었다.
```js
export const propList = ["key", "placeholder", "className", "id", "value"];

export const eventHandlers = {
  // Focus events
  onBlur: "blur",
  onFocus: "focus",
  onFocusIn: "focusin",
  onFocusOut: "focusout",
...
};

```
여기서 propList같은 경우는 배열로 만든데 반해서 `eventHandlers`의 경우에는 addEventListener의 인자로 넣을 때 받는 이벤트의 이름에서 on을 뺀 형태이기 때문에 따로 객체로 만들어서 나중에 DOM 요소를 만드는 과정에서 바로바로 사용할 수 있게 해주었다.
```js
if (typeof element.type === "function")
    element = destructuringFunctionalComponentWithRef(element);
```
refs의 경우 참조 문제를 해결하고자 type 자체에 function으로 그대로 두었었는데, 이를 fiber로 만들기 전에 ref가 있는지를 판단해서 ref와 함께 커스텀 컴포넌트 함수를 실행해주거나 없으면 함수만 실행시켜주도록 설계했다.
```js
export function destructuringFunctionalComponentWithRef(element) {
  const duplicated = {};
  Object.entries(element.props.refs).forEach(([ref, val]) => {
    if (typeof val === "function") duplicated[ref] = val();
    else duplicated[ref] = val;
  });
  return element.type(duplicated);
}
```
물론 ref에도 state가 들어갈 가능성이 있으므로 state를 반환하는 함수를 그대로 유지해놓고, 인자로 넘겨주는 과정에서 duplicated라는 객체 리터럴을 따로 만들어 참조 문제를 해결하였으며, 새롭게 만든 객체 리터럴을 인자로 넘겨주었다.

### 리뷰 요청

안녕하세요 멘토님! 항상 고생 많으십니다ㅎㅎ
오늘 리뷰에서는 어느정도 제가 설계하려던 리액트의 구조가 잡혀 렌더링 과정에 대한 피드백을 받고 싶어 이에 대해서 간략하게 설명을 곁들이고자 합니다.

저의 전반적인 렌더링 과정은 
- createRoot를 통해 지정한 entry point(App)에 대해서 element 생성 후 Root를 싱글톤으로 두고 해당 elements 프로퍼티에 저장
- render를 통해 등록해놓은 element에 대해 render함수 실행
	- render함수가 실행될 때마다 root에 등록해놓은 element를 하나씩 재귀적으로 탐색하면서 fiber를 만들어냄
	- 기존 fiber가 없을 경우,  fiberRoot를 따로 생성하여 싱글톤으로 둠
	- 리렌더링이 일어날 때마다 새롭게 element로부터 fiber를 생성해내고, 새롭게 생성된 fiber와 기존 fiberRoot를 재귀적으로 비교(재조정 과정)
		- 두 fiber가 같을 경우 그대로 유지
		- fiber가 다를 경우 새로운 fiber로 교체
	- 재조정이 끝난 뒤 반환되는 fiber를 기준으로 DOM element를 만들어냄
		- 재귀적으로 탐색하면서 DOM element를 만들고, 해당 element에 맞는  attribute나 event를 붙여주는 작업을 담당
	- 반환받은 DOM element를 가지고 web api인 replaceChild를 통해 DOM을 통채로 교체
와 같은 과정을 가지고 있습니다.

제가 설계한 이 일련의 과정에서 혹시나 보완할 부분이나 피드백 주실 부분이 있다면 말씀해주시면 감사하겠습니다!
항상 정성들여 리뷰해주셔서 감사합니다! ☺️