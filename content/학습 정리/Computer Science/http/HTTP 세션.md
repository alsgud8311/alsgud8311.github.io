## 전형적인 HTTP 세션

클라이언트-서버 프로토콜의 HTTP의 세션은 세 가지 과정을 거친다.
1. 클라이언트가 TCP 연결 수립(TCP가 아니어도 다른 연결 필요)
2. 클라이언트가 요청 전송 후 응답 대기
3. 서버가 요청을 처리하고 응답을 상태 코드, 요청에 부합하는 데이터와 함께 돌려보냄

HTTP/1.1부터는 세 번째 과정 이후 클라이언트가 해당 시점에 또 다른 요청을 보낼 수 있도록 연결을 닫지 않아 계속해서 요청을 받을 수 있다.

## 연결

클라이언트는 연결을 수립한다.
HTTP에서 연결을 연다는 것은 **TCP인 기본적인 전송 계층 내에서 연결**하는 것을 의미한다.

TCP 연결의 경우 HTTP 서버를 위한 **기본 포트는 80**이다. (AWS에서 배포할 때도 기본 포트를 80으로 해놔야 나중에 도메인을 Route53을 통해서 바꿀 수 있다).
8000등의 포트들도 쓰이긴 하지만 80의 경우에는 URL에서 포트 번호를 생략 가능할 수 있기 때문에 좋다.

## 클라이언트 요청 전송

연결이 된 후에는 user-agent(웹 브라우저, 크롤러 등)는 요청을 보낼 수 있다.
클라이언트 요청은 세 가지 블록으로 나누어진 CRLF(Carriage return, followed by line feed)로 구분된 텍스트 지시자들로 이루어진다.

```http
GET / HTTP/1.1
Host: developer.mozilla.org
Accept-Language: fr
```

1. 첫번째 줄 -> Parameter가 따른는 요청 메서드
	- 문서의 경로, 프로토콜과 도메인 이름을 제외한 절대경로 URL
	- 사용중인 HTTP 프로토콜 버전
2. 다음 줄들은 각각 특정 헤더를 나타낸다. 데이터의 적합성, 서버의 동장 수정 데이터 등에 관한 몇 가지 정보를 서버에 제공한다. 이런 헤더는 빈 줄로 끝나는 블록을 형성한다.
3. 마지막 블록은 부가적인 데이터 블록으로 POST 메서드에 의해 사용된다

```http
POST /contact_form.php HTTP/1.1
Host: developer.mozilla.org
Content-Length: 64
Content-Type: application/x-www-form-urlencoded

name=Joe%20User&request=Send%20me%20one%20of%20your%20catalogue
```
결과는 이런 식으로 전송한다.

## 요청 메서드

주어진 자원에 대해 실행되길 바라는 동작을 가리키는 요청 메서드가 정의되어 있다.

| 요청 메서드 | 동작 |
| ---- | ---- |
| GET | 데이터 받기 |
| HEAD | GET과 동일한 응답(대신 응답 본문이 없음) |
| POST | 특정 리소스에 엔티티 제출 |
| PUT | 요청 payload를 사용해 새로운 리소스 생성 or 대상 리소스를 나타내는 데이터 대체.<br/> 멱등성(동일한 요청을 한 번 보내는 것과 여러번 보냈을 때 같은 효과, 서버의 상태도 동일하게 남음) |
| DELETE | 특정 리소스 삭제 |
| CONNECT | 목적 리소스로 서버로의 터널(양방향 연결) 맺기 |
| OPTIONS | 목적 리소스의 통신 설정 |
| PATCH | 리소스의 부분 수정 |

## 서버 응답 구조

웹 서버가 요청을 처리하고 응답을 보낸다.
이 또한 세 개의 다른 블록으로 나누어진 CRLF로 구분된 텍스트 지시자들로 이루어져 있다.

```http
HTTP/1.1 200 OK
Date: Sat, 09 Oct 2010 14:28:02 GMT
Server: Apache
Last-Modified: Tue, 01 Dec 2009 20:18:22 GMT
ETag: "51142bc1-7449-479b075b2891b"
Accept-Ranges: bytes
Content-Length: 29769
Content-Type: text/html

<!DOCTYPE html... (here comes the 29769 bytes of the requested web page)
```

1. 첫번째 줄(상태줄) -> HTTP 버전의 acknowledgment
2. 특정 HTTP헤더.  데이터에 관한 정보를 제공하고 이후 빈 줄로 끝나는 블록 형성
3. 마지막 블록 -> 데이터가 있다면 데이터 블록

## 성공 응답

![](https://i.imgur.com/QBkGMee.png)

대부분 보이는 것들만 보인다

