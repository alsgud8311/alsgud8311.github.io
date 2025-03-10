## 🛠️ 주요 작업
- [x] 커스텀 에러로 서버 에러 처리 ✅ 2024-09-10
- [x] 기존 모델, 레포지토리, 컨트롤러 기능을 다시금 확인하고 기능에 맞게 리팩토링 ✅ 2024-09-10
- [ ] 옵저버 패턴으로 상태관리 설계

## 📚 학습 키워드
- [x] 커스텀 에러 정리✅ 2024-09-10
- [x] 상태관리 ✅ 2024-09-10
- [x] 옵저버 패턴 ✅ 2024-09-10


## 고민 및 해결과정

### Connection Pool과 비동기 병렬 수행
Connection Pool의 경우 db에 연결된 Connection을 미리 만들어두고 Pool에 보관하였다가 필요할 때 Connection을 가져다가 사용한 후, 다시 Pool에 반환하는 기법이다.

이러한 Connection Pool을 사용한 방식에서 한 컨트롤러에서 여러번 db에 접근할 때 `Promise.all` 을 사용하지 않은 이유에 대한 질문이 나왔다.
```js
  async function getCard(username) {
    try {
      const cards = await cardModel.getCard(username);
      const columns = await columnModel.getColumn(username);
      const data = columns.map((col) => {
        return {
          classify: col.classify,
          cards: cards.filter((card) => card.task_column === col.classify),
        };
      });
      return data;
    } catch (error) {
      // 나중에 커스텀 에러로 고치기
      throw new Error("에러");
    }
  }
```
이러한 `Promise.all`의 경우 모든 비동기 처리에 대해서 수행을 병렬적으로 실행한다는 장점이 있었다. 하지만 이를 mysql에서 사용할 수 있을까에 대한 제대로 된 지식이 부족하여 제대로 대답하지 못했다.
찾아본 결과 Mysql은 멀티스레드 기반이기 때문에 connection 자체가 이러한 병렬 처리에 대해서 connection pool을 두고 병렬적으로 처리하는 프로미스 여러개일 경우를 각각의 connection이 두고 처리하는 방식이었기 때문에 Promise.all을 사용해도 상관 없을 뿐더러 추가적으로 성능 향상까지 가능할 수 있기 때문에 바꿔주었다.
```js
export default (function () {
  async function getCard(username) {
    try {
      const [cards, columns] = await Promise.all([
        cardModel.getCard(username),
        columnModel.getColumn(username),
      ]);
      const data = columns.map((col) => {
        return {
          classify: col.classify,
          cards: cards.filter((card) => card.task_column === col.classify),
        };
      });
      return data;
    } catch (error) {
      // 나중에 커스텀 에러로 고치기
      throw new Error("에러");
    }
  }
```

### 커스텀 에러 사용과 에러 던지고 받는 위치 선정
이번에 커스텀 에러를 사용함으로써 어디에서 에러가 발생시키고, 어디서 받아야 할지에 대한 고민이 많았다.

기존의 경우 데이터를 fetch 해오는 모든 경우(db연결, 레포지토리 등)에 대해서 try-catch문을 사용했지만 정작 이러한 catch문에서 console로 출력만 시킬 뿐 이에 대한 에러처리가 되어있지 않아 해당 프로미스를 호출하는 함수 내에서는 제대로 catch하지 못하는 문제가 발생했다.
따라서 이러한 에러를 언제 던지고 어디에서 이러한 에러를 받는지를 다시금 생각해야 할 필요성이 대두되었다.

고민한 결과 db쪽에서 대부분 오류가 나는 현 상황을 고려하여 
- 쿼리 실행문
- connection 실행문
을 기준으로 커스텀 에러를 나누어 던지도록 설계했다.

