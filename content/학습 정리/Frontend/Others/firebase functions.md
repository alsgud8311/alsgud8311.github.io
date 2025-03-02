Firebase Cloud Functions란?
Firebase에서 cloud functions에 대한 설명을 찾아보면 아래와 같이 나온다.

> Firebase용 Cloud Functions는 백그라운드 이벤트, HTTPS 요청, Admin SDK 또는 Cloud Scheduler 작업에 의해 트리거된 이벤트에 대한 응답으로 백엔드 코드를 자동으로 실행할 수 있는 **서버리스 프레임워크**입니다.

쉽게 말해서 서버가 기본적인 api에 대한 로직을 작성한 후 이후 해야 하는 배포부터 관리 문제 전반을 firebase쪽에 이관하는 것이다.
유명한 서버리스 프레임워크는 functions 말고도 aws lambda 등이 있다.
그렇다면 이 서버리스라는 개념은 정확히 무엇을 의미하는 걸까?

## 서버리스 아키텍처(serverless architecture)
단어 그대로 server + less, 서버를 관리할 필요가 적어진다는 뜻이다.
개발자가 일일이 서버를 관리할 필요 없이 애플리케이션을 빌드하고 실행할 수 있도록 하는 클라우드 네이티브 개발 모델이다.
그렇다고 서버가 없어지는 것은 아니다. 그저 개발자가 서버를 건드릴 필요가 없다는 뜻이지, 서버리스 모델에도 서버는 존재한다. 하지만 그걸 관리하는 주체가 클라우드 제공업체로 바뀐다는 점과 이 클라우드 제공업체에서 서버 인프라에 대한 프로비저닝, 유지관리, 스케일링 등 서버 관리에서 필요한 필수적인 요소를 대신 해준다.

서버리스 아키텍처와 IaaS(Infrastructure-as-a-Service)는 클라우드 컴퓨팅 모델이라는 점에서 공통점을 가지지만, 서버리스는 **이벤트 관리 기반 모델**이라는 점에서 큰 차이점을 가진다.

