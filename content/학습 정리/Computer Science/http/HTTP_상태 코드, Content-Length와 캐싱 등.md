## 상태 코드 팁
html 태그 뒤 붙어있는 0 -> Content length
Transfer-Encoding : chunked 다운로드 해야 될 크기를 알려줌

1.1
가상호스트
연결 제어 -> Connection: keep-alive
해당 커넥션을 종료시킬 수 없음
컨텐츠 현상 -> Accecpt-encoding
캐시 도입
- 상태 코드 304 Not modified
- 300번대의 상태코드를 어떻게 해석해야 하는가? 
- 소스의 위치가 어디인지 알려주는 것
- 소스의 위치를 location 헤더에 같이 알려줌
- location과 300번대 상태코드가 같이 있는게 있고
- 304의 소스위치 -> 로컬(브라우저)

500 502~503
- 컨텐츠 서버 500
- 프록시 역할을 하는 서버의 경우에는 컨텐츠에서 에러가 난 걸로 오해해서 안됨. 프록시 자체가 잘못이 있을 때 502를 사용 ALB(Application Load Balancer) 상태의 문제
- 503의 경우는 서버가 아예 죽은 경우이므로 ALB가 원본 서버가 죽었거나 응답이 없을 때 503을 보내줌.
- dns의 방향 틀기 -> etc/host 수정
```js
// 1.서버 바인딩
// 포트 열기
const net = require("net");
const server = net.createServer(onConnect);
function onConnect(socket) {
  console.log("client connected");
  socket.on("data", (data) => {
    console.log(data.toString());
  });
}

server.listen(80, () => {
  console.log("server bound");
});

```
요청에 대한 버퍼 확인
기본적으로 바인딩은 된 상태

응답 주기

```js
// 1.서버 바인딩
// 포트 열기
const net = require("net");
const server = net.createServer(onConnect);
function onConnect(socket) {
  console.log("client connected");
  socket.on("data", (data) => {
    console.log(data.toString());
    const response = `HTTP/1.1 200 OK
Content-Length: 10

Hello World
`;
    socket.write(response);
  });
}

server.listen(80, () => {
  console.log("server bound");
});

```
이렇게 하면 Content-Length 를 정해놓으면 10개까지만 짤려서 나오게 됨.
줄내림까지 포함

길이 정보는 무조건 안 주면 규격에 안맞음
### Content-Length를 주는 두 가지 방법
####  Transfer-Encoding : chunked

```js
// 1.서버 바인딩
// 포트 열기
const net = require("net");
const server = net.createServer(onConnect);
function onConnect(socket) {
  console.log("client connected");
  socket.on("data", (data) => {
    console.log(data.toString());
    const response = `HTTP/1.1 200 OK
Transfer-Encoding: chunked

5\r\n
Hello\r\n`;
    socket.write(response);
  });
}

server.listen(80, () => {
  console.log("server bound");
});

```
여기서 패킷이 다 안 끝남
내용물이 짧은데 모든 패킷을 다 못받음
마지막 0을 못받음
0\r\n
\r\n을 줘야함


```js
// 1.서버 바인딩
// 포트 열기
const net = require("net");
const server = net.createServer(onConnect);
function onConnect(socket) {
  console.log("client connected");
  socket.on("data", (data) => {
    console.log(data.toString());
    const response = `HTTP/1.1 200 OK
Transfer-Encoding: chunked

5
Hello
0

`;
    socket.write(response);
  });
}

server.listen(80, () => {
  console.log("server bound");
});

```
무조건 길이정보를 줘야 브라우저는 해석을 해준다.
개발하다가 Content-Length를 주고 안될 상황일 시 chunked
대부분의 프레임워크가 이를 지원해주고 있음

```js
// 2.요청 객체
/**
 * GET /favicon.ico HTTP/1.1
 * @param {*} data
 * @returns {Object}{url,method,headers{[key]:value}}
 */
function getRequest(data) {
  const [startLine, ...headerLines] = data.split("\n");
  const match = startLine.match(/(GET|POST) (.+) HTTP/);
  console.log(match);

  const headers = {};
  const method = match[1];
  const url = match[2];
  for (const line of headerLines) {
    const [k, v] = line.trim().split(":");
    if (k) {
      headers[k.trim()] = v;
    }
  }
  return {
    method,
    url,
    headers,
  };
}
```

