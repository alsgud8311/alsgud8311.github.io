# J238-C, J204-C
# 우리의 체크포인트

  

- [ ] 서버

- [x] checkin

- [x] clap

- [x] checkout

- [x] summary

- [ ] direct

- [x] 채팅(chat, finish, broadcast)

- [ ] 클라이언트

- [x] !history

- [x] checkin

- [x] clap

- [x] checkout

- [x] summary

- [ ] direct

- [ ] 채팅(chat, finish, broadcast)

  

# 문제 해결 과정

  

## Telnet 연결

  

<img src="https://i.imgur.com/1EXkbPf.png" width=400/>

<img src="https://i.imgur.com/ZSMP3U0.png" width=400/>

## 챌린지 GPT 만들기

  

### 핵심 포인트 - 요청 요구사항

  

- 서버가 받은 모든 요청에는 적절한 응답을 보내준다. (아무런 반응이 없으면 안된다.)

- 서버는 여러 클라이언트가 동시에 연결할 수 있어야 한다.

- checkin 요청을 받은 후에도 연결을 유지해야 한다.

  

#### 핵심 포인트 - 클라이언트

  

- 비동기 입력화면

- checkin 성공한 시각을 변수에 기록

- chekout할 때 checkout시각 - chekin 시각 -> Core Time

- 실행 후 입력한 명령을 모두 기록(서버x 클라이언트 자체에서)

- 요청, 응답, 브로드캐스트를 모두 클라이언트가 받아 출력

  

### 서버

  

```js

const net = require("net");

const { handleCommand } = require("./handleCommand");

  

const server = net.createServer((socket) => {

console.log("Client Connected");

const userSessionId = crypto.randomUUID();

  

socket.on("data", (data) => {

console.log(`${userSessionId} Received from client: ${data}`);

data = JSON.parse(data);

const response = handleCommand(userSessionId, data, socket);

socket.write(response);

});

  

socket.on("end", () => {

console.log("Client disconnected");

});

});

  

const port = 2024;

server.listen(port, () => {

console.log(`Server listening on port ${port}`);

});

```

  

서버는 net.Socket을 활용하여 2024포트에 대해서 서버를 키고, JSON 형식의 커맨드, 데이터로 이루어진 객체를 받아 이에 대해서 각각 처리한다. 이러한 데이터 처리 방식은 기존 프론트와 백의 데이터 통신에 대한 방식과 거의 흡사하다.

  

### 클라이언트

  

```js

function checkin(campId, host, port) {

let client = new net.Socket();

client.connect(port, host, () => {});

  

client.on("data", (data) => {

ResponseHandler.handle(data);

});

  

client.on("close", () => {

process.exit();

});

client.write(RequestJson.makeCheckinRequest(campId));

historyList.push("checkin");

return client;

}

```

  

클라이언트는 net.Socket을 이용하여 전달된 host와 port에 대해 연결

이후 write로 서버에 요청이 간후 응답이 돌아오게 될경우 ResponseHandler를 이용하여 응답 결과 출력

  

### 핵심 포인트 - checkin

  

```

// 클라이언트

> checkin J004

< checkin success to group#1

  

// 서버

>> checkin J004 (success) from 127.0.0.1:12334 => session#1, group#1

```

  

```js

const { Repository } = require("./repository");

const User = require("./user");

  

function checkin(userSessionId, data, socket) {

const campId = data.data;

const repository = new Repository();

numberValidCheck(campId);

const user = repository.addUser(campId, userSessionId, socket);

const groupNum = repository.joinGroup(user);

console.log(

`checkin ${user.campId} (Success) from ${socket.remoteAddress} => session#${user.indexId}, group#${user.group.groupNum}`

);

return JSON.stringify({ command: data.command, data: groupNum });

}

  

const numberValidCheck = (campId) => {

const idNumber = parseInt(campId.slice(1));

if (typeof idNumber !== "number" || idNumber > 256 || idNumber < 1) {

throw new Error("Invalid Id number");

}

};

  

module.exports = { checkin };

