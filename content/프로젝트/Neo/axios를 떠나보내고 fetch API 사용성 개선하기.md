이제까지 리액트 프로젝트를 하면서 가장 고정적으로 쓰였던 리액트 외의 라이브러리라고 한다면 단언컨데 **axios**일 것이다.

axios는  `XMLHttpRequest`를 기반으로 만들어진 라이브러리로, 우리가 이제까지 귀찮게 http요청을 보내면서 하던 인터셉터, timeout 등의 설정을 간단하게 구현할 수 있기 때문에 확실히 개발비용을 줄여주던 라이브러리이다.

하지만 이번에 Nextjs 프로젝트를 시작하면서 예상치 못하게 axios의 필요성에 대해서 다시금 생각해보았다.
`XMLHttpRequest`의 경우 매우 오래된 http 요청이기 때문에 상대적으로 최근에 나온 `fetch api`의 성능이 좋아 굳이 `XMLHttpRequest`를 써야 하나?에 대한 의문을 가지는 사람이 많아졌다.


| **특징**                   | **XMLHttpRequest** | **fetch**                        |
| ------------------------ | ------------------ | -------------------------------- |
| **작동 방식**                | 콜백 기반              | Promise 기반                       |
| **코드 간결성**               | 상대적으로 복잡           | 간단하고 직관적                         |
| **Error Handling**       | 자동으로 에러 처리         | 수동으로 `response.ok` 확인 필요         |
| **지원 범위**                | 오래된 브라우저도 지원       | 최신 브라우저에서만 지원                    |
| **스트림 처리**               | 제한적                | 응답 데이터를 스트림으로 처리 가능              |
| **Progress 이벤트**         | `onprogress`로 지원   | 기본적으로 미지원 (대안: `ReadableStream`) |
| **CORS**                 | 제한적                | 더 강력한 CORS 제약 조건                 |
| **Request Cancellation** | `abort` 메서드 지원     | `AbortController`로 취소 가능         |
위와같이 XMLHttpRequest(XHR)은 상대적으로 오래된 웹 API인 만큼, 이에 대한 단점이 확실히 존재했다.
### 1. 요청과 응답의 강결합
`XMLHttpRequest`는 입력과 출력, 상태를 전부 하나의 객체로 다루고, 이벤트 기반으로 동작하는 모델이다.
이는 곧 응답과 요청부가 강하게 결합한다는 소리이다.
```js
const xhr = new XMLHttpRequest();
xhr.open("GET", "https://example.com/data", true);
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(xhr.responseText);
  }
};
xhr.send();

```
위 코드를 보면 정상적으로 XMLHttpRequest를 보내는 코드인데, 요청을 하는 부분과 응답을 받는 부분이 `readyState`인데, 숫자 코드로 구분한다.
 - UNSENT (숫자 0) : XMLHttpRequest 객체가 생성됨.
 - OPENED (숫자 1) : open() 메소드가 성공적으로 실행됨.
 - HEADERS_RECEIVED (숫자 2) : 모든 요청에 대한 응답이 도착함.
 - LOADING (숫자 3) : 요청한 데이터를 처리 중임.
 - DONE (숫자 4) : 요청한 데이터의 처리가 완료되어 응답할 준비가 완료됨.
이렇게 `onreadystatechange`에 이벤트를 등록해놓으면, 요청을 보낼 때와 요청에 대한 응답을 받을 때 0~4의 숫자 코드가 각 상태를 의미하기 때문에 이는 곧 해당 상태에 해당하는 변경이 이루어졌을 경우 무조건 실행된다. 즉, 무조건 요청 및 응답을 받는 과정에서 5번의 함수 호출이 이루어진다는 의미이다. 따라서 요청과 응답이 하나의 이벤트로 강결합되어있는 상태이기 때문에 이를 떼어놓을 방법이 없다.

### 2. 이벤트 기반 처리의 복잡성
이벤트 기반의 콜백 함수를 등록해놓는 방식은 현대의 Promise를 처리하는 방법과는 괴리가 있다. `async/await` 문법이나 `then/catch`와 같은 문법을 이용하지 않는 방식은 비동기 코드를 처리함에 있어 보다 가독성이 떨어질 수 있는 가능성이 있다.