```js
// 1.서버 바인딩
// 포트 열기
const net = require("net");
const server = net.createServer(onConnect);
function onConnect(socket) {
  console.log("client connected");
  socket.on("data", (data) => {
    const req = getRequest(data.toString());
    if (req.url === "/") {
      responseHello(socket);
    } else {
      responseNotFound(socket);
    }
    const response = `HTTP/1.1 200 OK
Transfer-Encoding: chunked

5
Hello
0

`;
    socket.write(response);
  });
}

server.listen(80, () => {
  console.log("server bound");
});

// 2.요청 객체
/**
 * GET /favicon.ico HTTP/1.1
 * @param {*} data
 * @returns {Object}{url,method,headers{[key]:value}}
 */
function getRequest(data) {
  const [startLine, ...headerLines] = data.split("\n");
  const match = startLine.match(/(GET|POST) (.+) HTTP/);
  console.log(match);

  const headers = {};
  const method = match[1];
  const url = match[2];
  for (const line of headerLines) {
    const [k, v] = line.trim().split(":");
    if (k) {
      headers[k.trim()] = v;
    }
  }
  return {
    method,
    url,
    headers,
  };
}

function responseHello(req) {
  const response = `HTTP/1.1 200 OK
    Transfer-Encoding: chunked
    
    5
    Hello
    0
    
    `;
  req.write(response);
}

function responseNotFound(req) {
  const response = `HTTP/1.1 404 Not Found
Content-Type: text/html
Content-Length: 0

`;
  req.socket.write(response);
}

```
- 각각의 도메인이 있을 때, 둘 다 Hello
- 얘네들이 두가지의 페이지가 둘 다 루트를 바라보고 있음
- path 자체는 똑같음
- 서버 입장에서 최소한의 헤더를 전송해줘야 함
- **부가적인 헤더와 필수 헤더를 구분하는 안목을 구분할 수 있어야 한다.**