```

  

- campId (J001~J256)

- checkin -> 그룹 할당

- 4명까지 그룹 할당

- 그룹에서 빠져나간 경우 재할당 가능(할당하는 방식에 대해선 의논)

- checkin 응답 -> 그룹 번호를 정수형으로 알려줌

  

체크인의 경우 각 유저마다 오는 달라지는 UUID 값에 대해 Database 객체에 Repository라는 중간 객체를 통해 갱신하는 방식으로 구현했다.

또한 그룹도 객체로 만들어주어 각 각 그룹에서 남은 공간을 찾아 해당하는 캠퍼를 넣어주도록 했고, 이 또한 repository의 메서드를 통해 갱신한다. 마지막에는 JSON값을 리턴해주어 클라이언트에서도 처리가 용이하도록 구현했다.

  

#### 예외

  

- campId 범위 초과 에러

- 재입력

- checkin 상태에서 다시 checkin 불가능

  

![](https://i.imgur.com/1xTeOsG.png)

  

### 핵심 포인트 - checkout

  

```

// 클라이언트

> checkout

< checkout (disconnected)

> Core time = 11min 32sec

  

// 서버

>> checkout from session#2(J005) - disconnected

```

  

```js

const { Repository } = require("./repository");

  

function checkout(user, userSessionId) {

const repository = new Repository();

console.log(

`checkout from session#${user.indexId}(${user.campId}) - disconnected`

);

repository.deleteUser(userSessionId);

return JSON.stringify({ command: "checkout", data: true });

}

module.exports = { checkout };

```

  

- 이전에 checkin 했던 그룹에서 퇴장

- 그룹에 다른 캠퍼가 남아있다면, 해당 그룹 캠퍼들에게 퇴장 메시지 전달

- chekout 요청 후 응답을 받으면 연결을 끊기

- chekout 없이 TCP 연결이 끊겨도 checkout 처리

  

체크아웃에서 신경써야 할 점은 기존의 접속 중인 캠퍼를 보관하는 database의 user객체에 대해 삭제를 함과 동시에 그룹에서 또한 제거해야 한다는 점이었다. 이를 유의하여 repository를 통해 정보를 갱신하고, error가 던져지지 않는 이상 true값만 데이터로 리턴하여 성공 여부를 알리도록 했다.

![](https://i.imgur.com/yF2jcmY.png)

  

### 핵심 포인트 - Summary

  

```

// 클라이언트

> summary day4

< keywords are "Heap, Stack"

  

// 서버

>> summary from session#2(J005) : day19 => 'Network, Server'

```

  

```js

function summary(user, data) {

if (!day.hasOwnProperty(data.data) || !data.data)

throw new Error("404 Day Not Found");

console.log(`summary from session#${user.indexId}(${user.campId})`);

return JSON.stringify({ command: "summary", data: `\"${day[data.data]}\"` });

}

  

const day = Object.freeze({

day1: "IDE,node",

day2: "Linux,System",

day3: "XML,JSON",

day4: "Heap,Stack",

day6: "Object,Class",

day7: "File Path, UnitTest",

day8: "Immutable, Closure",

day9: "Event, Publisher",

day11: "Async,EventLoop",

day13: "Git, Object",

day16: "HTTP, SQL",

day18: "Network, Server",

});

  

module.exports = { summary };

```

  

- summary 요청을 보내서 키워드 받기

- 데이터 -> day 몇 번째 미션인지 정수형으로 받기

- 서버 -> 정수형을 확인해서 응답

  

summary같은 경우 이미 주어지는 값들이 고정되어 있으므로, 이를 상수처리 해주고 가져다가 쓸 수 있게끔 해 주었다. 해당하지 않은 대상이 나오게 된다면 에러를 던져주었다.

  

<img src="https://i.imgur.com/M4Wx24P.png" width=300/>

![](https://i.imgur.com/NHxvPjL.png)

  

### 핵심 포인트 - chat(채팅방 만들기)

  

```

// 클라이언트

> chat maxCount=2

< broadcast from server, "채팅이 시작되었습니다"

//클라이언트 - 다른 클라이언트에게 chat을 통해 채팅방을 만들고 브로드캐스트 받았을 때

< broadcast from J005, "반갑습니다"

  

// 서버

>> chat from session#1(J004)

```

  

```js

