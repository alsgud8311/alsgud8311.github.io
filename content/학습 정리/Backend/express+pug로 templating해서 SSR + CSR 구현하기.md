# 개요
express로 처음 서버를 구동해보면서 이를 html+css+js와 섞는다면 SSR 뿐만 아니라 CSR 또한 내 마음대로 입맛따라 고를 수 있을 것 같았다. 그렇게 된다면 `next.js`와 비슷한 느낌이지 않을까도 싶다.

아무튼 맨 처음에 express를 시작했을 때는 전체적인 html 템플릿을 그대로 출력시켜 열었던 로컬호스트 주소로 접속하면 통채로 웹사이트를 렌더링하여 보내주는 SSR 방식으로 시작했지만, `pug`라는 템플릿 엔진이 생각보다 여러가지 쓸만한 구석이 많아 이를 좀 더 활용해서 CSR을 만들기 보다 쉽지 않을까 생각해서 시도해보았다.

`pug`를 처음 맛보기로 써봤는데, 생각보다 장점이 많았다.
그 중에서도 이번 templating에 사용하려는 `pug`의 api는 클라이언트 사이드 렌더링을 하기에 최적화된 api라고 생각했다.
```js
const pug = require('pug');

// Compile the source code
const compiledFunction = pug.compileFile('template.pug');

// Render a set of data
console.log(compiledFunction({
  name: 'Timothy'
}));
// "<p>Timothy's Pug source code!</p>"

// Render another set of data
console.log(compiledFunction({
  name: 'Forbes'
}));
// "<p>Forbes's Pug source code!</p>"
```
compileFile은 파일을 읽어들여 해당 템플릿을 통해 templating을 하는 함수를 반환한다.
이 외에도 각종 메서드들은 컴파일에 필요한 여러가지 상황을 상정하여 다양한 방식으로 컴파일한 후 렌더링 할 수 있는 방법을 제시한다.
- compile(source : string,?options : ?options) : function()
	- 함수를 반환하고, 반환한 함수를 실행시키면 렌더링 시킬 수 있다
- compileFile(source : string,?options : ?options) : function()
	- pug 파일을 읽어들여, templating 하는 함수를 반환
- compileClient(source : string,?options : ?options) : function()
	- 문자열을 넣고 클라이언트 사이드에서 렌더링
- compileClientWithDependenciesTracked(source, ?options): function()
	- 의존성을 가진 template 클라이언트 사이드에서 렌더링
- compileFileClient(path:string, ?options: ?options): function()
	- 클라이언트 사이드에서 쓰일 수 있는 문자열로 templating
렌더링 관련 메서드
- render(source: string, ?options: ?options): string
	- 문자열을 넣고 html 문자열로 리턴
- renderFile(source: string, ?options: ?options, ?callback: ?callback) : string
	- html 문자열로 리턴

# 서버와 클라이언트 처리
## 서버: 컴파일한 다음 문자열로 보내기
해당 경우는 어떠한 요소를 추가했을 때 가져오는 기능이라고 생각해보자
```pug
app.post("/api", (req, res) => {
  const { title, detail, section } = req.body;
  const data = JSON.parse(readFileSync(`${DATAPATH}`, "utf-8"));
  const data2 = JSON.parse(
    readFileSync(`${DATAPATH}`, "utf-8")
  );
  // 서버 데이터에 추가하는 코드

	//JSON으로 컴파일한 html 문자열 stringify
  const template = JSON.stringify({
    data: pug.compileFile(
      path.join(
        __dirname,
        내 경로들
      ),
      {
        basedir: path.join(__dirname, "views"),
      }
    )({argument : value}),
  });
  res.type("Content-Type", "application/json");
  res.json(template);
});
```
서버에서는
 - 데이터를 갱신
 - 갱신한 데이터를 다시 가져오거나 받은 데이터에서 직접적으로 추가(이건 보내는 용도로)
 - templating할 pug 파일을 pug의 compileFile을 통해 함수를 받기
 - 갱신한 데이터를 compileFile의 리턴값으로 온 함수에 넣기
 - 리턴값으로 온 string을 json 형식으로 만들어 클라이언트의 응답 body에 넣어 보내기
의 과정을 거쳐 새롭게 갱신된 데이터의 컴포넌트 html을 다시금 클라이언트로 보낼 수 있다.

## 클라이언트: api 요청하고 받은 값을 기준으로 해당하는 Html 교체
```js
function handler(sectionId) {
...
  submitButton.addEventListener("click", async () => {
    const title =
      targetSection.getElementsByClassName("form__input--title")[0].value;
    const detail = targetSection.getElementsByClassName(
      "form__textarea--cardDetail"
    )[0].value;
    const section = targetSection.id;
    const response = await fetch("/api/todo/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        detail: detail,
        section: section,
      }),
    });
    let data = await response.json();
    data = JSON.parse(data);
    document.getElementById("sections").innerHTML = data.data;
  });
}
```
사실상 서버에서 html 파일을 통채로 보내서 렌더링 시키는 서버 사이드 렌더링 방식인 만큼 클라이언트라고 불리는게 맞을까 싶다. 그냥 view라고 볼 수 있지만 편의를 위해 클라이언트라고 칭하겠다.

