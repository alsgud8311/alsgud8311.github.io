## 주요 작업
### 📚 Learning
- [x] MVC 패턴 ✅ 2024-09-09
- [x] 커스텀 에러 ✅ 2024-09-09
### 🛠️ Refactor & Fix
- [ ] 커스텀 에러로 서버 에러 처리
- [x] SQL문 수정 ✅ 2024-09-09
- [x] MVC 패턴을 보다 세부적으로 설계해서 model 고치기 ✅ 2024-09-09

## 학습 키워드
- nginx
- 커스텀 에러
- MVC 패턴
https://luxurious-share-af6.notion.site/4-aba822d7763544a5ad64778df911c630?pvs=4
## 고민 및 해결과정
### MVC 패턴의 적용
![](https://i.imgur.com/nqMwAVH.png)
MVC 패턴의 경우 Model, VIew, Controller가 주가 되어 이 세가지 요소를 통해서 느슨한 결합을 이루게 된다.(service, repository 등은 그때마다 취사선택해서 사용하는 것으로 보인다)
이 느슨한 결합은 Contoller가 중간자로서의 역할을 제대로 수행해야만 결합 관계가 느슨해지게 되는데, 나와 같은 경우 Model과 Controller의 관계가 모호했다.

먼저 나의 Controller의 경우, Route와 Repository가 모두 해당 디렉토리 안에 들어가있었으며, model은 repostiory를 통해서 직접적으로 db에 연결하는 과정을 다루어야 하지만 나는 그대로 routes에서 레포지토리에 접근했으며, model은 내가 원하는 데이터의 가공 정도만을 기능했다. 하지만 사실상 나의 구조에서의 MVC 패턴은 꼬인 관계가 되어버렸다. 이에 MVC 패턴을 더 충실히 따르면서도 느슨한 결합을 유지할 수 있도록 다시 설계했다.

- Controller
	- 라우터 디렉토리
		- 각 api 요청에 대한 라우터를 도메인별로 설정
	- 도메인별 controller 파일
		- model에 해당 데이터를 제어하도록 전달
- Model 
	- 도메인별 모델
	- 레포지토리에 의존하여 데이터를 가져옴
	- 레포지토리 디렉토리
		- db에 직접적으로 접근하여 데이터를 제어
- View
	- 레이아웃을 제외하고 클라이언트 측에서 모두 처리

따라서 현재 구조는 api 요청 -> router -> controller -> model -> repository 순으로 접근하여 데이터에 접근하고 제어하는 과정을 거치게 된다.