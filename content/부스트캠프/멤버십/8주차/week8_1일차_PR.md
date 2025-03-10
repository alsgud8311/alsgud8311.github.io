## 주요 작업
- 클라이언트
	- 컴포넌트 분리(ProgressBar, autoRollingNews)
		- autoRollingNews setTimeout으로 리팩토링
	- 확인 모달 위치 조정 및 다른 이벤트가 발생하지 않도록 관리
- 서버
	- 데이터 구조 구상
	- 서버 초기 환경설정
	- 더미데이터 삽입
- 기타
	- 주간계획작성
## 학습 키워드
- NOSQL
- useReduce
- firebase functions
## 고민 및 해결과정

### 서버리스 & 클라우드 데이터베이스와 쿼리 구성
나는 이번에 배포에 필요한 시간을 줄이기 위해서 저번 미션과 동일하게 firebase functions를 활용하여 서버를 만들고, 클라우드 데이터베이스인 firestore를 이용하여 데이터를 가져오는 작업을 서버에서 하는 식으로 구상했다.

이 과정에서 클라우드 데이터베이스에 더미 데이터를 넣어놓을 계획이었지만, 이 과정에서 NOSQL인 클라우드 데이터베이스를 어떻게 활용하여 
- 각 카테고리별 뉴스 데이터
- 내가 구독한 언론사의 뉴스 데이터
- 각 언론사의 뉴스 데이터
- 내가 구독한 언론사
- 전체 언론사
를 어떻게 구분하여 클라이언트로 넘겨주어야 할까? 에 대한 고민이 되었다.

내가 관리해야 하는 도메인을 나누어보자면
- 언론사(press)
- 구독(subscriptions)
- 언론사의 뉴스(articles)
가 있다.

![](https://i.imgur.com/YRN9gGb.png)
일단 현재 계획상으로는 해당 다이어그램과 같이 subscription에서는 press property에서 press들을 참조하고, Press의 articles 프로퍼티에서는 article들을 참조하며 article에서는 각 기사들에 대한 정보를 담을 수 있도록 했다.

Articles
- id: number
- title:string
- created_at: string
- thumbnail_image:string
- openLink:string
- category:string

Press
- id: number
- pressName: string
- pressLogo:string
- openLink:string
- editDate:string
- articles : Articles[]

Subscription
- id: number
- subscriber: string
- press: Press[]


NOSQL을 알아보는 과정에서 Firestore에 추천하는 데이터 구조 옵션이 있었다.
- 문서의 중첩 데이터로 표현
- 하위 컬렉션으로 표현
- 루트 수준 컬렉션
이를 적절히 활용하기 위해 나는 각 category, publisher, article을 collections로 구분할 수 있게 해 주어 도메인을 구분할 수 있도록 해주었다.
따라서 `categories(collections) -> category(doc) -> publishers(collections) -> publisher(doc) -> articles(collections) -> article(doc)`와 같은 구조로 더미데이터가 구성된다.