클라이언트에서는 이벤트 위임 방식을 통해 이벤트들을 등록하기 때문에 기존의 html을 제외한 정적 파일들은 모두 남아있는 것들을 활용할 수 있다고 생각했다.
![](https://i.imgur.com/AlMIpF9.png)
`innerHTML`을 통해서 html을 교체하기 전에 기존의 js script로 들어간 js 파일을 개발자도구로 열어 script에 `console.log`하는 코드를 실행했는데 새롭게 렌더링이 이루어졌음에도 불구하고 스크립트 파일은 여전히 기존 파일을 유지하는 것을 볼 수 있다. 이러한 점은 새롭게 렌더링하는 과정에서 불필요한 정적 파일들을 불러오지 않는다는 이점을 가진다고 생각했다.

여러 컴포넌트로 복사된 html들에 이벤트 등록을 하는 방법은 이벤트 위임 뿐만이 아닌, `querySelectorAll`을 통해 해당하는 각각의 컴포넌트에 `forEach`를 돌면서 하나하나 이벤트 등록을 해줘야 하는 방식도 존재하지만 이러한 방식은 성능 상에 이슈가 있을 뿐만 아니라 새롭게 렌더링된 Html에는 이벤트 등록을 해주지 않은 상태에서 스크립트는 변하지 않았기 때문에 이벤트가 제대로 등록되지 않아 동작하지 않을 가능성이 있다. 


# TroubleShooting
## 1. 다중 attribute 문제
```
You should not have pug tags with multiple attributes.
```
사실 이건 해당 templating의 문제가 아닌 내 코드 문제였다
![](https://i.imgur.com/b7reY7N.png)
```pug
form(action="post").editform(hidden)
```
나도 모르게 그냥 여러 개의 attribute를 콤마로 구분하지 않고 써놔서 warning이 떴다. 정상적으로 인식은 되지만 주의하자

### 2. mixin 컴파일링 불가능
이 문제에 대해서는 stackoverflow를 뒤져보고 했는데 결국 제대로 된 느낌의 답변을 찾지 못했다.
![](https://i.imgur.com/hWYkzlh.png)
내 나름대로 생각한 점으로는 내가 이제까지 pug 파일을 컴파일 했던 때 사용했던 파일이 mixin형태로 arguments들을 받는 방식으로 될까 싶어서 했던건데, 다른 사용 예시들을 보니 mixin을 활용한 예시가 없었다. 
아마도 html 컴파일 과정에서 mixin을 지원하지 않는건가 싶어서 일반 html으로 바로 컴파일이 가능한 pug 코드를 쓰니 정상작동되었다.
아무래도 mixin은 해당 템플릿 엔진에서 자체적으로 컴포넌트를 만드는 방식이나보니 compileFile에서는 아직 지원하지 않는 것이라 생각했다.

## 과연 CSR이라고 할 수 있을까?
사실 서버 자체에서 렌더링을 하고 있지는 않지만, html 템플릿을 
# 정리
기존에 있는 정적 파일들을 그대로 활용하면서 Html 파일만 교체했음에도 정상적으로 모두 작동한다는 점은 큰 이점을 가진다고 생각한다. ssr과 pug를 공부하면서, 'pug를 통해서 보다 컴포넌트 단위로 나누는 것이 쉬워졌는데, 이러한 방식으로 페이지 전체를 새로고침하지 않아도 문제없을 정도로 계속 사용 가능한 html만 바꿀 수 있지 않을까?'라는 생각에서부터 시작한 실험이었는데 생각보다 이벤트 위임 방식과 시너지를 잘 이루어 나름 야매(?) 클라이언트 사이드 렌더링 방식을 구현했다는 점이 의의가 있는 것 같다. 이번 시도를 통해 CSR과 SSR의 차이도 공부하고, 조금 더 잘 파악할 수 있는 기회가 되었다고 생각한다.

하지만 CSR임에도 불구하고 문제가 남아있었으니,,
기존의 placeholder 안에서 모든 html을 통채로 갈아치우다 보니 SSR처럼 모든 화면이 깜빡이지는 않더라도, 컴포넌트의 placeHolder의 일부분이 깜빡이는 부분은 조금 킹받는 부분이 있다.
이를 위해서라면, 컴포넌트에 있는 DOM 노드들을 검사해서 변동사항이 있는 부분만 갱신하는 식으로 해도 될 것 같은데, 이거는 조금 더 깊게 파고 들어가야하기 때문에 조금 더 설계해보려고 한다.
