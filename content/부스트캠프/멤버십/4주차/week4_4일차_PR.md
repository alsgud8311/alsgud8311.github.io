## 주요 작업
- [x] 에러처리 보완 ✅ 2024-09-12
	- 서버
		- 요청 객체 유효성 검사 Validation Error 추가
		- 에러별로 명시 명확화
	- 클라이언트
		- 에러화면 띄우기
			- 각 코드에 따라 다른 메세지 띄우기
- [ ] 컬럼 추가 기능
	- 테스트 코드 추가 

## 학습 키워드
- express async middleware
- FLUX 패턴
- 요청과 응답 객체
https://luxurious-share-af6.notion.site/4-aba822d7763544a5ad64778df911c630?pvs=4

## 고민 및 해결과정
### 클라이언트 오류 처리 문제
클라이언트의 오류의 경우 각각의 오류에 대해 어떻게 처리해줘야 하는지에 대해 고민이 있었다.

http 메서드를 실행하는 부분을 apicall이라는 유틸 함수로 만들었지만, 해당하는 함수를 이용하여 api를 호출하는 부분의 경우를 try~catch문으로 잡는다면 해당 유틸함수는 http 요청과 처리 두 가지 역할을 모두 한다는 점이 걸리기도 했고, http를 요청하고 받은 오류 중에서는 401 unauthorized나 400 Bad Request 등 400번대의 에러는 catch문으로 잡지 못한다는 단점이 있었다.

```js
import errorModal from "../errorModal/index.js";

function apiCall() {
  async function get(uri, eventHandler) {
    console.log("api_get", uri);
    const response = await fetch(uri, {
      method: "GET",
    });
    if (!response.ok) handleError(response.status);
    const { data, path } = await response.json();
    if (eventHandler) return eventHandler();
    return { data, path };
  }

  async function post(uri, body, eventHandler) {
    console.log("api_post", uri);
    const response = await fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) handleError(response.status);
    if (eventHandler) return eventHandler();
  }

  async function deleteMethod(uri, eventHandler) {
    console.log("api_delete", uri);
    const response = await fetch(uri, {
      method: "DELETE",
    });
    if (!response.ok) handleError(response.status);
    if (eventHandler) return eventHandler();
  }

  async function patch(uri, body, eventHandler) {
    console.log("api_patch", uri);
    const response = await fetch(uri, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) handleError(response.status);
    const data = await response.json();
    if (eventHandler) eventHandler();
    return data;
  }

  function handleError(statcode) {
    const status = {
      400: "내용을 다시 확인해주세요!",
      401: "사용자 정보를 확인할 수 없어요ㅠ.ㅠ",
      404: "요청한 데이터를 찾을 수 없어요ㅠ.ㅠ",
      500: "서버 오류가 발생했어요 ㅠ.ㅠ",
      default: "예상치 못한 오류가 발생했어요 ㅠㅠ",
    };
    throw new Error(status[statcode]);
  }
  return {
    post,
    get,
    deleteMethod,
    patch,
  };
}

export default apiCall();

```
이에 api를 요청하는 함수에서 try~catch문을 사용하고, api call의 경우는 fetch를 한 후 `response.ok`를 통해 200번대의 상태 코드로 반환되는 것들과 400번대의 오류를 구분하여 400번대 status code를 받았을 경우엔 error에 적절한 메시지를 넣어 던짐으로써 api 호출 함수의 catch문에서 잡을 수 있도록 하였다.

```js
import pug from "../utils/pugCompile.js";
import template from "./ui/index.js";

function errorModal(message) {
  function onCickHandler() {
    const button = document.querySelector(
      ".errorConfirmWrapper__button--conFirmButton"
    );
    button.addEventListener("click", () => {
      document.querySelector(".errorModalBackground").remove();
    });
  }

  function render(message) {
    const component = pug.compiledToFunction(template);
    const modalWrapper = document.createElement("div");
    modalWrapper.innerHTML = component({ message: message });
    document.body.appendChild(modalWrapper);
  }

  render(message);
  onCickHandler();

  return {
    render,
  };
}

export default errorModal;
```
에러에서는 메세지를 catch문에서 error의 메세지를 errorModal에 넘기게 되면, 해당 메시지로 된 모달을 렌더링시키고 이에 맞는 이벤트 리스너를 등록해주는 로직을 함수형으로 실행될 수 있도록 하였다.