function chat(user) {

if (!user.group) throw new Error("404 Group not found");

user.group.chatStart();

return JSON.stringify({ command: "chat", data: true });

}

module.exports = { chat };

```

  

- 같은 그룹에 있는 사람들과 브로드캐스트

- 요청 데이터 -> maxCount(int)

- 메시지 개수 < maxCount

  

#### 예외

  

- 메시지 개수가 MaxCount를 넘으면 서로에게 전달되지 않음

  

### 핵심 포인트 - finish

  

```

//클라이언트 -> 알아서 넣기

//서버

>> finish from session#1(J004)

```

  

```js

function finish() {

if (!user.group) throw new Error("404 Group not found");

user.group.chatFinish();

return JSON.stringify({ command: "finish", data: true });

}

  

module.exports = { finish };

```

  

- 채팅 요청을 보낸 캠퍼가 finish를 보내면 채팅 멈추기

- 다시 브로드캐스트 불가능

  

### 핵심 포인트 - broadcast(채팅 메시지 보내기)

  

보낼 때

  

```

//클라이언트

> broadcast "반갑습니다"

//서버

>> broadcast from session#2(J005) => "반갑습니다"

```

  

```js

class Database {

_instance = null;

constructor() {

if (this._instance === null) {

this._instance = this;

this.user = {};

this.groups = [];

this.clap = 0;

this.currsessionId = 0;

}

return this._instance;

}

  

getNewSessionId() {

this.currsessionId++;

return this.currsessionId;

}

}

  

const getInstance = () => {

if (this.database == undefined) {

this.database = new Database();

}

return this.database;

};

  

module.exports = { getInstance };

```

  

받을 때

  

```

//클라이언트

< broadcast from J004, "오늘힘드네요"

//서버

>> broadcast to group#1 => text="반갑습니다", from="J005"

```

  

- 브로드캐스트 요청을 보내면 chat 진행중인 그룹 모두에게 브로드캐스트

- 요청 데이터 -> text(string)

  

### 핵심 포인트 - direct

  

보낼 때

  

```

//클라이언트

> direct to J004 "마지막이니 힘내요"

< direct (success)

//서버

>> direct from session#2(J005) => to="J004", text="마지막이니 힘내요"

```

  

받을 때

  

```

//클라이언트

< direct from J005, "마지막이니 힘내요"

//서버

broadcast to session#1(J004) => text="마지막이니 힘내요"

```

  

- 직접 특정한 캠퍼에게 메시지를 보낼 수 있는 기능

- 요청 데이터 -> campId(string), text(string)

  

#### 예외

  

- 수신할 대상 캠퍼가 체크인 안했으면 보내지 않기

- 체크인을 한 상태라면 text 메시지 전달

  

### 핵심 포인트 - clap

  

```

//클라이언트

> clap

< clap count is 1

  

//서버

>> clap from session#1(J004) => 1

```

  

```js

const { Repository } = require("./repository");

  

function clap() {

const repository = new Repository();

repository.addClap();

console.log("clap!");

return JSON.stringify({ command: "clap", data: repository.getClap() });

}

module.exports = { clap };

```

  

- 모든 클라이언트가 보내는 요청 횟수를 누적하기 위한 기능

- 요청할 때마다 하나씩 값을 누적해서 숫자 응답

- 한 클라이언트에서 반복해서 요청 가능

  

![](https://i.imgur.com/27cgnmt.png)

  


# 학습 메모

----
# 개선하기 체크포인트

- [x] 모든 기능 완성 ✅ 2024-08-08
- [x] 클라이언트의 readline 구조 개선 ✅ 2024-08-08
- [x] http Request && response 구조로 데이터 보내기 ✅ 2024-08-08
- [x] Error 핸들링 -> 클라이언트에 에러 전송 개선 ✅ 2024-08-08


## 클라이언트의 readline 구조 개선
```js
const RequestHandler = require("./requestHandler");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let client = null;
const port = 2024;
const host = "localhost";
let startTime = 0;
rl.on("line", (line) => {
  const order = line.trim().split(" ");
  if (order[0] == "!history") {
    RequestHandler.history();
  } else if (!client) {
    if (order[0] == "checkin") {
      startTime = Date.now();
      client = RequestHandler.checkin(order[1], host, port);
    } else {
      console.log("잘못된 명령입니다");
    }
  } else {
    if (order[0] == "clap") {
      RequestHandler.clap(client);
    } else if (order[0] == "checkout") {
      RequestHandler.checkout(client);
      printTime(startTime, Date.now());
    } else if (order[0] == "summary") {
      RequestHandler.summary(client, order[1]);
    } else if (order[0] == "direct") {
      //RequestHandler.direct(client);
    } else if (order[0] == "chat") {
    } else if (order[0] == "finish") {
    } else if (order[0] == "broadcast") {
    } else {
      console.log("잘못된 명령입니다");
    }
  }
});

