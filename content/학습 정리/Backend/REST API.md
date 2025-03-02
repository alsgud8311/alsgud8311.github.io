# REST API란?
Representational State Transfer API의 약자로, 로이 필딩의 논문에서 소개되었다.

## 구성
REST API는
- 자원(Resource) - URI
- 행위(Verb) - HTTP METHOD
- 표현(Representations)
로 구성된다.

## 특징
### Uniform(유니폼 인터페이스)
URI로 지정한 리소스에 대한 조작을 통일되고 한정적인 인터페이스로 수행하는 아키텍처 스타일
### Stateless(무상태성)
REST는 무상태성 성격을 갖는다.
작업을 위한 상태 정보를 저장하고 관리하지 않기 때문에 세션 정보나 쿠키 정보를 별도로 저장하고 관리하지 않아 들어오는 요청만을 단순히 처리한다. 
세션이나 쿠키를 관리하지 않음으로써 서비스의 자유도가 높아지고 서버에서 불필요한 정보를 관리하지 않음으로써 구현이 단순해진다.

### Cacheable(캐시 가능)
HTTP의 웹표준을 그대로 사용하기 때문에 기존 인프라를 그대로 사용하는 캐싱 기능 등을 적용 가능하다. 
### Self-descriptiveness(자체 표현 구조)
REST API 메시지만 보고도 이를 쉽게 이해할 수 있는 자체 표현 구조로 되어 있다.
### Client - Server구조
REST 서버는 API 제공, 클라이언트는 사용자 인증이나 컨텍스트(세션이나 로그인 정보)등을 직접 관리하는 구조로 각각의 역할이 구분되어 의존성이 줄어들 뿐만 아니라 클라/서버가 개발해야 할 내용이 명확해진다

### 계층형 구조
REST 서버는 다중 계층으로 구성될 수 있으며 보안, 로드 밸런싱, 암호화 계층을 추가해 구조상의 유연성을 둘 수 있고 PROXY, 게이트웨이 같은 네트워크 기반의 중간매체를 사용할 수 있게 한다.

## 디자인 가이드
REST API 설계에 있어서 고려해야 할 중요 항목들은 몇 가지가 있다.
### URI는 정보의 자원을 표현해야 함
```
GET /members/delete/1
```
- 리소스 명은 동사보다 명사 사용
- 자원을 표현하는데 집중

### 자원에 대한 행위는 HTTP METHOD로 표현
```
DELETE /members/1
GET /members
POST /members
PUT /members
```
![](https://i.imgur.com/brCZvOz.png)

위와 같이 uri에 delete를 명시하는 것이 아닌 HTTP Method를 통해 이러한 자원에 대해 어떠한 행위, 즉 어떠한 조작을 할 것인지를 명시할 수 있도록 한다.

| Method | 역할                      |
| ------ | ----------------------- |
| POST   | 해당 URI(자원)에 대한 리소스 생성   |
| GET    | 해당 리소스 조회 및 자세한 정보 가져오기 |
| PUT    | 해당 리소스 수정               |
| DELETE | 해당 리소스 삭제               |

### 슬래시를 통해 계층 관계 나타내기
```
http://restapi.example.com/animals/mammals/whales
```
왼쪽에서 오른쪽으로 갈수록 하위 계층을 나타내도록 해야 한다.
추가적으로
- 마지막 문자에 슬래시 포함하지 않음
- 하이픈을 통해 Url 가독성 높이기
- 언더바(\_) 사용하지 않기
- URI 경로에는 소문자 사용
- 파일 확장자는 URI에 포함 X (헤더를 통해 나타내기)
등이 있다.

### 관계 표현
REST 리소스 간에 연관 관계가 있을 경우 `/리소스명/리소스ID/관계가 있는 다른 리소스명` 의 순서대로 표현할 수 있도록 한다.
```
GET: /users/{userid}/phone
GET: /users/{userid}/favorite/phone
```
이와 같이 관계명이 복잡할 경우에는 서브 리소스에 추가적으로 명시도 가능하다

### Collection과 Document의 자원 표현
Collection은 복수, Document는 단수로 사용한다.

>Collection vs. Document
>Collection은 여러 개의 리소스를 모아 놓은 집합이고, Document는 이러한 Collection 내의 개별 리소스를 나타낸다.
>
>ex) sports(Collection) - Soccer(Document)



## 응답 코드

| 상태 코드                    | 내용                                       |
| ------------------------ | ---------------------------------------- |
| 200 (ok)                 | 정상 수행(완료)                                |
| 201 (created)            | 리소스 생성 요청 + 리소스의 성공적 생성                  |
| 400 (Bad Request)        | 클라이언트의 요청이 부적절할 경우                       |
| 401(UnAuthorized)        | 클라이언트가 인증되지 않은 상태에서 보호된 리소스를 요청했을 때      |
| 403(404도 가능)             | 유저 인증상태와 관계 없이 응답하고 싶지 않은 리소스를 클라이언트가 요청 |
| 405(Method  Not Allowed) | 사용 불가능한 Method 사용                        |
| 301(Moved Permanently)   | 요청한 리소스의 URI가 영구적으로 변경됨                  |
| 500(Server Error)        | 서버쪽 에러                                   |