또한 콜백을 넣어 해당 이벤트에 대해 감지하고 콜백함수를 실행하는 형태는 다중 요청이나 처리가 필요할 경우 콜백지옥, 즉 아도겐 코드가 만들어질 가능성이 있다.
![](https://i.imgur.com/46IuPNO.png)

이러한 문제를 `axios`라이브러리가 Promise 기반으로 사용할 수 있게 해주고는 있으나 솔직히 라이브러리를 안 쓰고 fetch를 쓰면 안되나? 하는 생각이 있다.

이 외에도 XMLHttpRequest는 브라우저 기반의 API이기 때문에 서버사이드에서는 작동할 수 없다는 점도 굳이 Nextjs 환경에서 `XMLHttpRequest` 기반의 axios를 사용하는 것에 대해 더 필요성을 못 느꼈던 것 같다.

하지만 이중에도 가장 중요한 것은..
`XMLHttpRequest`는 `Streaming`을 지원하지 않는다(두둥)
![](https://i.imgur.com/JWKaeLn.png)
ai 소설 생성은 ai에게 이전 소설과 다음 소설의 내용을 이어지게 하면서 전개를 할 수 있도록 프롬프트를 쓰고 ai에게 받아온 데이터를 바로 반영해야 한다. 요청이 끝난 후 ui상의 업데이트가 일어난다면 유저는 소설 전개 버튼을 누르고 한참동안 로딩중 상태를 봐야한다.

그렇기 때문에 ai API를 사용하다보면 http streaming의 형태로 많이 주는 것을 볼 수 있는데, 막상 axios로 사용하려고 보니 스트리밍이 되질 않았다.
찾아보니 `XMLHttpRequest`에서는 원래 지원되지 않는다고 한다...
이제는 정말 떠나 보내야 하는가... XHR..

아무튼 이러한 이유로 나는 `fetch API를 활용해보자!` 라는 생각을 하게 되었다. 그러면서 `API 요청을 어떻게 하면 조금 더 쉽고 잘 만들 수 있을까`에 대한 고민을 하게 되었다.
### Builder 패턴을 이용해 API 클래스 만들기
`fetch`를 사용하여 http 요청을 보내려고 하는 만큼, 불편한 점이 있었다.
기존에 axios를 주로 쓰던 나는 간단하게 `axios.create` 메서드를 통해 간단하게 인스턴스를 만들어내고, 인터셉터를 적용하고, 헤더 설정을 이루어냈다. 이는 모두 axios가 이러한 `XMLHttpRequest`에 대해서 추상화하고 단순한 XHR 래퍼에서 더 개선을 이루어냈기에 편리함을 통해 데이터 페칭을 가독성있고 편하게 만들어낼 수 있었던 덕이었다.

기존의 fetch 또한 쉽게 만들어 낼 수 있었지만, 각각의 request에 대해 header를 바꾸어야 하고, 인터셉터와 같은 기능 또한 부재했기에 불편한 점이 있었다.
따라서 나는 기존의 axios를 떠나보내고 빌더 패턴을 사용하여 fetch를 해주는 클래스를 구성하려고 한다.


```ts
import { OutgoingHttpHeaders } from "http";

type HTTPParams = Array<string> | string;

class API {
  baseURL: string;
  headers?: OutgoingHttpHeaders;
  params?: HTTPParams;
  timeOut?: number;
  endPoint?: string;
  withCredentials?: boolean;
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  getParams() {
    if (this.params) {
      return Array.isArray(this.params)
        ? this.params.join("/")
        : `/${this.params}`;
    }
    return "";
  }
  getEndPoint() {
    if (this.endPoint) {
      return this.endPoint;
    }
    return "";
  }
  get() {
    const params = this.getParams();
    const url = this.baseURL + this.endPoint + params;
    const options: RequestInit = {
      credentials: this.withCredentials ? "include" : "omit",
      headers: this.headers as HeadersInit,
    };

    return fetch(url, options);
  }
  post(data: BodyInit) {
    const params = this.getParams();
    const url = this.baseURL + params;
    const options: RequestInit = {
      method: "POST",
      credentials: this.withCredentials ? "include" : "omit",
      headers: this.headers as HeadersInit,
      body: data,
    };
    return fetch(url, options);
  }

  delete() {
    const params = this.getParams();
    const url = this.baseURL + params;
    const options: RequestInit = {
      method: "DELETE",
      credentials: this.withCredentials ? "include" : "omit",
      headers: this.headers as HeadersInit,
    };
    return fetch(url, options);
  }

  put(data: BodyInit) {
    const params = this.getParams();
    const url = this.baseURL + params;
    const options: RequestInit = {
      method: "PUT",
      credentials: this.withCredentials ? "include" : "omit",
      headers: this.headers as HeadersInit,
      body: data,
    };
    return fetch(url, options);
  }
}
```
일단 API에 대한 인스턴스는 위와 같이 만들었다.
일단은 자주 쓰는 `get, post, put, delete`정도만 만들어 놓았고, 나중에 서버에서 http 메서드가 추가되면 그때 하나씩 추가할 예정이다.

일반적인 각 메서드는 `axios`와 비슷하게 쓸 수 있도록 하고 싶어 이와 같이 직접적으로 fetch함수에 빌더 패턴을 이용해서 만든 인스턴스의 설정값을 넣어 반환하게 해 주었다.

그렇다면 이를 만들어 주는 객체의 빌더는 어떻게 만들어야 할까?

```js
class APIBuilder {
  private _instance: API;

  constructor(baseURL: string) {
    this._instance = new API(baseURL);
    return this;
  }

  headers(headerOptions: OutgoingHttpHeaders): APIBuilder {
    this._instance.headers = headerOptions;
    return this;
  }

  params(params: HTTPParams): APIBuilder {
    this._instance.params = params;
    return this;
  }
  endPoint(endPoint: string): APIBuilder {
    this._instance.endPoint = endPoint;
    return this;
  }

  timeOut(time: number): APIBuilder {
    this._instance.timeOut = time;
    return this;
  }

  withCredentials(withCredentials: boolean): APIBuilder {
    this._instance.withCredentials = withCredentials;
    return this;
  }

  build(): API {
    return this._instance;
  }
}

export default APIBuilder;

```
빌더의 경우 인스턴스를 private으로 지니고 있으며, 각 객체의 속성값을 메서드로 하여 하나씩 구성해나갈 수 있도록 구조를 짰다. 이렇게 다른 설정값을 넣고 마지막에 `build()`를 실행시키면 가지고 있던 API의 인스턴스를 반환하여 그대로 사용할 수 있도록 하였다.

### 개선하기 : 요청부의 반복되는 코드 줄이기와 인터셉터 구현하기
위 API 클래스의 코드를 보면 각 메서드마다 넣는 내용은 메서드를 제외하고 다르지 않다
그렇기 때문에 이러한 반복되는 부분을 `request` 메서드를 따로 둔 후에 http 메서드만 인자로 받아 요청을 보내는 식으로 개선했다.

이렇게 개선하던 중 http 요청을 하는 메서드가 따로 나눠지면서 여기에 인터셉터를 적용해봐도 괜찮지 않을까? 생각하여 인터셉터도 함께 구현하게 되었다.
```ts
type RequestBody = Record<string, unknown>;
type RequestFunction = () => Promise<Response>;
type ResponseMiddleware<T> = (
  data: T,
  request: RequestFunction
) => T | Promise<T>;
type RequestMiddleware<T> = (config: T) => T;

class API {
  baseURL: string;
  headers?: HeadersInit;
  params?: HTTPParams;
  timeOut?: number;
  endPoint?: string;
  withCredentials?: boolean;
  serveraction?: boolean;
  use: {
    request: RequestMiddleware<RequestInit>;
    response: ResponseMiddleware<Response>;
  };

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.use = {
      request: (config) => config,
      response: async (response, requestConfig) => response,
    };
  }

  getParams() {
    if (this.params) {
      return Array.isArray(this.params)
        ? this.params.join("/")
        : `/${this.params}`;
    }
    return "";
  }

  async request(method: HttpMethod, data?: RequestBody) {
    const params = this.getParams();
    const fetchFunction = async () => {
      const url = this.baseURL + this.endPoint + params;
      let options: RequestInit = {
        method,
        credentials: this.withCredentials ? "include" : "omit",
        headers: this.headers as HeadersInit,
        ...(data && { body: JSON.stringify(data) }),
      };

      options = this.use.request(options);

      if (this.serveraction) {
        return callServerAction(url, options);
      }
      return fetch(url, options);
    };

    const response = await fetchFunction();
    return this.use.response(response, fetchFunction);
  }
  ...
```
인터셉터는 요청과 응답 과정에서 이를 가로채 중간에 추가적인 작업을 하는 함수를 이벤트처럼 등록해놓는다.
```ts
instance.interceptors.request.use(
  (config) => {
    // getToken() - 클라이언트에 저장되어 있는 액세스 토큰을 가져오는 함수
    const accessToken = getToken();

    config.headers['Content-Type'] = 'application/json';
    config.headers['Authorization'] = `Bearer ${accessToken}`;

    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);
```
그래서 대부분 401 에러가 떴을 때, 기존에 가지고 있던 액세스 토큰을 다시금 발급받아 넣는 로직을 인터셉터에 등록하여 계속해서 로그인이 유지될 수 있도록 하는 로직을 인터셉터로 많이 작성했었다.
이러한 인터셉터는 클라이언트 - 서버 / 서버 - 클라이언트의 요청/응답 중간에 끼어 있는 콜백함수이므로 미들웨어처럼 다룬다.
이를 어떻게 하면 비슷하게 구현할 수 있을까 생각하던 중, 요청과 응답에 하나씩 등록해놓을 수 있도록 use라는 속성 안에 request와 response를 하나씩 두어 콜백함수를 등록시킨 뒤, 해당 콜백함수로 요청의 경우엔 요청 데이터, 응답의 경우엔 기존 응답과 401 에러처럼 다시금 이전에 보냈던 요청을 다시금 보낼 수 있도록 http 요청 함수를 주입하여 다시 실행시킬 수 있도록 했다.

```ts
const novelAIServer = new APIBuilder(process.env.NEXT_PUBLIC_API_URL as string)
  .endPoint("/process-input")
  .withCredentials(true)
  .headers({
    "Content-type": "application/json",
  })
  .build();

novelAIServer.use.response = async (response, requestFunction) => {
  if (response.status === 401) {
    const supabase = createClient();

    console.warn("⚠️ 401 Unauthorized - Refreshing token...");

    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) throw new Error("세션 갱신 실패");

    const newAccessToken = data.session.access_token;
    novelAIServer.headers = {
      ...novelAIServer.headers,
      Authorization: `Bearer ${newAccessToken}`,
    };
    console.log("✅ 토큰 갱신 성공, 재시도");

    return requestFunction();
  }
  return response;
};

```
이렇게 만들어진 빌더와 해당 인스턴스에 인터셉터를 등록할 때는 이런 식으로 인스턴스의 속성에 접근해 각 인터셉터를 설정해주면 된다.
```ts
let response = await fetch(`${API_URL}${input}`, {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });
```
이전의 요청과 비교해보자.
나의 경우에는 fetch의 두번째 인자로 헤드를 포함한 모든 옵션들이 하나의 `RequestInit`이라는 타입으로 들어가 있었고, 여기에서 하나씩 설정해 주는 것보다는 빌더 패턴을 이용해 하나씩 필요한 부분을 메서드로 확실하게 구분하고 점층적으로 객체를 만들어 나간다는 개념 자체가 훨씬 확실하게 API를 관리할 수 있겠다라는 느낌을 받았다.

하지만 물론 빌더 패턴이 장점만 있는 것은 아니다.
빌더 클래스와 해당 빌더를 통해 만들어지는 클래스 또한 구현해야 하다보니 보일러플레이트가 꽤나 길어지는 문제가 있었고, 이러한 문제는 코드의 복잡성 증가로 이어질 수도 있겠다는 생각을 했었다.

```ts
import { createClient } from "@/utils/supabase/client";

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const supabase = createClient();
  const session = await supabase.auth.getSession();

  if (!session?.data?.session) throw new Error("로그인이 필요합니다.");

  const accessToken = session.data.session.access_token;

  let response = await fetch(`${API_URL}${input}`, {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (response.status === 401) {
    console.warn("401 Unauthorized - Refreshing token...");

    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) throw new Error("세션 갱신 실패");

    return fetch(`${API_URL}${input}`, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${data.session.access_token}`,
      },
      credentials: "include",
    });
  }
  return response;
}

