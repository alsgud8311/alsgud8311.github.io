## 주요 작업
- 초기 환경 세팅
	- 서버, 클라이언트, 라이브러리 분리 세팅
	- 클라이언트 
		- 바벨 트랜스파일링 환경 구축
	- 서버 
		- 기본적인 초기 세팅
	- 라이브러리 
		- npm publish 후 클라이언트에서 다운로드하여 사용
- 라이브러리
	- createElement
		- jsx 파일에서 작성된 html element에 대해서 babel 트랜스파일을 통해 객체로 변환
	- navigate
		-  historyAPI를 이용하여 uri만 변경하되, 실제로 페이지 전환은 이루어지지 않도록 설계중

## 학습 키워드
- Virtual DOM
- babel과 webpack
	- 트랜스컴파일 과정
	- jsx 트랜스컴파일

## 고민 및 해결과정
### HistoryAPI를 이용한 SPA 구현하기

지난 taskify 미션에서 나는 SPA 방식으로 구현하고 싶다는 마음이 들어 historyAPI를 따로 찾아본 적이 있었고, 이를 통해 부족하지만 SPA를 구현해보았다.
```js
import Main from "../../pages/main/index.js";
import Login from "../../pages/login/index.js";
import EventManager from "../../feature/index.js";

export default (function navigation() {
  const navigator = {
    "/": Main.render,
    "/login": Login.render,
  };
  function navigate(pathname, prev) {
    document.body.innerHTML = "";
    history.pushState({ pathname: prev }, null, pathname);
    navigator[pathname]();
  }
  function onPageChanged(event) {
    document.body.innerHTML = "";
    EventManager.detachEvent(event.pathname);
    navigator[window.location.pathname]();
  }
  return {
    navigate,
    onPageChanged,
  };
})();
```
해당 미션에서 나는 SPA 구현 자체를 클라이언트 단에서 모두 관리할 수 있도록 하였다. 따라서 유틸함수에 navigation을 넣어놓고 navigator를 클로저로 관리하면서 페이지 별로 render함수를 두었다(페이지별 render 함수 내부에는 다시 하위 컴포넌트들의 render 함수가 포함되어 있다). 

하지만 이번 미션의 경우 따로 이러한 SPA를 구현하는데 필요한 함수들을 라이브러리로 분리하여 관리해야 한다고 느꼈으며, 그런 경우에 기존에 등록해놨던 uri별 render 함수는 virtualDOM과 연결시켜 어떤 방식으로 구현해야 할지에 대해서 고민이 되었다. 

아직까지는 virtualDOM또한 트랜스파일링을 통해 객체로 변환시키는 작업밖에 하지 못했기 때문에 이러한 점을 고려하면서 navigate의 작동 방식이 어떻게 가야할 지에 대한 고민은 아직까지는 해결되지 않았다.
virtual DOM의 설계 및 구현 방식에서  navigate또한 염두에 두고 설계할 예정이다.