## CORS
Cross-Origin Resource Sharing
교차 출처 리소스 공유
CORS에 대한 개발적 접근
지원해주는 필터를 쓰거나 cors 미들웨어 사용하면서 처리
결국 브라우저는 서버로부터 어떤 정보를 흭득했으므로 통과 기준이 생김
브라우저 기준에서 서버로부터 정보를 흭득하는 방법
- 서버 입장에서는 헤더를 통해 규격화된 응답을 줌
	- 결국 헤더에 영향을 줬다는 의미
	- cors를 해결하기 위해 헤더 영역에 뭔가가 추가됐다는 얘기![](https://i.imgur.com/TUjfbKx.png)
	- AJAX요청에 대해서 어떤 주소를 가져가려고 시도하는걸 알고 니가 가지고 있는 주소와 실제 리소스의 주소는 다르네, 보안적으로 위반할 여지가 있어보이기 때문에 차단
	- 이거를 받고 싶으면 Access-Control-Allow-Origin 헤더를 추가
	- 결국 cors에서는 교차출처에 대한 브라우저의 차단이고 교차출처는 결국 내가 주인이라는걸 알릴 수 있는 방법만 있다면 허용해줌. 그것이 헤더
	- 출처에 대한 정보를 헤더에 넣어주기만 하면 끝
	- 패킷의 입장을 알고 있는 입장에서는 쉬운 문제

## 리디렉션, 압축, 캐싱
상태를 받으면서 리디렉션을 알고 있기 때문에 필요 없음
![](https://i.imgur.com/Sy6Bqtn.png)
어떤 페이지 받을래라고 요청
그 페이지가 바뀌었다고 다시 접속하라면서 Location을 같이 줌. 재접속 유도
- meta 태그로 유도
- `location.href`
헤더로 유도? meta태그로 유도? Location.href로 유도?
이 세가지 방식 중 선택
301 Location

404 NotFound하면서 Location을 같이 넘기면


### 압축
![](https://i.imgur.com/RrC7SKq.png)
`Accept-Encoding`을 넘기면 `Content-Encoding`이 옴 
br, gzip 중에 서버는 뭐로 보내야 유리할까?

서버가 주고 싶은걸 주면 됨
클라이언트가 우선순위를 썼든 안썼든 상관 없음 
- 서버가 용량적으로 가장 우수한 것을 선택 -> br
- 성능 우선 -> gzip

언어의 경우에는 우선순위를 주는 헤더가 있음
```
Accept-Langauge ko-KR;ko;q=0.9
```
0.9 여러 선택지가 있을 때 90%의 가중치로 채택해줘라는 의미

클라와 서버는 헤더를 통해 협상하고, 헤더를 통해서 서로 정보를 주고받는 채널이 된다.


### 캐싱
![](https://i.imgur.com/NfnyAXh.png)
- 캐시는 브라우저만 가지고 있는게 아니다
- 캐시는 브라우저가 통신하는 서버의 입장에서 캐시가 될 수 있고, 원본 서버에서 응답이 나갈 때 응답의 결과를 저장하기도 함
- 캐시의 위치는 브라우저가 아닐 수도 있다.
- **캐시 정보를 해석하는 주체가 브라우저만 있는 것은 아니다**

- 로그인 페이지로 인증 정보를 전송하는 
- aws에서 로그인 정보에 댛한 응답페이지를 캐싱 클라우드 프론트 hit
- HTTP응답헤더에 캐시 절대 하지마라고 했어도 클라우드 프론트는 저장할 수 있음
- 캐시가 되든 안되는 http는 다 통신하고 캐시는 다 지원함

```
Cache-Control : pujblic, max-age=300
```
- 누구나 캐싱해도 돼.
- 캐시? -> 트래픽을 절감하기 위해 쓰는 방법
- 캐시 없에면 -> memory cache 디스크에 저장하기 전 상태
- disk cache -> 디스크 캐시
- 브라우저 입장에서 묻지 않아도 될 정도로 캐싱해도 될만한 요소
- max-age=300
- 300초까지는 자유롭게 사용하고 300초가 넘어가면
- 300초 이후에 서버에게 다시 물어보고 요청하되 필요에 따라 받아온다. -> 304 Not modified
- 다른데서는 200인데 메모리나 디스크 캐시
- 304를 받아갈 때 1시간동안 저장
- 현재 시간을 보여줌
- 서버 입장에서는 304를 보내기 ㅓㅈㄴ에 이 페이지는 언제 만들어진 페이지다를 알려주게 되어있음
- 
Last-Modified와 cache Control가 있을 때 
- 캐시 컨트롤할 준비가 된 상태
- Last Modified 헤더에 매칭되고 있는 것 -> If-Modified-Since
- 서버는 LM을 보내고 클라는 IMS를 보냄
- 서버 이베장에서 클라이언트가 캐시 가지고 있는데 캐시를 써도 될지 안될지를 물어보고 있는구나를 IMS를 보고 판단
- 결국 시간 정보를 가지고 판단하는 것밖에 되지 않음
- 클라이언트의 시간과 서버의 시간이 같으면 그대로 써도 됨
- 소스의 위치가 너한테 있으니까 니꺼 써 -> 304


304를 활용할 수 있는 다른 부분 -> Cache-Control
- max-age={second}
	- 서버가 그 뒤에 바뀌지 않았다면 그 뒤에 기대하는 동작
	- 클라 -> 서버에 요청ㅇㅇ
	- 클라이언트는 서버에게 IMS를 들고 요청
	- LM과 IMS가 같으면 304를 주고 다르면  그냥 200 줌
	- 서버에 요청은 하되 데이터는 안받아도 돼
- max-stale={second}
	- 만료시간보다 더 될 유지할 여지가 있을 때
	- time to live
- min-fresh={second}
	- 적어도 몇초는 살아야해
- **Cache-control : no-cache**
	- 캐시 해도 되지만 그 캐시를 매번 확인해 .
	- max-age=0과 같은 효과
	- no-cache는 304를 기대할 확률이 있음. 즉, 304를 받아갈 수 있고 원본 데이터를 줄일 수 있는 방법이 있음
- **Cache-control : no-store**
	- 서버의 입장에서 클라이언트(브라우저)에게 저장하지 말라고 하는 것
	- 저장하지 않으니까 304조차 보낼 수 있는 능력조차 되지 않고 IMS도 못보냄
	- 물리적으로 남길 수 있는 방법을 제한. 
- Cache-control : must-revalidate
	- 무조건 재검증해. 이 리소스 사용하려면 꼭 재검증하라는 의미
	- 원본은 항상 Fresh한 상태? 
	- 입장 차이 때문. 만약 캐시의 위치가 브라우저에 있을 경우에는 클라의 입장에서 nocache만 있으면 서버에 갔다오니까 must revalidate가 비슷함. 하지만 얘는 중간 서버용
	- 클라이언트가 중간서버에게 이 캐시 써도 돼를 물어볼 때 must-revalidate가 있을 때 무조건 원본 서버에게 가야 됨
	- 우리의 클라이언트 -> cdn일 확률이 있음.
- Cache-control : public / private 
	- 결국 최종 클라이언트 

- no-cache, no-store, must-revalidate를 다 쓰는 경우는 뭘까?
	- no-store -> 최종 클라이언트한테
	- 나머지 -> 중계 서버에게

캐시 서버가 no-store가 있어도 그냥 캐시쓰는 경우가 많음
cloudfront도 캐시하는 경우가 있음

#### 만약 이 페이지를 캐싱해야 한다고 했을 때 캐시의 이름을 뭘로 지을것인가?
304 응답을 받았을 때 다시 써도 된다는 판단을 가지고 있고 클라이언트가 다시 찾아와야 함
도메인 네임에 대한 슬래시를 캐시 키라고 불림.

- 압축을 할 수 있다는 것을 배웠는데 그러면 하나의 캐시 키에 대해서 압축 버전과 풀네임 버전. 같은 이름인데 바이너리가 두 개가 생길 수 있음. 그렇다면 어떻게 하지?
	- 최종 소비자는 사용하는 방법이 같으니까 내가 plain이든 뭐든 상관없음. 
	- 프록시는 다름. 클라이언트는 각각 요청할 수 있는데 프록시는 같은 캐시 키
	- A,B라는 캐시 키를 나눔
- 압축 타입에 따라서 캐시가 2,3개가 만들어 질 수 있는 가능성이 있음
- **주소 하나가 캐시 하나가 아닐 수 있다**
	- 압축을 한다는 것은 캐시 입장에서는 그 갯수가 많아지는 것. 그래서 `Vary`헤더를 주게 됨.

```
/index.htmlbr
Accept-Encoding: br
/index.htmlgzip
Accept-Encoding: gzip
/index.htmlbr,gzip
Accept-Encoding: br,gzip
```
Vary -> 캐시의 개수가 많아짐. 
```
Vary : Accept-Encoding, User-Agent
```
- Accept-Encoding -> 한 세개 네개정도가 생김
- 그렇다면 User-Agent는 거의 개개인별로 다름 = 캐시가 의미가 없음
- 만약에 Vary헤더를 발견했는데 변수가 많으면 효율이 떨어진다
- Devops -> 캐시효율을 높여야 하는 상항에서 하나하나를 뗄 수 있는 여지가 있을지 확인

### Etag
- 서버에서 클라이언트로 Last-Modified를 주면서 해당 시간만으로는 정보가 부족하다고 느껴지면 해당 페이지의 고유번호를 주기 시작
- 캐시를 신속하게 다룰 수 있는 힌트
- UUID일 수도 있지만 디스크의 물리적 위치 등이 가능할 수 있음
- last-modified와 etag의 경우 서버로 전송하는 키가 달라짐
	- last-modified -> IMS
	- Etag-> If-None-Matched
- last modified와 Etag가 캐시에 영향을 주는 요소임을 기억하자.
