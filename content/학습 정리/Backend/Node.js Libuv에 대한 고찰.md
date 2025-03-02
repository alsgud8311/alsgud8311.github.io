## Libuv란?
Libuv는 비동기 입출력 및 이벤트 기반에 초점을 둔 라이브러리이다.
주요 기능으로는 논블로킹 IO처리, 비동기 파일 시스템 접근 등이 있다.
우리가 알고 있는 Node.js의 핵심적인 로직인 이벤트 루프를 가지고 있는 라이브러리이기도 하다.
## 기존의 IO 처리와 Libuv의 등장

고전적으로는 기존 IO 처리의 경우 요청마다 스레드를 할당하여 처리하는 구조를 가지고 있다.
기존에는 이 동시성을 위해 멀티스레드를 열고 작업이 완료될 때까지 스레드의 실행을 차단하는 방법을 사용했다. 하지만 여기에선 쓰레드를 열었음에도 idle time, 즉 유효한 시간이 각각의 쓰레드에게 발생하기 때문에 이는 곧 자원의 낭비로 이어진다.

이어 나온 방식은 논블로킹의 이벤트 디멀티플렉싱메커니즘이다.
![](https://i.imgur.com/o1TK327.png)

멀티플렉서가 요청들을 하나로 묶고 디멀티플렉서가 요청을 싱글 스레드에 나눔으로써 모든 요청들을 관리하고 요청이 완료되기 전까지 블로킹, 완료가 된 후에는 이벤트큐에 푸시하는 방법 또한 사용했다.
이러한 메커니즘에 특화된 디자인 패턴으로는 **리액터 패턴**이 있다.

![](https://i.imgur.com/uQBTe8v.png)

리액터 패턴은 이벤트 디멀티플렉서에서 I/O 요청이 완료되었을 때, 이벤트와 **이벤트에 해당하는 핸들러**를 이벤트 큐에 넣고 **이벤트 루프**를 통해 이러한 핸들러를 실행시키는 방식으로 작동한다. 
여기서 이벤트 루프가 존재를 드러내기 시작한다. 이러한 이벤트 루프의 기본적인 작동 방식이 현재 우리가 알고 있는 Node.js libuv 라이브러리의 이벤트 루프의 기반이 되었다.

## Libuv의 구조
![](https://i.imgur.com/V1c7vQl.png)
Libuv의 공식문서를 보면 Libuv는 이벤트루프를 통해 Handle과 Request 두 가지를 다룬다고 나와있다.
Handle의 경우 작동 과정에서 다루는 콜백, TCP 서버 연결 콜백 등의 IO를 다루게 되고, Request는 Handle이 작동하는 과정에서 필요한 작업들을 요청하는 단기간 작업들을 다룬다.

```js
while there are still events to process:
    e = get the next event
    if there is a callback associated with e:
        call the callback
```
이벤트 루프는 반복적으로 이러한 작업들에 대해서 단일 스레드인 nodejs와 연결하고 이를 비동기적으로 수행한다.
비동기적으로 IO작업을 수행하기 위해서는 여타 단일 스레드 비동기 I/O접근방식과 같이 논블로킹 소켓에서 사용되며, 이 과정에서 필요한 polling은 각 OS에서 사용 가능한 최적의 메커니즘을 통해 작동한다. 해당 메커니즘의 경우 Windows의 경우 IOCP, Linux의 경우 Epoll 등이 있다.
대표적인 IO polling 메커니즘인 Linux의 Epoll에 대해서도 짚고가자.
### Epoll
Epoll은 리눅스에서 개발된 I/O 통지 모델이다. 멀티플렉싱 기법으로 동작하는 select 함수의 단점(느린 멀티플렉싱 등)을 보완하기 위해 나온 OS 레벨에서 지원하는 멀티플렉싱 함수이다.
파일 디스크럽터를 커널이 관리하면서 CPU에서 파일 디스크럽터의 상태 변화를 감시하고, 비동기 I/O 이벤트를 처리하는데 사용된다.

>파일 디스크립터(File Descriptor)
>유닉스 계열 시스템에서 프로세스가 특정 파일에 접근할 때 사용하는 추상적인 값
>프로세스가 실행 중에 파일을 Open하면 커널은 해당 프로세스의 파일 디스크립터 숫자 중 사용하지 않는 가장 작은 값을 할당해준다. 그 다음 프로세스가 열려있는 파일에 시스템 콜을 이용해서 접근할 때, 파일 디스크립터(FD)값을 이용해서 파일을 지칭할 수 있다.
>표준입력 0 / 표준출력 1 / 표준에러 2는 고정임
#### Epoll 주요 함수와 매개변수

#### epoll_create()
```c
int epfd = epoll_create1(0);
```
- 새로운 epoll 인스턴스를 생성하고 파일 디스크립터(fd)를 반환
- 매개변수
    - `size`
	    - 플래그를 전달

#### epoll_ctl()
```c
struct epoll_event event;
event.events = EPOLLIN;
event.data.fd = socket_fd;
epoll_ctl(epfd, EPOLL_CTL_ADD, socket_fd, &event);
```
- epoll 인스턴스에 파일 디스크립터를 추가, 수정 또는 삭제
- 매개변수
    - `epfd` : epoll 인스턴스의 파일 디스크립터
    - `op`: 수행할 작업
        - `EPOLL_CTL_ADD`: 새 파일 디스크립터를 epoll 인스턴스에 추가
        - `EPOLL_CTL_MOD`: 기존 파일 디스크립터를 수정
        - `EPOLL_CTL_DEL`: 파일 디스크립터를 삭제
    - `fd`: 감시할 파일 디스크립터
    - `struct epoll_event *event`: 감시할 이벤트와 데이터를 설정하는 구조체로 관찰 대상의 관찰 이벤트 유형
	    - `EPOLLIN` : 수신할 데이터가 있음
	    - `EPOLLOUT` : 송신 가능함
	    - `EPOLLPRI` : 중요 데이터 발생
	    - `EPOLLRDHUD` : 연결 종료 또는 Half-close 발생
	    - `EPOLLERR` : 에러 발생
	    - `EPOLLET` : 엣지 트리거 방식으로 설정(디폴트는 레벨 트리거)
		    - 엣지 트리거 : 특정 상태가 변화하는 시점에서 감지
		    - 레벨 트리거 : 특정 상태가 유지되는 동안 감지
	    - `EPOLLONESHOT` : 한번만 이벤트 받기
#### epoll_wait()
```c
struct epoll_event events[MAX_EVENTS];
int nfds = epoll_wait(epfd, events, MAX_EVENTS, -1);
```
- epoll 인스턴스에 등록된 파일 디스크립터들 중 이벤트가 발생한 것을 기다림
- 매개변수
    - `epfd`: epoll 인스턴스의 파일 디스크립터
    - `events`: 발생한 이벤트들이 저장된 배열
    - `maxevents`: 감시할 수 있는 최대 이벤트 수
    - `timeout`: 이벤트가 발생할 때까지 대기하는 시간(밀리초). `-1`로 설정하면 무한 대기

![](https://i.imgur.com/p0BTiqc.png)
아무튼 이렇게 IO polling을 통해 이벤트를 감시하고, IO 이벤트에 대해서 처리를 커널단에서 해주는데, 파일 I/O나 DNS 함수(getaddrinfo, getnameinfo) 같은 경우는 커널단에서 지원해주지 않는다. 그렇기 때문에 Libuv는 워커 스레드 풀을 두고, 워커 스레드를 할당하여 해당 작업을 처리하도록 한다. 해당 작업은 스레드 풀에서 블로킹 방식으로 접근 및 작업을 처리한다.

결국 모든 작업은 **이벤트루프** 를 중심으로 내외적으로 이루어지는 것이다.
이벤트 루프 안에서 비동기 작업이 일어나는 경우 I/O Polling의 작업이나 워커스레드가 할 수 있는 비동기 작업 등에 대해서는 함수를 실행한 뒤 바로 리턴받는다. 이후에 각 비동기 작업이 끝난 후 받는 callback을 각 이벤트에 맞는 queue에 넣어주고 이벤트 루프가 돌다가 이 큐에 콜백이 들어온 것을 감지하고 실행시키는 것이다.

![](https://i.imgur.com/U5C6EN6.png)
전체적인 구조가 잘 도식화되어있는 것 같아서 사진을 가져왔다. 이런 식으로 이벤트 루프는 싱글 스레드로 동작하지만 비동기 작업에서는 IO Polling을 커널에서, 파일 IO와 같은 작업은 별도의 워커스레드를 통해 구현하여 싱글스레드인데도 비동기적으로 동작시키기 때문에 블로킹I/O보다 좋은 효율을 내게 된다.

https://sjh836.tistory.com/149
https://rammuking.tistory.com/entry/Epoll%EC%9D%98-%EA%B8%B0%EC%B4%88-%EA%B0%9C%EB%85%90-%EB%B0%8F-%EC%82%AC%EC%9A%A9-%EB%B0%A9%EB%B2%95