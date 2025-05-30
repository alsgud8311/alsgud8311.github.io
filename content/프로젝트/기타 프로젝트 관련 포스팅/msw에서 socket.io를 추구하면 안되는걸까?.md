---
title: 목업서버에서 socket.io를 추구하면 안되는걸까?
created: 2025-05-05 01:11
updated: 2025-05-05 01:11
tags:
  - msw
  - socktio
categories:
  - msw
aliases: 
description: ""
status: draft
---
최근에 진행한 프로젝트에서 Websocket를 사용해서 채팅을 구현해야 하는 일이 생겼다.
Websocket 프로젝트의 경우 국룰로 `socket.io`를 사용하는 경우가 많은데, 이에 따른 이유가 있다.

## 왜 socket.io를 사용할까?
**WebSocket**의 경우는 브라우저와 서버 간의 **저수준의 프로토콜**로, 실시간 양방향 통신을 위한 표준입니다. 클라이언트와 서버 간에 지속적인 연결을 유지하며 데이터를 교환할 수 있다.

**Socke.IO**는 이 Websocket의 Wrapper와 같은 고수준 라이브러리로, 자동 재연결이나 이벤트 기반 통신, 네임스페이스 및 룸 기능 등 다양한 부가 기능을 제공하기 때문에 개발자가 하나하나 따로 구현해야 할 필요 없이 쉽게 이벤트 등을 관리할 수 있다.

#### 자동 재연결의 경우
저수준 WebSocket의 경우는 자동 재연결과 같이 Socket이 어느정도 유지 기간이 있기 때문에 해당 시간을 지나면 끊기게 되어 있다. 이 때, 다시 연결을 하지 않으면 소켓 상태가 제대로 관리되지 않아 이에 대한 적절한 대처가 필요한데, 특히 **Socket.IO**는 이러한 부분을 잘 관리해준다.

또한 Websocket이 지원되지 않는 환경일 경우 HTTP 롱 폴링 등을 통해 같은 환경을 가질 수 있도록 도와줌으로써 브라우저 호환성 또한 우수하다. 

>HTTP Long Polling
>클라이언트가 지속적으로 요청을 보내면 서버가 요청에 대해 들고 있다가 이벤트 발생 시 응답을 내려주는 방식

#### 이벤트 기반 통신
기본적으로 Websocket의 경우는 문자열 또는 바이너리 데이터를 주고받는 형식이기 때문에, 이벤트 기반으로 대부분 동작하는 소켓의 경우에는 이러한 이벤트에 대해서 따로 처리해주는 로직이 필요하다. 
기본적으로는 `open`, `message`, `error`, `close` 가 있다. 


```js
// WebSocket 연결 생성
const socket = new WebSocket("ws://localhost:8080");

// 연결이 열리면
socket.addEventListener("open", function (event) {
  socket.send("Hello Server!");
});

// 메시지 수신
socket.addEventListener("message", function (event) {
  console.log("Message from server ", event.data);
});

```
이런 식으로 각 이벤트는 하나의 message로 들어오게 되며, 이러한 메시지에 대해서 따로 이벤트를 정의하고 구분하여 각 로직에 맞는 이벤트를 발생시켜야 한다.

```js
socket.on("details", (...args) => {
  // ...
});
```
하지만 socke.io의 경우에는 미리 각 이벤트에 대해서 정의해놓을 수 있기 때문에 개발하는 과정에서 가독성과 로직의 관리에서 용이한 면이 있다.

#### 네임스페이스와 룸 기능
 **WebSocket**은 기본적으로 이러한 기능을 제공하지 않으며, 그룹 통신을 구현하려면 별도의 로직이 필요하다. 하지만  **Socket.IO**는  **네임스페이스(Namespace)** 라는 개념을 통해  연결을 논리적으로 분리하고, **룸(Room)** 기능을 통해 특정 그룹에만 메시지를 브로드캐스트할 수 있다.
    

### msw로 구축된 환경에서 어떻게 테스트를 해볼까?
이제까지 프로젝트에서 http 요청에 대해 적절한 응답을 내려주어 이에 따른 서버 상태 관리와 UI 구성 등은 기존에 더미데이터를 사용하여 UI를 구성하던 것보다 훨씬 생산성이 높아져서 만족도가 높다.

이러한 Msw환경에서는 socket 또한 지원하는데, 문제는 websocket은 지원하지만 socket.io는 아직 레퍼런스가 없는 경우가 많아 애를 먹었다.



```js
/**
 * @typedef {Object} Sendmessage
 * @property {string} roomId - 방 아이디
 * @property {string} sender - 메시지 보낸 사람
 * @property {string} content - 메시지 내용
 * @property {WebSocket} client - 소켓 클라이언트
 * @property {() => boolean} isRoomOpen - 소켓 연결 상태 반환 함수
 *
 * @param {Sendmessage} param
 * @returns {() => void} clear 함수 반환
 */
const sendIntervalMessage = ({
  roomId,
  sender,
  content,
  client,
  isRoomOpen,
}) => {
  const message = JSON.stringify({
    roomId,
    sender,
    content,
    timestamp: new Date().toISOString(),
  });

  const timer = setInterval(() => {
    if (!isRoomOpen()) {
      console.log("소켓이 닫혔습니다.");
      clearInterval(timer);
      return;
    }
    client.emit("message", message);
  }, 5000);

  return () => clearInterval(timer); // 중단용 함수 반환
};

export { sendIntervalMessage };

```
```js
  chat.addEventListener("connection", (connection) => {
    const io = toSocketIo(connection);
    let roomState = true;

    io.client.on("message", (event) => {
      console.log("Received message:", event.data);
    });

    io.client.on("close", () => {
      console.log("Client disconnected");
      roomState = false;
    });

    sendIntervalMessage({
      roomId: "room1",
      sender: "server",
      content: "Hello from the server!",
      client: io.client,
      isRoomOpen: () => roomState,
    });

    console.log("WebSocket connection established");
  }),
```
이렇게 만들었는데 클로저로 묶여있는 원시값이다보니 roomState는 계속해서 true를 반환하는 함수로 묶여있게 된다. 하지만 그렇다고
- 해당 값을 반환하는 함수를 통해 상태 조회
- roomState를 참조값으로 바꿔준 후 참조값 넘기기
- 타이머 중단 함수 받아서 실행
과 같은 방식이 전부 통하지 않았다! 프록시단에서 넘긴 거라서 아무래도 알고 있는 자바스크립트대로는 작동하지 않음을 파악했다.

```js
  const timer = setInterval(() => {
    if (!isRoomOpen()) {
      clearInterval(timer);
      return;
    }
    client.emit("message", payload);
  }, 5000);

  setTimeout(() => {
    console.log("Interval message 끄기");
    clearInterval(timer);
  }, 15000);

```
사실 어차피 나는 제대로 소켓 이벤트가 가는지만 확인하기 위해 사용한 것이므로 일정 초 이상이 지나면 인터벌 메시지를 끄기만 하면 될 것 같아 이런식으로 함수를 실행하면서 동시에 `setTimeout`을 걸어놓는 식으로 테스트를 했다.

![](https://i.imgur.com/dsj9dsU.gif)
소켓 이벤트를 제대로 받고 있음을 볼 수 있다!