![](https://i.imgur.com/Iae7V2n.png)

> Iaas(Infrastructure-as-a-Service)
> PaaS(Platform-as-a-Service) SaaS(Software-as-a-Sercvice) 와 함께 3대 클라우드 서비스 모델 중 하나이며, 스토리지, 네트워크, 서버 등을 모두 제공하면서 서버 관련 인프라를 모두 제어해준다

Iaas는 사용자가 인프라를 직접 관리하는 것이지만 서버 설정, 네트워킹, OS 설치 등의 세팅과 같은 일련의 과정을 클라우드 상에서 하는 것이다. 반면 서버리스의 경우에는 서버 인프라의 처음부터 끝까지 클라우드를 통해 서비스를 제공하기 때문에 서로 관여하는 정도가 다르다.

또한 가장 중요한 점은 Iaas는 서버를 계속 돌리고 있는 상태여야 하기 때문에 가동 시간이나 용량 등에 대해서 비용이 책정되는 반면, 서버리스는 내가 설정해놓은 **특정 함수가 실행되었을 경우**에 이벤트를 발생시켜 리소스를 동적으로 할당한다(그래서 이름을 lambda나 functions로 하는듯). 따라서 아무리 트래픽이 몰린다 하더라도 동적 할당으로 견딜 수 있다. 하지만 쓴 만큼 돈은 나온다.(on-demand)

아무튼 이러한 서버리스 아키텍쳐는 **FaaS(Function-as-a-Service)** 와 **Baas(Backend-as-a-Service)** 로 나뉘는데, 우리가 서버리스를 지칭할 때는 주로 **FaaS**를 나타낸다고 보면 된다.
Faas는 특정 함수 단위로 코드를 실행할 수 있는 서비스로, 클라우드 서비스 제공자가 특정 요청에 대해 발생하는 함수를 실행할 수 있는 환경을 제공하도록 하여 사용자들의 요청에 함수가 실행될 수 있도록 한다.

>BaaS(Backend-as-a-Service)
>BaaS는 클라우드 제공자가 백엔드(서버)에서 필요한 모든 것들을 제공한다(인증, 스토리지, db 등). Firebase나 AWS Amplify가 대표적이며, 이를 통해 remote 푸시 알림과 같은 기능들을 사용할 수 있다.

### 특징
- Stateless하다
	- 함수가 실행되는 동안만 관련된 리소스만을 할당하고 끝나면 반환하기 때문에 상식적으로 생각해도 stateless할 수밖에 없다. 따라서 지속되는 상태를 유지하기 위해서는 DB를 따로 이용해야 할 필요성이 있다.
- Ephemeral하다(일시적임)
	- stateless와 비슷한 결이긴 하다. 특정 이벤트가 발생했을 경우 컨테이너로서 배포가 되고 회수되는 과정이 반복되기 때문에 일시적으로 배포된다고 볼 수 있다.

### 장단점
장점은 무엇보다 서버를 그대로 맡기기 때문에 서버에 대한 문제를 신경쓰지 않을 수 있다는 점이다. 나같은 프론트가 작은 애플리케이션 하나 만들려면 서버가 필요하기 때문에 서버 코드 쓰고 aws 인스턴스를 파고 배포하랴.. 프록시 설정하랴.. pm2 설정하랴.. crontab 설정하랴... 할게 많은데 제대로 할줄도 몰라서 킹받게 시간을 많이 잡아먹는다.
하지만 이 귀찮은 작업들을 알아서 처리해준다고 하니 우리야 땡큐다. 게다가 대부분 호출 100만건정도는 무료로 제공하는 횟수이니, 미니 프로젝트에서는 이만큼 안성맞춤인 서버가 없다. 또한 갑자기 트래픽이 몰린다고 해도 다이나믹하게 알아서 스케일업을 해주기 때문에 신경쓸 필요가 없다(사실 신경쓰긴 해야함).


하지만 장점이 뚜렷한 만큼 그에 따른 단점 또한 명확하다.
서버에 대한 상세 설정이나 인프라 제어 등에 대해서는 모조리 서비스 제공하는 곳에서 관리하기 때문에 우리가 설정할 수 있는 범위가 제한된다는 점이 자유도를 묶는다.
또한 서버리스 함수의 경우에는 나 또한 이번에 하면서 느낀 현상으로, **콜드 스타트(Cold Start)** 라는 현상인데 처음 호출 시에 시간 지연이 조금 발생한다.

#### Cold Start란?
위에서 말했듯이 서버리스는 함수가 실행될 때마다 리소스(자원)을 동적으로 할당하는 구조이기 때문에 함수가 실행되는 동안만 관련된 자원이 할당되고, 실행이 끝나고 응답이 돌아왔다면 함수는 할당된 리소스를 반환한다.

![](https://i.imgur.com/sSac1EY.png)
여러 요청이 동시에 오는 경우 기능 복사본을 생성하여 재활용하거나 한번 요청이 갔을때 유지하는 유휴 상태에서 벗어나게 되면 다시 위와 같은 라이프사이클을 돌아야 하게 되니, 다시금 속도가 느려지게 되는 현상이 있다.
예전에 IEEE에서 AWS Lambda와 Microsoft Azure Functions에서 벤치마크를 수행한 결과가 있는데, 300ms에서 24초까지 시간이 걸렸다고 하니 이 점이 사용자에게 서비스 제공 과정에 있어서 치명적인 단점으로 작용한다.
그래서 firebase의 cloud functions와 같은 곳에서는 최소 인스턴스 수를 설정하여 컨테이너를 유지함으로써 최소한 들어올 수 있는 사용자에 대해 바로 응답할 수 있도록 하는 등의 대비책을 통해 속도를 줄이는 방법을 사용한다. 추가적으로 종속성 줄이기, 캐싱 헤더 사용, 올바른 지역 선택 등을 통해 속도를 줄일 수 있다고는 하지만 효과적으로 줄이기 위한 확실한 방법은 최소 인스턴스 수를 유지하는 것이다. 이를 위해 스케줄링을 따로 시켜 계속해서 인스턴스를 유지하도록 하는 등의 방법을 쓰는 것으로 보인다.

## firebase Functions를 사용해서 서버리스 배포하기(node.js)
서버리스(FaaS)에 대해 알아보았으니 사용하면서 직접 알아가보자.
나는 FaaS들 중에 firebase Functions를 사용했다. 이유는 이 전에 firebase를 사용한 cloud messaging 기술을 내 프로젝트 앱에 사용했던 경험이 있는데, firebase에 cloud messaging 말고도 다른 기능들이 정말 많아 계속 한번쯤은 사용해보고 싶다는 생각이 들었기 때문이다.
나는 기존 functions를 통해 런타임에 배포하는 것을 넘어 db 또한 따로 배포하기 귀찮았기 때문에 firebase에서 제공하는 cloud db인 **firestore**까지 이용할 것이다.

> 해당 글은 node.js 기준으로 작성되었습니다.

### 프로젝트 initialize
#### 프로젝트 추가하기
[Firebase Console에서 프로젝트 추가하기](https://console.firebase.google.com/?hl=ko)
![](https://i.imgur.com/VbeYh5o.png)
프로젝트를 추가하는 것은 사이트에서 추가하면 되기 때문에 어려운 것은 없다. 등록을 끝내고 나면 이런 식으로 콘솔이 뜬다.

#### Firebase CLI 설치 및 초기화
```shell
npm install -g firebase-tools
```
firebase functions를 런타임에 배포하기 위해서는 Firebase CLI가 필요하다.
npm을 통해 다운로드 받아주자
다운로드 받으면 Firebase를 실행하여 로그인 및 기타 초기화 작업을 할 수 있다.
```zsh
// 얘 쓰면 로그인창 뜸
firebase login

// 내가 프로젝트 생성할 디렉토리로 이동
cd 디렉토리

// firestore init
firebase init firestore 

// functions init
firebase init functions
```
이렇게 세팅하다보면 어떤 언어 쓸거냐는 질문이 나올건데 나는 js로 선택해주었다
```
myproject
+- .firebaserc    # `firebase use` 명령어를 통해 프로젝트 간 전환을 빠르게 도와주는 숨김 파일
|
+- firebase.json  # 프로젝트 속성을 설명하는 파일
|
+- functions/     # 모든 함수 코드가 포함된 디렉터리
      |
      +- .eslintrc.json  # 자바스크립트 린팅 규칙을 포함한 선택적 파일
      |
      +- package.json  # Cloud Functions 코드를 설명하는 npm 패키지 파일
      |
      +- index.js      # Cloud Functions 코드의 메인 소스 파일
      |
      +- node_modules/ # package.json에 선언된 의존성들이 설치되는 디렉터리
```
그럼 이런 식으로 처음 세팅이 완료된다

```json
//package.json
{
  "name": "functions",
  "description": "Cloud Functions for Firebase",
  "scripts": {
    "lint": "eslint .",
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "22"
  },
  "main": "index.js",
  "dependencies": {
    "cors": "^2.8.5",
    "firebase-admin": "^12.1.0",
    "firebase-functions": "^5.0.0"
  },
  "devDependencies": {
    "eslint": "^8.15.0",
    "eslint-config-google": "^0.14.0",
    "firebase-functions-test": "^3.1.0"
  },
  "private": true
}
```
`package.json`을 열어보면 이런 식으로 scripts가 짜여 있어서 쓰기 편하다
기억하면 좋은 것은
- engines : 내가 쓸 node 버전 설정
- scripts
	- serve : emulator를 통해서 로컬에서 서버를 킬 수 있다. ui도 제공하니 보고 테스트하기 댕꿀이다
	- deploy: functions만 배포
솔직히 난 이정도만 썼다
```js
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();
```
처음에 index.js가면 잡다한 테스트용들이 주석처리 되어 있고 이런 식으로 해보라고 한다.
`initializeApp()`을 통해 Firebase 서비스에 접근 가능하도록 초기 설정을 할 수 있으며 인증처리 등의 과정이 이루어지면서 연결된다.
#### http 요청 받기
요청 핸들러를 사용하면 HTTP 요청을 통해 함수를 트리거시키고, 해당 함수를 통해 응답을 반환시킬 수 있다.

| 옵션                                         | 설명                                                                                                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `region`                                   | HTTP 함수는 단일 리전과 여러 리전을 지정할 수 있습니다. 여러 리전이 지정되면 리전별로 별도의 함수 인스턴스가 배포됩니다.                                                                               |
| `timeoutSeconds`(Python의 경우 `timeout_sec`) | HTTP 함수에서 최대 1시간의 제한 시간을 지정할 수 있습니다.                                                                                                                  |
| `cors`                                     | HTTP 함수가 CORS 정책을 지정할 수 있습니다. `true`로 설정하면 모든 출처가 허용되고, `string`, `regex`, `array`를 설정하면 허용된 출처를 지정할 수 있습니다. 명시적으로 설정하지 않으면 기본값은 false/CORS 정책 없음입니다. |
요청에 대한 옵션은 이렇게 지정해줄 수 있다.
```js
const { onRequest } = require("firebase-functions/v2/https");

exports.sayHello = onRequest(
  { cors: [/firebase\.com$/, "flutter.com"] },
  (req, res) => {
    res.status(200).send("Hello world!");
  }
);
```
요런 식으로 cors의 경우 내가 가지고 있는 도메인들을 설정할 수 있으며, 일반 express 사용하듯이 요청과 응답에 대한 콜백함수를 onRequest를 통해 보낼 수 있다.
참고로 exports.뒤의 이름은 기본 url 뒤의 uri로 더 붙게된다
```js
const functions = require("firebase-functions");
exports.api = functions.region("asia-northeast3").https.onRequest();
```
이렇게 region 옵션도 지정해주어 리전 설정해서 속도를 조금이라도 올릴 수 있다.
또한 https 프로퍼티를 통해 onRequest 메서드를 실행하면 배포할 때 https 로 배포된다.

### express + firebase functions로 요청과 응답 관리하기
기존의 웹 서버 프레임워크를 initialize한 app을 요청 핸들러에 인자로 넣으면 전체 앱을 HTTP 함수에 전달할 수 있다. 따라서 요청과 응답을 웹 서버 프레임워크를 통해 관리할 수 있는 것이다.

나는 express를 사용해서 요청과 응답을 처리해보고, 클라이언트와 서버 모두 해당 서버에서 돌릴 생각이었다.
```js
const functions = require("firebase-functions");
const path = require("path");
const { initializeApp } = require("firebase-admin/app");
const express = require("express");
const { routeManager } = require("./controller/index.js");
const cors = require("cors");

initializeApp();
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.json());

routeManager(app);
app.get("/", (req, res, next) => {
  res.send("index");
});

exports.api = functions.region("asia-northeast3").https.onRequest(app);
```
이렇게 `onRequest`에 initialize한 app을 인자로 넣어주었다. 그렇게 되면 해당 functions로 오는 http 요청들이 모두 app을 통하게 된다.
나는 간단한 프로젝트를 만들 예정이었기 때문에 미들웨어로 cors와 번들링할 정적 파일들에 대한 설정, json 파싱 등에 대한 설정만 해주었다.

클라이언트는 esbuild를 통해 번들링하여 `dist`라는 디렉토리에 넣어두었기 때문에 저렇게 설정해주었고, 기본 url에 대해서는 `index.html`파일만을 보내도록 했다. 어차피 SPA로 만든 프로젝트기 때문에 저거 하나만 설정해두었다.
api uri에 클라이언트까지 때려박은 이유는 귀찮아서다
![](https://i.imgur.com/ZlDgKYs.png)
아무튼 다른 추가적인 uri가 붙는 것에 대해서는 따로 functions를 나누지 않고 express의 Router를 이용해서 각 요청과 응답을 처리해주었다. functions를 도메인별로 나누는 것도 좋고 깔끔한게 좋으면 express에서 route만 별도 파일로도 관리할 수 있어서 취향차이인 것 같다.
암튼 이정도 세팅을 간단하게만 해주고 deploy '딸깍' 하면 배포도 척척 잘된다.

참고로 배포하려면 무료 요금제(spark) 요금제에서 Blaze 요금제로 바꿔야 한다.
![](https://i.imgur.com/UMyMqP7.png)
그래도 앵간한 만큼은 공짜로 쓸 수 있으니 야무지게 써먹자
![](https://i.imgur.com/sx8OoQw.png)

아무튼 '딸깍'만으로 관리할 필요가 없어지는 서버리스는 프론트인 나에게 그저 빛...![](https://i.imgur.com/Tg6rEWE.png)

## firestore 설정과 알면 좋을 것들
![](https://i.imgur.com/sEjPPwh.png)
처음 초기 세팅하는 과정에서 functions 세팅을 하고 firestore 세팅도 따로 할 수 있다.
http 요청에 따른 CRUD도 express에서 firestore에 접근하여 조작하면 된다.
```js
const admin = require("firebase-admin");
async function getUserList() {
  try {
    const data = await admin.firestore().collection("todo").get();
    return data.docs.map((doc) => new User(doc.data());
  } catch (error) {
    throw new Error(error);
  }
}
```
`admin`의 `firestore` 메서드를 사용하면 해당 프로젝트에 연결되어 있는 firestore에 접근하여 CRUD를 수행할 수 있다.

```js
const cityRef = db.collection('cities').doc('SF');
const doc = await cityRef.get();
if (!doc.exists) {
  console.log('No such document!');
} else {
  console.log('Document data:', doc.data());
}
```
중요한 점은 개별 데이터 객체에 대해서 `data()` 메서드를 사용해야만 내가 원하는 데이터가 나온다

### functions 없이 firestore만 사용하기
따로 functions 없이 firestore에만 접근하고 싶다면 firebase SDK를 따로 설정한 뒤에 서버를 키면서 초기화 시켜주면 된다.

firebase 콘솔 -> 프로젝트 설정 -> 아래 내 앱 -> SDK 설정 및 구성에서 내 firebase config를 볼 수 있다.
```
npm install firebase
```
firebase 따로 설치하고
```js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "API키",
  authDomain: "도메인",
  projectId: "프로젝트ID",
  storageBucket: "스토리지버킷",
  messagingSenderId: "메시지 센더ID",
  appId: "앱아이디",
  measurementId: "측정ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```
이렇게 InitializeApp하고 사용하면 된다.
### 쿼리
#### where문을 사용해서 단일 혹은 여러개 가져오기
```
// Create a reference to the cities collection
const citiesRef = db.collection('cities');

// Create a query against the collection
const queryRef = citiesRef.where('state', '==', 'CA');
```

```js
const citiesRef = db.collection('cities');
const snapshot = await citiesRef.where('capital', '==', true).get();
if (snapshot.empty) {
  console.log('No matching documents.');
  return;
}  

snapshot.forEach(doc => {
  console.log(doc.id, '=>', doc.data());
});
```
where문을 사용하게 되면 쿼리 객체를 가져오게 되고,  `get()`을 통해 결과를 검색한 결과를 받아올 수 있다.
가져온 객체는 `QueryDocumentSnapshot`객체로, 여러 개의 프로퍼티를 가지고 있기 때문에 우리가 필요한 데이터만 가져오기 위해서는 `data()` 메서드를 통해 반환된 데이터를 이용해야 한다.

`where()` 메서드는 필터링할 `(필드, 비교 연산자, 값)`의 3가지 매개변수를 사용한다.
연산자는
- `<` : 미만
- `<=` : 작거나 같음
- `==` : 같음
- `>` : 보다 큼
- `>=` : 이상
- `!=` : 같지 않음
- `array-contains` : 포함하는 배열
- `array-contains-any` : 배열 안의 것들과 일치하는 모든 레코드
- `in` : 지정된 필드가 비교값과 일치하는 레코드
- `not-in` :  동일한 필드에서 같지 않은 에코드

```js
const stateQueryRes = await citiesRef.where('state', '==', 'CA').get();
const populationQueryRes = await citiesRef.where('population', '<', 1000000).get();
const nameQueryRes = await citiesRef.where('name', '>=', 'San Francisco').get();
```

#### 복합쿼리(And)
`==`나 `array-contains`를 연결하여 제약 조건을 AND와 결합
```js
citiesRef.where('state', '==', 'CO').where('name', '==', 'Denver');
citiesRef.where('state', '==', 'CA').where('population', '<', 1000000);
```

#### OR 쿼리 만들기
제약 조건을 논리적 OR과 결합
```js
const bigCities = await citiesRef
  .where(
    Filter.or(
      Filter.where('capital', '==', true),
      Filter.where('population', '>=', 1000000)
    )
  )
  .get();
```

### orderBy 및 존재 여부

```js
db.collection("cities").whereEqualTo("country", “USA”).orderBy(“population”);
```
해당 쿼리에 대해서 정렬 기준을 잡고 정렬
orderBy 안에 들어있는 필드가 없으면 반환하지 않음

## Firestore CRUD
### Create
```js
function addTodo(req) {
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  return admin.firestore().collection("todo").add({
    id,
    detail: req.body.detail,
    created_at,
  });
}
```
넣으려는 도메인에 대해서 add메서드를 통해 객체를 그대로 넣어줄 수 있다.
NOSQL인 만큼 데이터를 변형되지 않도록 신경써야 할 것 같다.

### Read
```js
const citiesRef = db.collection('cities');
const snapshot = await citiesRef.where('capital', '==', true).get();
if (snapshot.empty) {
  console.log('No matching documents.');
  return;
}  

snapshot.forEach(doc => {
  console.log(doc.id, '=>', doc.data());
});
```
아까 봤던 예시처럼 get()을 통해 데이터를 가져오고 개별 데이터에 대해서 data()를 통해 내가 원하는 데이터만 반환받자
### Update
```js
async function updateTodo(req) {
  try {
    console.log(req.body);
    const id = req.body.id;
    const detailToUpdate = req.body.detail;
    const todoToUpdate = await admin
      .firestore()
      .collection("todo")
      .where("id", "==", id)
      .limit(1)
      .get();
    if (todoToUpdate.empty) {
      throw new Error("update할 todo를 찾지 못했습니다.");
    }
    const todo = new Todo(cardToUpdate.docs[0].data());
    todo.update(detailToUpdate);
    return cardToUpdate.docs[0].ref.update(todo);
  } catch (error) {
    throw new Error("예상치 못한 Error가 발생했습니다.");
  }
}
```
데이터를 찾아와서, 데이터를 갱신한 다음 `update()`메서드를 통해 새롭게 교체할 객체를 넣어주면 통으로 바뀐다

### Delete
```js
async function deleteTodo(req) {
  try {
    const id = req.params.id;
    const cardToDelete = await admin
      .firestore()
      .collection("todo")
      .where("id", "==", id)
      .limit(1)
      .get();
    console.log("???", cardToDelete.docs[0]);
    if (cardToDelete.empty) {
      throw new Error("삭제할 todo를 찾지 못했습니다.");
    }
    return cardToDelete.docs[0].ref.delete();
  } catch (error) {
    throw new Error(error);
  }
}
```
원하는 데이터에 대해서 찾고 ref property의 `delete()` 메서드를 통해 삭제할 수 있다.