function printTime(startTime, endTime) {
  let time = parseInt((endTime - startTime) / 1000);
  console.log(`Core time = ${parseInt(time / 60)}min ${time % 60}sec`);
}

```
기존 코드의 경우 readline 내에서 어떻게 처리할 지에 대해 보다 구조를 잘 파악하기 위해 readline 내에서 명령어를 처리하다보니 아무래도 if else 문을 보다 남발하는 경우가 있었다.  또한 클라이언트가 없는 경우에 대해서도 따로 서버의 명령어를 처리하면 안되기 때문에 이를 막다보니 다양한 예외 상황에 대해 처리하기 위해 if else문을 썼지만 이를 switch/case문을 통해 보다 구조적으로 정리할 수 있을 것 같았디.

```js
const RequestHandler = require("./requestHandler");

//클라이언트 객체
let client;
//접속 시간을 구하기 위한 startTime
let startTime;
const PORT = 2024;
const HOST = "localhost";

function commandHandler(line) {
  const [command, ...data] = line.trim().split(" ");
  console.log(command, data);
  if (!client && command !== "checkin") {
    console.log("체크인을 진행해야 명령어가 가능합니다.");
  } else {
    switch (command) {
      case "!history":
        RequestHandler.history();
        break;
      case "checkin":
        startTime = Date.now();
        client = RequestHandler.checkin(data[0], HOST, PORT);
        break;
      case "checkout":
        RequestHandler.checkout(client);
        printTime(startTime, Date.now());
        break;
      case "summary":
        RequestHandler.summary(client, data[0]);
        break;
      case "clap":
        RequestHandler.clap(client);
        break;
      case "direct":
        RequestHandler.direct(client, data[0], data[1]);
        break;
      case "broadcast":
        RequestHandler.broadcast(client, data[0]);
        break;
      case "finish":
        RequestHandler.finish(client);
        break;
      default:
        console.log("잘못된 명령어입니다.");
        break;
    }
  }
}

function printTime(startTime, endTime) {
  let time = parseInt((endTime - startTime) / 1000);
  console.log(`Core time = ${parseInt(time / 60)}min ${time % 60}sec`);
}

module.exports = { commandHandler };
```
따라서 client의 commandHandler를 따로 만들고, 이에 대해서 readline의 클로저로 넘겨주었다.
이 클로저에서는 각 클라이언트에 대해 객체를 관리하고, 명령어에 대해 처리하는 기존에 있던 콜백함수를 따로 모듈화시켜놓고 기존의 문법을 살짝 변형한 정도이다.
이를 통해 나중에 보다 구조적으로 확인이 편하고, 명령어 추가가 보다 용이하다.
```js
const { commandHandler } = require("./commandHandler");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", commandHandler);

```
또한 기존에 있던 client의 readline부분이 매우 간소화되어 명령어와 데이터의 흐름 별로 보다 파악이 용이하게 개선되었다고 생각한다.

## HTTP request & response 구조 지키기

```js
function makeCheckinRequest(campId) {
  return JSON.stringify({
    command: "checkin",
    data: campId,
  });
}

function makeClapRequest() {
  return JSON.stringify({
    command: "clap",
  });
}

function makeCheckoutRequest() {
  return JSON.stringify({
    command: "checkout",
  });
}

function makeSummaryRequest(day) {
  return JSON.stringify({
    command: "summary",
    data: day,
  });
}

