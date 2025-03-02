JSX는 주로 우리가 리액트에서 사용하는 확장자명이다.
페이스북에서 JSX를 리액트 만들면서 새롭게 만들기도 했지만, 그렇다고 무조건 리액트에서만 쓰이는 구문은 아니라는 점을 알아야 한다.
JSX는 기존 자바스크립트를 확장한 문법으로, 공식적인 문법은 아니기 때문에 바벨을 사용하여 트랜스파일링할 필요가 있다.

### React Automatic Runtime
리액트 자동 런타임은 활성화되어있을 경우 자동적으로 runtime 파일을 import 해와 JSX를 컴파일하는 함수를 알아서 불러오고, 이를 실행한다.

 ```js
 const profile = (
  <div>
    <img src="avatar.png" className="profile" />
    <h3>{[user.firstName, user.lastName].join(" ")}</h3>
  </div>
);
```
이런 식으로 된 jsx 문법을  babel은 `@babel/plugin-transform-react-jsx`이라는 컴파일 플러그인을 통해서 컴파일시킬 수 있다.
```js
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";

const profile = _jsxs("div", {
  children: [
    _jsx("img", {
      src: "avatar.png",
      className: "profile",
    }),
    _jsx("h3", {
      children: [user.firstName, user.lastName].join(" "),
    }),
  ],
});
```
그렇게 바뀐 코드는 이러한 형태로 나오게 된다.
여기서 babel은 따로 런타임 import에 대해 따로 설정을 해놓지 않았을 경우 기존 react의 jsx-runtime을 사용하여 컴파일한 결과를 내보낸다.
```js
/** @jsxImportSource custom-jsx-library */

const profile = (
  <div>
    <img src="avatar.png" className="profile" />
    <h3>{[user.firstName, user.lastName].join(" ")}</h3>
  </div>
);
```
만약 내가 커스텀한 jsx 라이브러리로 만들기 위해서는 위에 주석처럼 따로 경로디렉토리를 설정해주면 해당 경로의 jsx-runtime에서 가져와 사용한다.
```js
// 결과
import { jsx as _jsx } from "custom-jsx-library/jsx-runtime";
import { jsxs as _jsxs } from "custom-jsx-library/jsx-runtime";

const profile = _jsxs("div", {
  children: [
    _jsx("img", {
      src: "avatar.png",
      className: "profile",
    }),
    _jsx("h3", {
      children: [user.firstName, user.lastName].join(" "),
    }),
  ],
});
```

### React Classic Runtime
Classic Runtime의 경우, v7혹은 그 이전 바벨의 버전에서는 디폴트로 설정되어있는 기능이다.
```js
const profile = (
  <div>
    <img src="avatar.png" className="profile" />
    <h3>{[user.firstName, user.lastName].join(" ")}</h3>
  </div>
);
```
얘는 React의 Runtime을 import해와서 사용하기보다는 React자체를 불러오고, createElement를 그대로 가져와서 사용한다.
```js
const profile = React.createElement(
  "div",
  null,
  React.createElement("img", { src: "avatar.png", className: "profile" }),
  React.createElement("h3", null, [user.firstName, user.lastName].join(" "))
);
```
이러한 Classic Runtime을 커스터마이징 하기 위해서는 맨 위에 주석처럼 
```js
/** @jsx Preact.h */
```
과 같이 써주면, jsx 옆 모듈의 함수를 가져와 쓸 수 있도록 할 수 있다.
```js
/** @jsx Preact.h */

import Preact from "preact";

const profile = (
  <div>
    <img src="avatar.png" className="profile" />
    <h3>{[user.firstName, user.lastName].join(" ")}</h3>
  </div>
);
```
그렇게 되면 내가 설정한 라이브러리에서 모듈을 가져와 사용할 수도 있는 형태가 된다.
import문을 통해 미리 모듈을 import해주지 않으면 예상대로 동작하지 않으니 주의해야 한다.
```js
/** @jsx mhreact.createElement */

import mhreact from "mhreact";

const test = (
  <div id="app">
    <p>안녕하세요</p>
    <div>
      <p>테스트</p>
      <div>
        <p>테스트2</p>
      </div>
    </div>
  </div>
);

console.log(test);

```
이를 활용하여 mhreact라는 라이브러리를 만들고, 클라이언트의 의존성에 추가해준 뒤에 import해오고, createElement라는 함수를 가져와 jsx 형식에서 작성된 html 요소들을 변환해주었다.
```js
/** @jsx mhreact.createElement */

import mhreact from "mhreact";
var test = mhreact.createElement(
  "div",
  {
    id: "app",
  },
  mhreact.createElement("p", null, "\uC548\uB155\uD558\uC138\uC694"),
  mhreact.createElement(
    "div",
    null,
    mhreact.createElement("p", null, "\uD14C\uC2A4\uD2B8"),
    mhreact.createElement(
      "div",
      null,
      mhreact.createElement("p", null, "\uD14C\uC2A4\uD2B82")
    )
  )
);
console.log(test);

```
변환하게 되면 이와 같이 바벨이 트랜스파일링을 해준 다음에 그 결과를 createElement의 인자로 들어가는 로직으로 변경되었다.



https://d2.naver.com/helloworld/2690975
