## 주요 작업
- 라이브러리
	- DOM의 createRoot 설계 및 구현(엔트리 포인트)
	- reconciliation(새로운 Fiber와 기존 Fiber 재조정) 함수 설계 및 구현
		- diff 알고리즘은 아직..
	- render 함수 수정
		- 새로운 파이버를 만들고, 재조정이 필요한 경우 재조정한 후에 DOM에 렌더링하는 과정으로 수정
		- 기존 render함수는 createHTMLElementFromFiber 함수로, 오직 HTML Element만 만드는 과정만 책임질 수 있도록 리팩토링
	- rootFiber 설계 및 구현
		- createRootFiber를 통해 새로운 rootFiber 생성 설계 및 구현
		- getRootFiber를 통해 싱글톤 패턴으로 된 rootfiber를 가져올 수 있도록 구성
		- patchRootFiber를 통해 재조정이 완료된 파이버를 기존의 rootFiber에서 업데이트시켜주는 로직 설계 및 구현
## 학습 키워드

- 오늘도 Virtual DOM과 React Fiber..

## 고민 및 해결과정
### 렌더링 과정에 따른 함수 설계
jsx에서 babel을 통해 트랜스파일링하는 과정에서 각각의 element에 대해서 createElement가 실행되고, 생성된 결과물은 한 객체가 나오게 된다.

문제는 이러한 element 객체에 대해서 언제 어디를 fiber객체로 변환하고 계속해서 렌더링 로직을 관리하는가에 대한 고민이 뒤죽박죽이라 다시금 리액트의 공식문서를 보았다.

![](https://i.imgur.com/WqHqNsk.png)
React의 공식 문서에서 보면 근본적인 entry point가 되는 것은 `index.js`이다. index.js와 index.html을 통해 가장 기본적인 뼈대만을 `index.html`에 만들어 놓고, index.js가 해당 root node를 받아 이를 DOM 자체의 root로 지정한다.

그래서 나는 index.js의 root는 브라우저 자체의 root가 되며 Fiber의 root가 되는 곳은 해당 `root` id를 가진 element 안쪽의 요소가 Fiber의 root가 된다고 이해했다.

SPA(Single Page Application)의 핵심은, 페이지의 이동 없이 깔끔하게 마치 '앱'처럼 이동하는 것이다. 이를 위해서는 근본적인 html 전체적인 template 자체를 갈아끼우는 것이 아니라, html 뼈대 자체는 고정적으로 두되 html template 안에서의 body 부분만 계속해서 DOM을 재구성하고 갈아끼우는 것이라고 생각했다. 따라서 root와 FiberRoot를 따로 두는 것이 보다 설득력이 있다고 생각했다.

```js
import { render } from "./DomRender";

let instance = null;

export function Root(rootNode) {
  if (instance) return instance;
  this.rootNode = rootNode;
  instance = this;
}

Root.prototype.render = (element) => {
  render(element);
};

export function createRoot(domNode) {
  return new Root(domNode);
}
```
따라서 나는 html 뼈대가 되는 root의 경우는 싱글톤 패턴을 이용해 항상 같은 html template을 유지하도록 했으며, render함수를 통해 `App`, 즉 리액트 상의 엔트리 포인트를 렌더링시키는 render함수를 Root instance의 prototype으로 등록해놓았다.
```js
let rootFiber = null;

export function createRootFiber(rootFiber) {
  if (rootFiber) return rootFiber;
  return new RootFiber(rootFiber);
}

export function patchRootFiber(patchedRootFiber) {
  if (rootFiber) return rootFiber;
  rootFiber.patch(patchedRootFiber);
  return rootFiber;
}

export function RootFiber(rootFiberInstance) {
  if (rootFiber) return rootFiber;
  this.rootFiberInstance = rootFiberInstance;
  rootFiber = this;
}

RootFiber.prototype.patch = (patchedRootFiber) => {
  this.rootFiberInstance = patchedRootFiber;
  rootFiber = this;
};
```
rootFiber의 경우에는 리액트 상에서 실질적으로 렌더링이 반복적으로 이루어지는 body 안의 요소들을 Fiber 객체로 만들어놓은 인스턴스이다. 재조정이 일어날 경우 patch를 통해 RootFiber객체를 갈아끼운다.

이렇게 root를 DOMRoot와 FiberRoot를 두개 모두 싱글톤으로 구현한 다음, 이를 실질적으로 적용해보았다.
```js
//index.js
import * as mhReact from "mhreact";
import App from "./app.jsx";

const root = mhReact.createRoot(document.getElementById("root"));
root.render(<App />);
```
index.js는 가장 근본적인 뼈대를 만들어주는 역할을 한다.
react 공식문서에 나왔던 Index의 역할처럼, root라는 id를 가진 element를 받아와 해당 element를 root로 설정하여 해당 element 안에서 계속해서 DOM을 갈아끼울 수 있도록 하였고, 실질적인 안쪽 요소의 엔트리포인트는 `app.jsx`로 설정하였다.
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body id="root"></body>
  <script type="module" src="./bundle.js"></script>
</html>
```
index.html은 정말 기본적인 뼈대만 가지고 있으면서 body태그를 fiberRoot가 들어갈 리액트의 엔트리포인트로 설정해두었다. 
이 엔트리포인트는 script에서 번들링된 코드를 통해 `index.js`를 실행시켜 body 안쪽에서 `<App/>` 엔트리 포인트를 렌더링 시킬 수 있도록 해주었다.
