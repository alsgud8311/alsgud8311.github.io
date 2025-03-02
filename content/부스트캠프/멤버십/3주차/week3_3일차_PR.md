## 주요 작업
- [x] spa로 로그인 구현 ✅ 2024-09-04
	- 로그인 화면
	- 로그인 에러시 안내문구
	- 로그인 성공시 메인으로 이동
- [x] 에러 핸들링 ✅ 2024-09-04
	- 로그인 에러 상태별로 처리
	- `throw error`를 통한 에러 전파
## 학습 키워드
- [x] 패스포트 모듈 ✅ 2024-09-04
- [x] 로그인 로직 ✅ 2024-09-04
#### 학습정리 종합본
https://luxurious-share-af6.notion.site/3-1f7fcdb0591241f487bdfa6f74f1200a?pvs=4
## 고민 및 해결과정 
### 로그인 페이지 클라이언트 사이드 렌더링 방식으로 구현하기

기본적인 레이아웃 자체는 서버사이드 렌더링으로 구현을 했지만, 각각의 컴포넌트들은 클라이언트 사이드 렌더링으로 구현을 했었다.

하지만 이렇게 클라이언트 사이드 렌더링으로 구현하는 과정에서 views 폴더의 `index.js`파일은 엔트리 포인트를 가리키고, app에서 각 페이지에 대해서 렌더링을 시키도록 했었는데 이 과정에서 만약 로그인이 추가될 경우 경로를 입력할 수 없는 `express.render`의 특성상 서버사이드 렌더링 방식으로 다시금 다른 페이지로 이동시키려면 `index.js`와 `login.js` 파일 모두를 두는 방법밖에 생각이 나지 않았다.

하지만 이렇게 하게 되면 기존의 디렉토리 구조 자체가 무색해질 뿐더러, 기존에 사용하던 Pages 디렉토리는 전혀 필요없는 디렉토리가 되어버리기 때문에 이를 활용할 방법을 고민해보았다.

#### 주소를 받아 동적으로 페이지 렌더링하기
```js
// /app/app.js
import navigation from "../shared/utils/navigation.js";

function entryPoint() {
  const pathName = window.location.pathname;
  console.log(pathName);
  navigation.navigate(pathName);
}

window.onpopstate = navigation.onPageChanged;
document.addEventListener("DOMContentLoaded", entryPoint);
```
기존에 mainpage만 있던 때는 메인 페이지만을 렌더링 시키는 함수를 실행시키는 정도로 app.js를 사용했지만, 로그인 페이지가 추가됨에 따라 이를 pathname에 따라 필요한 페이지를 렌더링 시키도록 방식을 바꿨다.
```js
app.get("/", isLoggedIn, (req, res, next) => {
  res.render("index");
});

app.get("/login", isNotLoggedIn, (req, res, next) => {
  res.render("index");
});
```
따라서 서버에서도 pathname은 다르지만, 모든 페이지들이 entryPoint에서 일어나는 것을 알 수 있다.
이렇게 spa 방식으로 만들면 좋은 점은 아무래도 index만을 엔트리 포인트로 잡기 때문에 다른 pathname으로 접속했을 경우는 전부 클라이언트 사이드에서 제어가 가능하다는 점이다. 따라서 서버가 렌더링하는 것은 기존 index의 레이아웃에 불과하기 때문에 api까지 사용해야 하는 서버의 역할이 분담되는 효과를 가진다.

다시 app.js로 돌아와서, pathname에 따라 spa를 구현하기 위해서는 navigation 객체가 필수적이었다. 왜냐하면
- pathname 관리
- 기존 레이아웃을 재사용하면서 body의 내용만 달라지게 하는 방식
- 페이지 이동에 따른 페이지별 이벤트 핸들러 붙이기/떼기
등의 조건을 갖춰야 했기 때문에 이를 navigation 객체를 만들어 페이지를 이동하는 로직을 담당하도록 했다.

```js
// /shared/utils/navigation.js
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
navigation 객체는 어디서나 페이지 이동에 쓰여야 로직이기 때문에 fsd 계층 중에 shared 계층이 알맞은 자리일 것이라 생각해서 넣어주었다
해당 navigation객체는 등록된 pathname에 따라
1. 기존 레이아웃에서 body를 초기화
2. `history.pushState` 를 활용하여 이전 주소값을 가지고 뒤로가기를 눌렀을 경우 이에 대해서 다시금 올바른 페이지를 렌더링 할 수 있도록 로직 구성
3. 페이지별 렌더링 함수 실행
의 과정을 거친다.
onPageChanged는 기존 페이지가 다른 페이지로 이동할 때마다 실행될 수 있도록 window에 등록해놓은 이벤트핸들러인데, 이는 페이지가 바뀔 때마다 다시금 초기화시키고, 해당 페이지의 해당하는 이벤트 핸들러들을 종합해놓은 모듈을 head에서 떼어냄으로써 에러가 발생하지 않도록 설계했다.

```js
// /feature/index.js
export default (function EventManager() {
  const route = {
    "/login": "/feature/login/index.js",
    "/main": "/feature/main/index.js",
  };
  function attachEvent(pathname) {
    const script = document.createElement("script");
    script.src = route[pathname];
    script.type = "module";
    document.head.appendChild(script);
  }
  function detachEvent(pathname) {
    const script = document.head.querySelector(
      `script[src="${route[pathname]}"]`
    );
    if (script) script.remove();
  }
  return { attachEvent, detachEvent };
})();

```
메인페이지의 이벤트를 종합하여 등록하기만 해주던 feature/index.js는 페이지가 추가됨에 따라 페이지별로 디렉토리를 만들어 depth를 한단계 늘리는 대신에, 페이지별로 index.js를 따로 만들어 해당 페이지에 등록되어야 할 이벤트 위임과 핸들러들을 종합하여 등록할 수 있도록 해주었으며, 이를 절대경로로 설정하여 head의 script로 넣어주는 방식을 사용했다.