```
그래서 나는 처음에는 어차피 필요한 인터셉터는 현재 401 에러를 위한 리프레시 토큰 로직밖에 없을 것 같아 빌더 패턴이 아닌 고차함수 방식으로  API를 관리했었다.
현재 프로젝트의 사이즈를 고려한다면, 위와 같은 방식이 조금 더 맞을 수 있을 것 같다.

하지만 이전에 `우아한 타입스크립트 with 리액트`를 공부하면서 빌더 패턴을 이용한 api 관리 로직을 설계했었고(물론 해당 글은 axios 인스턴스에 대한 빌더였다) 이를 보면서 생각보다 쓸모가 있지만 정말 실용적일까라는 의문을 가졌다. 그러다보니 이번에 직접 빌더 패턴을 이용해 구현하면서 빌더 패턴의 장점과 단점에 대해서 조금 더 가까이 경험하고 느껴볼 수 있었고, 나중에 확장할 때도 현재 만들어놓은 빌더 패턴 자체가 사용성이 괜찮다고 생각하기 때문에 조금씩 더 보완하면서 사용을 해보고 이를 기록해볼 것 같다. 현재는 인터셉터도 하나밖에 등록을 못하는 상태이기 때문에 이러한 부분을 점층적으로 보완해나갈 계획이다.

아무튼 패턴을 이용하여 API를 관리하면서 기존에 심리적으로 의존적이어서 사용하는게 당연하다고만 생각했던 http 요청 관리 라이브러리에 대해 다시금 생각해볼 기회가 된 것 같다.