```js
const getConnection = async () => {
  try {
    const connection = await sql.getConnection();
    return connection;
  } catch (error) {
    throw new DBConnectionError(error.message);
  }
};

export const transaction = async (logic, query) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await logic(connection, query);
    await connection.commit();
    return result;
  } catch (error) {
    console.log("error: rollback:", error.message);
    await connection.rollback();
    throw new QueryError(error.message);
  } finally {
    console.log("release connection");
    connection.release();
  }
};
```
쿼리 실행문의 경우 transaction에서 try-catch문에서 쿼리를 실행하는 중 오류가 발생하면 QueryError를 던짐으로써 query를 실행하는 과정에서의 에러를 잡아 따로 던져주었고, try-catch문 밖에서 활용해야 하는 connection의 경우
```js
  async function getCard(...args) {
    try {
      const data = await transaction(cardRepository.getCardByUsername, args);
      return data;
    } catch (error) {
      handleDBError(error);
    }
  }
```
각 모델에서 트랜잭션을 하는 일련의 과정에서 생기는 DBConnectionError와 QueryError를 모두 여기서 캐치하여 하나의 에러로 감싸는 형태로 고안했다.
```js
export class DBConnectionError extends Error {
  constructor(message) {
    super(message);
    this.name = "DBConnectionError";
  }
}
export class QueryError extends Error {
  constructor(message) {
    super(message);
    this.name = "QueryError";
  }
}

export class DBError extends Error {
  constructor(message, cause) {
    super(message);
    this.status = 500;
    this.cause = cause;
    this.name = "DBError";
  }
}

export function handleDBError(err) {
  if (err instanceof QueryError) {
    throw new DBError("Server Error", err);
  } else if (err instanceof DBConnectionError) {
    throw new DBError("Server Error", err);
  } else {
    throw new DBError("Server Error", err);
  }
}

```
이렇게 각각의  부분에 대해 연결에서 생기는 오류와 쿼리문을 실행할 때 생기는 커스텀 에러를 만들고, 이 둘을 모두 묶어 하나의 에러로 관리할 수 있는 DBError를 만들어 이를 던져 Controller에서 받을 수 있도록 하였다.
```js
  async function getCard(username) {
    try {
      ...
    } catch (error) {
      throw error;
    }
  }
```
컨트롤러에서 받은 에러의 경우 현재까지는 DBError밖에 없지만, 나중에 ValidationError와 같은 예외들을 잡아 던질 수 있기 때문에 컨트롤러는 각 종류의 에러를 받아 다시금 router에게 던진다.
```js
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    let todoData = await cardController.getCard(req.user.username);
    res.status(200).json({ data: todoData, path: process.env.DIRNAME });
  } catch (error) {
    next(error);
  }
});
```
router에서 다시금 잡은 에러는 next를 통해 다음 미들웨어로 넘어가게 하는데, 다음 미들웨어는 에러 처리를 위한 미들웨어이다.
```js
export default function errorMiddleWare(app) {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status).json(err.message);
  });
}
```
에러 미들웨어의 경우 아직까지는 간단하게 구현하였다. error의 property로 설정한 status코드와 에러 메세지를 반환하도록 하였다.


## 리뷰 요청
안녕하세요 멘토님. 고생 많으십니다.
어제오늘동안 저는 MVC 패턴에 대해 다시금 학습하고 이를 직접 프로젝트에 적용해보는 시간을 가졌습니다. 하지만 해당 패턴을 공부하면서도 아직까지도 이를 제대로 설계했는지 확신이 들지 않아 이러한 부분을 리뷰 요청 드리려 합니다.

제가 리뷰 요청드리는 부분은 다음과 같습니다.
### MVC 패턴의 적용과 에러처리
이번에 서버의 구조를 바꾸면서 각 디렉토리 구조 또한 아래와 같이 바꾸었습니다
-  Controller
	- 라우터 디렉토리
		- 각 api 요청에 대한 라우터를 도메인별로 설정
	- 도메인별 controller 파일
		- model에 해당 데이터를 제어하도록 전달
			- 각 도메인별 비즈니스 로직을 수행하고, 여러 도메인별 비즈니스가 겹쳐져 있는 경우 해당 컨트롤러에서 제어하여 알맞은 데이터를 리턴하도록 변환
- Model 
	- 도메인별 모델파일을 담음
	- 레포지토리에 의존하여 데이터에 접근하는 단일 비즈니스 로직을 수행
	- 레포지토리 디렉토리
		- db에 직접적으로 접근하여 데이터를 제어함
- View
	- 레이아웃을 제외하고 클라이언트 측에서 모두 처리

따라서 현재 구조는 api 요청 -> router -> controller(통합 비즈니스 로직) -> model(개별 비즈니스 로직) -> repository 순으로 접근하여 데이터에 접근하고 제어하는 과정을 거치게 됩니다. 
또한 이 과정에서 db에 접근하여 쿼리를 수행하던 중 생기는 에러와 db에 connection을 생성하는 과정 중에 생긴 에러를 커스텀 에러로 처리하여 router에서 받은 뒤, 미들웨어를 통해 에러를 response로 보내도록 설계하였습니다.
설계한 구조와 에러처리 부분에 대해서 보완할 부분 피드백 주시면 감사하겠습니다!

