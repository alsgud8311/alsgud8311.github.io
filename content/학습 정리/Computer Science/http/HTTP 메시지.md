## HTTP 메시지란?
HTTP 메시지는 서버와 클라이언트 간에 데이터가 교환되는 방식이다. 
개요에서 설명했던 것처럼, 메시지 타입은 요청(Request), 응답(Response)이 있다.

HTTP 메시지는 ASCII로 인코딩된 여러 줄의 텍스트 정보이다. HTTP/1.1때는 읽을 수 있었지만 HTTP/2부터는 읽을 수 없으며 HTTP 프레임으로 나누어진다.

![](https://i.imgur.com/dLP88on.png)
HTTP/2의 이진 프레이밍 메커니즘을 통해 사용자가 API나 설정 파일 등을 변경할 필요가 없게 설계되어 보고 이해하기가 쉽다.

요청과 응답의 구조는 아래와 같다
> 1. 시작줄에 실행되어야 할 요청/응답(성공 or 실패) 기록
> 2. HTTP 헤더(option) -> 요청, 메시지 본문 등에 대한 설명 
> 3. 요청에 대한 모든 메타 정보가 전송되었음을 알리는 빈 줄
> 4. 요청에 관련된 내용 응답 관련 문서 등(option. 본문의 존재 유무 및 크기는 첫 줄과 HTTP 헤더에 명시)
> 5. HTTP 메시지의 페이로드로 오는 본문

![](https://i.imgur.com/INOxtoc.png)
> 요청 헤드(head): HTTP 메시지의 시작 줄 + HTTP 헤더
> 본문(body): HTTP 메시지의 페이로드(Payload)

여기서 요청과 응답의 구조에 대해서 조금 더 자세히 살펴보자
## HTTP 요청
### 시작 줄
1. HTTP 메서드(GET, PUT, POST, HEAD, OPTIONS 등)를 통해 서버가 수행해야 할 동작을 나타냄 
2. 요청 타겟 -> URL/ 포트, 도메인, 프로토콜의 절대 경로 등
	- 타겟의 포맷은 HTTP 메서드에 따라 달라짐
		- 일반적인 포맷 
			- Origin 형식으로 알려진 절대경로 
				- ex) HEAD /test.html?query=minsu
			- absolute 형식으로 알려진 완전한 URL
				- ex) GET http://developer.mozilla.org/ko/docs/Web/HTTP/Messages HTTP/1.1
			- authority 형식으로 알려진 도메인 이름 & 옵션 포트(URL의 인증 컴포넌트로 HTTP 터널을 구축하는 경우에만 CONNECT와 함께 사용가능)
				- ex) CONNECT developer.mozilla.org:80 HTTP/1.1
			- asterisk 형식으로 알려진 모든 서버 나타내는 포맷
				- ex) OPTIONS * HTTP/1.1
3. HTTP 버전

### 헤더
문자열 다음에 콜론(:)이 붙고 뒤에 오는 값은 헤더 따라 달라짐.

![](https://i.imgur.com/rtFLB4L.png)

#### 요청 헤더의 종류
>Via(메시지 전달추적, 요청루프 방지, 발신자의 프로토콜 기능 식별) 등의 General Header -> 메시지 전체 적용
>
> Request Header -> 요청 구체화, 컨텍스트 제공, 제약 설정, 요청 내용 수정 등
>
> Representation Header -> 메시지 데이터의 원래 형식과 적용된 인코딩 설명 

### 본문
요청의 마지막 부분.
GET, HEAD, DELETE, OPTIONS처럼 리소스를 가져오는 요청은 본문이 필요없다

본문은 두 가지 종류로 나뉜다
> 헤더 두 개(Content-Type, Content-Length)로 정의된 단일 페이지로 구성되는 단일-리소스 본문
> 
> 다중 리소스 본문 -> Web Form(유저와의 상호작용)과 관련. 

## HTTP 응답
### 상태 줄
HTTP 응답의 시작 줄.
1. 보통 HTTP/1.1인 프로토콜 버전
2. 요청의 성공 여부를 나타내는 상태코드
3. HTTP 메시지를 이해할 때 도움되는 상태 텍스트
#### 상태코드
> 상태 코드는 5개의 블록으로 나뉜다.
> 1. 1XX Informational
> 2. 2XX 성공
> 3. 3XX 리디렉션
> 4. 4XX 클라이언트 오류
> 5. 5XX Server Error
> 
> XX는 0~99의 숫자를 나타내며 대부분 대표적인 숫자가 있다.
> ex) 200, 404, 500 등

### 헤더
다른 헤더와 동일한 구조를 가진다
문자열 다음 콜론(:), 그 뒤의 값은 헤더 따라 다르다.

#### 헤더 종류
![](https://i.imgur.com/O75dGT3.png)
>Via(메시지 전달추적, 요청루프 방지, 발신자의 프로토콜 기능 식별) 등의 General Header -> 메시지 전체 적용
>
> Response Header -> 서버에 대한 추가 정보 제공. Vary나
> Vary : 요청 메시지의 메서드 및 URL을 제외하고 응답 내용에 영향을 준 부분 설명. 콘텐츠 협상(동일한 URL에서 리소스의 서로 다른 버전을 제공하기 위해 사용하는 메커니즘. 제일 잘 맞는 언어, 인코딩 등을 명시)
> 
>
> Representation Header -> 메시지 데이터의 원래 형식과 적용된 인코딩 설명 

### 본문

응답의 마지막 부분
본문이 없을 수도 있다(201 Created, 204 No content 등)

#### 본문의 종류
>Content-Type와 Content-Length라는 두 개의 헤더로 정의하는 길이가 알려진 하나의 파일로 구성된 단일-리소스 본문(Single-resource bodies).
>
  Transfer-Encoding가 chunked로 설정된 청크로 나뉘어 인코딩되는 길이를 모르는 하나의 파일로 구성된 단일-리소스 본문
  Transfer-Encoding : 사용자에게 entity를 안전하게 전송하기 위해 인코딩 형식을 지정한 헤더
  >
  서로 다른 정보를 담고 있는 멀티파트 본문으로 이루어진 다중 리소스 본문(option)

## HTTP/2 프레임
HTTP/1.X 버전은 성능 결함이 있어 현재는 대부분 2 이상을 쓴다
따라서 2는 이 문제들을 다른 방식으로 보완했다고 볼 수 있다.

- 본문은 압축이 되지만, 헤더는 압축이 되지 않는 HTTP/1.X 
- 연속된 메시지들은 비슷한 헤더 구조를 가지지만 메시지마다 반복되어 전송됨
- 다중전송(multiplexing)이 불가능

이러한 문제들을 보완한 HTTP/2의 프레임은 다음과 같다
![](https://i.imgur.com/1fDNkh2.png)
이렇게 프레임으로 나누어 스트림에 끼워넣으면서 데이터와 헤더 프레임을 분리한다.
데이터와 헤더 프레임을 분리함으로써 기존에 가진 문제점을 해결할 수 있다.

- 프레임을 분리하면서 헤더 프레임만 선택하여 압축이 압축이 가능해진다.
- 스트림 여러개를 한 번에 묶는 **멀티플렉싱**이 가능해지면서 TCP 연결이 효율적이게 된다.

