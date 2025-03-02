## 주요 작업
- 라이브러리
	- 가상DOM을 위한 설계 및 구현
		- React.createElement -> ReactDOM.render -> React.createFiberFromElement
		- React.createElement(element에 대한 가상 DOM) 설계 및 구현
		- ReactDOM.render(element에 대해서 html element로 바꾸어주는 모듈) 설계 및 구현
		- React.createFiberFromElement(ReactDOM.render에서 렌더링을 위한 파이버 객체) 설계 및 구현

## 학습 키워드
- Virtual DOM과 React Fiber
- 생성자 함수

## 고민 및 해결과정

### React의 함수형 컴포넌트에 대한 createElement와 Fiber객체 설계 및 구현
React는 기존에 createElement를 통해 각 Element에 대한 정보들을 가지는 객체를 생성한다. 
하지만 이 객체가 ReactDOM.render에 바로 사용되는 것이 아니고, ReactDOM.render함수 안에서 파이버를 생성하고, 그 파이버를 참조하여 tree를 만든 후에 기존의 root fiber와 비교하여 reconciliation 과정을 거쳐 새롭게 업데이트된 DOM을 렌더링 하여 보여주게 된다.

이러한 과정을 구현하기에 앞서서, 함수형으로 되어있는 컴포넌트의 경우에 대해서 어떻게 jsx변환이 이루어지는지와 이에 대한 해결 방안을 생각해보았다.
```js
/** @jsx mhreact.createElement */

import mhreact from "mhreact";
export function Test() {
  return <div>컴포넌트 테스트</div>;
}

//트랜스파일링
...

/** @jsx mhreact.createElement */

import mhreact from "mhreact";
export function Test() {
  return mhreact.createElement(
    "div",
    null,
    "\uCEF4\uD3EC\uB10C\uD2B8 \uD14C\uC2A4\uD2B8"
  );
}
```
커스텀 컴포넌트를 만든 후 적용시켜 보았다.
```js
{
  type: 'div',
  props: { id: 'app', className: 'wow' },
  children: [
    { type: [Function: Test], props: null, children: [] },
    { type: 'p', props: null, children: [Array] },
    { type: 'div', props: null, children: [Array] }
  ]
}
```
하나의 컴포넌트에서 이렇게 커스텀 컴포넌트를 넣었을 경우, type에는 function이 나오게 된다.
하지만 type에 함수가 오게 된다면 children에 와야 할 안쪽 자식들은 아무것도 오지 않았다. 
```js
mhreact.createElement(Test, null),
```
커스텀 컴포넌트를 import해와서 사용한 곳에는 함수 그 자체가 들어가기 때문이다.
따라서 이 함수를 풀어서 createElement쪽에 들어갈 수 있도록 해주어야 한다.
```js
{
        type: 'div',
        props: { id: 'app', className: 'wow' },
        children: [
          { type: [Function: Test], props: null, children: [] },
          { type: 'p', props: null, children: [Array] },
          { type: 'div', props: null, children: [Array] }
        ]
      }
```

```js
export function createElement(type, props, ...children) {
  if (typeof type === "function") {
    return type();
  }
  return new MhElement(type, props, children);
}

export function MhElement(type, props, children) {
  this.type = type;
  this.props = props;
  this.children = children;
}

```
이를 해결하기 위해 함수형같은 경우는 따로 함수를 미리 실행시켜놓고 createElement의 결과로 나오는 값이 children과 같은 알맞은 위치에 같은 데이터가 들어갈 수 있도록 하였다.
추가적으로 Element는 생성자 함수를 통해 객체화시켰다.
```js
export function FiberNode(type, key = null) {
  this.type = type;
  this.key = key;
  this.state = null;
  this.textNode = null;
  this.props = null;
  this.index = null;

  //fibers
  this.child = null;
  this.sibling = null;
  this.return = null;
}
```
이를 통해 Fiber 객체를 생성하는 로직과 Fiber 객체 자체 또한 생성자 함수로 구현해주었다.
초깃값이 대부분 null로 되어있는 이유는 MhElement 객체에 대해 재귀적으로 실행하면서 Fiber객체를 생성하는 과정에서 그때그때마다 element를 보고 객체를 업데이트시켜주어야 하기 때문이다.


### 리뷰 요청
안녕하세요. 멘토님. 고생 많으십니다!
이번 리뷰에서는 아직 학습할 것들이 많아 학습에 많은 시간을 쏟은 탓에 많이 하지 못했습니다,,
다음 리뷰에서는 보다 질문을 정리해서 말씀드리겠습니다!
편하게 봐주시고 전체적인 피드백만 해주시면 감사하겠습니다 :)