function makeChatRequest(cnt) {
  return JSON.stringify({
    command: "chat",
    data: cnt,
  });
}
```
이전에는 그냥 json형식으로 command & data의 형식으로 보냈는데, 이럴 떄마다 command의 역할 자체가 하나의 http 요청을 보내는 것이 아닌, 데이터만 받아서 이를 처리해서 실행하는 느낌이 들었다.
우리의 미션에서는 학습해야 할 부분이 http request & response에 대한 부분도 있었기 때문에 이러한 데이터를 서버에 보내는 것이 형식에 맞지 않는 것 같았다. 따라서 이를 기본적인 http 요청의 구조를 만들어 서버에 보내는 로직을 따로 설정하여 요청 및 응답하는 것이 조금 더 적합한 방식이라고 생각했다.

```js
const httpRequest = (path, data = {}, method = "POST") => {
  const request = {
    method: method,
    path: path,
    version: "HTTP/1.1",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": JSON.stringify(data).length,
    },
    body: {
      data: data,
    },
  };
  return JSON.stringify(request);
};

module.exports = {
  httpRequest,
};
```
따라서 기존 HTTP 요청의 일부분을 따라하여 비슷한 식의 템플릿에 데이터를 담아 보내도록 했다. 여기서 path의 경우 기존에 요청하던 명령어들을 의미하며, 데이터의 경우 requestHandler에서 readline을 통해 받은 데이터를 처리하여 넘겨주어 JSON 형식의 표준화된 데이터를 얻게 되고, 이를 서버에 보낸다.

```js
const httpSuccessResponse = (path, data = {}, method = "POST") => {
  const request = {
    result: "SUCCESS",
    method: method,
    path: path,
    version: "HTTP/1.1",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": JSON.stringify(data).length,
    },
    body: {
      data: data,
    },
  };
  return JSON.stringify(request);
};

const httpFailResponse = (path, error = "", method = "POST") => {
  const request = {
    result: "ERROR",
    method: method,
    path: path,
    version: "HTTP/1.1",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": JSON.stringify(error).length,
    },
    body: {
      error: error,
    },
  };
  return JSON.stringify(request);
};

module.exports = {
  httpFailResponse,
  httpFailResponse,
};
```
서버에서도 받은 응답에대해 처리를 하고 응답 결과에 따라 두 가지의 응답을 보낼 수 있도록 하였다. FAIL의 경우 왜 FAIL이 이루어졌는지에 대한 이유를 담아 보낼 수 있도록 하였다.


## 에러 핸들링
```js
function throwServerError(errorCode, path, message) {
  throw Object.assign(new Error(message), {
    code: errorCode,
    path: path,
  });
}

module.exports = { throwServerError };
```
기존의 서버 에러들은 그저 에러를 던져주기만 하고 이에 대해 따로 처리해주지 않아 서버에서만 제대로 에러가 뜨고 , 클라이언트에서는 에러에 대해 핸들링을 따로 해주지 않았다.

따라서 이러한 에러를 던져주는 과정에서 서버에서 이 에러를 받아 적절한 http Response로 바꿔준 후 error 관련 정보를 담은 응답을 보내줘 클라이언트에서 이를 처리할 수 있도록 해줬다.
에러와 같은 경우 코드와 어떤 명령어를 실행했을 때, 어떤 에러가 떴는지를 알아야 하기 때문에 위와 같이 기존 Error에 새로운 property를 추가하여 에러를 받아 처리해주도록 했다.
```js
  socket.on("data", (request) => {
    console.log(`Received from client: ${request}`);
    request = JSON.parse(request);
    const data = request.body.data;
    const path = request.path;
    try {
      handleCommand(userSessionId, path, data, socket);
    } catch (error) {
      socket.write(httpFailResponse(error.path, error.code, error.message));
    }
  });
```
서버가 에러를 핸들링하는 로직또한 바꿔주었다.
서버가 데이터를 받으면 handleCommand를 통해  데이터가 가게 되고, 이렇게 간 데이터가 유효성 검증 중에 에러가 발생한다면 위의 에러를 던져주어 서버의 최상위인 해당 코드에서 받아 socket.write로 받아 이를 http response 형식으로 처리하여 클라이언트로 보낼 수 있도록 하였다.
