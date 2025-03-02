## 주요 작업
- [x] 카드가 없을 때,  카드 column이 뜨지 않는 현상 고치기(쿼리문 수정) ✅ 2024-09-05
- [x] 드래그 앤 드롭시 db에 order 반영 ✅ 2024-09-05
- [x] 정렬 애니메이션 ✅ 2024-09-05
## 학습 키워드
- [x] sql join ✅ 2024-09-05
## 고민 및 해결과정
### 빈 Column을 가져오지 못하는 에러

<img src="https://i.imgur.com/9YCbK92.png" width=300/>
기존의 경우 모든 카드들의 정보를 
```sql
select * from todo_cards where username = ? 
```
와 같은 방식으로 모든 카드들의 정보를 가져와 model에서 이를 column 별로 나누어 가공한 뒤 다시금 클라이언트에 response body를 넣어 response를 보내주는 방식으로 설계했었습니다.

하지만 이러한 sql문의 문제는 `todo_cards`의 모든 정보를 가져오기만 할 뿐, column들에 대한 정보를 따로 가져오지 않았으므로 `task_column` 테이블에 만약 어떠한 카드도 없을 경우 todo_cards에는 아무것도 없는 column의 정보는 나오지 않기 때문에 이를 join하는 방식을 통해서 해결했습니다.
```js
      const query = `
          SELECT 
              todo_cards.task_column,
              todo_cards.card_id,
              todo_cards.author,
              todo_cards.title,
              todo_cards.detail,
              todo_cards.created_at,
              task_columns.username,
              task_columns.col_name
          FROM 
            todo_cards
          right OUTER JOIN
              task_columns
          ON 
              todo_cards.task_column = task_columns.col_name
          WHERE task_columns.username = ?
      `;
```
이런 식으로 task_column을 right join하여 task column에는 있지만 todo_cards에는 없는 것들 또한 가져와서 다시금 처리를 해주도록 만들었습니다.


### 드래그 앤 드롭시 db에 order 반영
저는 대부분의 컴포넌트가 api호출이 이루어진 후 해당 컴포넌트에 대해서는 다시 get요청을 불러와 가져온 정보로 리렌더링을 한다는 것을 전제로 하고 있기 때문에 드래그 앤 드롭 시에 db에 order을 어떻게 반영해야 할지 고민이 되었습니다.

그러던 중 greenhopper 방식을 블로그 글에서 찾게 되었고, 이를 어떻게 하면 db와 클라이언트 모두에 적용시켜 매끄러운 사용자 경험을 가질 수 있을지에 대해서 고민한 결과입니다.
```js
document
    .getElementById("sections")
    .addEventListener("drop", async (event) => {
      try {
        const cardId = event.dataTransfer.getData("data");
        const targetCard = document.getElementById(cardId);
        handleSoftMove(event, cardId);
        await handleMoveActionsToServer(cardId, targetCard);
      } catch (error) {
        console.log(error);
      }
    });
```
drop 이벤트가 발생이 되면 해당 드래그의 대상이 되는 타겟으로부터 `dataTransfer`를 이용해 해당하는 카드의 고유 식별 ID를 가져오고 해당 컴포넌트를 변수에 할당했습니다.
```js
function handleSoftMove(event, cardId) {
    let closest = getEventTarget(event);
    if (!closest) return;
    closest.style.borderBottom = "none";
    const cardToMove = document.getElementById(cardId);
    if (closest.tagName === "SECTION")
      closest = closest.querySelector(".todoList");
    closest.className === "todoList"
      ? closest.insertAdjacentElement("afterbegin", cardToMove)
      : closest.insertAdjacentElement("afterend", cardToMove);
  }
  
  function getEventTarget(event) {
    let closest = event.target.closest("ul > div");
    if (!closest) closest = event.target.closest("section");
    return closest;
  }
```
변수에 할당된 뒤에는 타겟에 대해서 getEventTarget함수를 통해 가장 가까운 요소를 가져오게 됩니다.
0순위로는 각 카드의 가장 큰 container인 div element를 closest를 통해 찾고, 1순위로는 해당하는 위치의 칼럼에 대해서 찾아 리턴합니다.
찾은 위치에 대해서 조건문을 통해 
- section(column)의 경우 -> 가장 첫번째 위치로 넣기 위해 바로 card들을 담는 부모 요소의 ul로 지정하는 요소를 재할당합니다.
- 가장 가까운 곳이 card일 경우 -> 해당 카드의 다음 위치에 추가합니다.
이렇게 softmove를 먼저 수행하게 됩니다.

softmove를 수행하는 이유는 두 가지가 있습니다.
```js
function getPriortyAfterMove(target) {
    let next = 0,
      prev = 0;

    if (
      target.nextSibling &&
      target.nextSibling.nodeType === Node.ELEMENT_NODE
    ) {
      const nextElement = target.nextSibling;
      if (nextElement.tagName === "DIV") {
        next = parseInt(nextElement.dataset.priority, 10) || 0;
      }
    }

    if (
      target.previousSibling &&
      target.previousSibling.nodeType === Node.ELEMENT_NODE
    ) {
      const prevElement = target.previousSibling;
      if (prevElement.tagName === "DIV") {
        prev = parseInt(prevElement.dataset.priority, 10) || 0;
      }
    }

    if (next && prev) return Math.floor((next + prev) / 2);
    else if (prev) return prev + 100;
    else return 100;
  }
```
- `getPriorityAfterMove`함수에서 각각 카드의 element에 저장해두었던 우선순위인 `priority`를 가져와 계산하기 위해서입니다.
- softmove를 통해 미리 db에 반영되기 전의 상태를 그려놓고 다시금 렌더링을 시키면 보다 사용자 경험을 증진시킬 수 있다고 생각했습니다.

이렇게 softmove가 이루어진 후에는 api 호출 -> 서버의 라우터 -> 레포지토리를 이용해 이동한 column의 이름과 우선순위를 변경함으로써 적절한 위치에 우선순위를 기반으로 렌더링시켜 리렌더링 시에도 위치가 똑같이 나오도록 구현했습니다.

### taskify를 spa 방식으로 구현하기

기본적인 레이아웃 자체는 서버사이드 렌더링으로 구현을 했지만, 각각의 컴포넌트들은 클라이언트 사이드 렌더링으로 구현을 했었습니다.

하지만 이렇게 클라이언트 사이드 렌더링으로 구현하는 과정에서 views 폴더의 `index.js`파일은 엔트리 포인트를 가리키고, app에서 각 페이지에 대해서 렌더링을 시키도록 했었는데 이 과정에서 만약 로그인이 추가될 경우 경로를 입력할 수 없는 `express.render`의 특성상 서버사이드 렌더링 방식으로 다시금 다른 페이지로 이동시키려면 `index.js`와 `login.js` 파일 모두를 두는 방법밖에 생각이 나지 않았습니다.

하지만 이렇게 하게 되면 기존의 디렉토리 구조 자체가 무색해질 뿐더러, 기존에 사용하던 Pages 디렉토리는 전혀 필요없는 디렉토리가 되어버리기 때문에 이를 활용할 방법을 고민해보았습니다.

#### 주소를 받아 동적으로 페이지 렌더링하기
```js
// /app/app.js
import navigation from "../shared/utils/navigation.js";

function entryPoint() {
  const pathName = window.location.pathname;
  console.log(pathName);
  navigation.navigate(pathName);
}

window.onpopstate = navigation.onPageChanged;
document.addEventListener("DOMContentLoaded", entryPoint);
```
기존에 mainpage만 있던 때는 메인 페이지만을 렌더링 시키는 함수를 실행시키는 정도로 app.js를 사용했지만, 로그인 페이지가 추가됨에 따라 이를 pathname에 따라 필요한 페이지를 렌더링 시키도록 방식을 바꿨습니다.
```js
app.get("/", isLoggedIn, (req, res, next) => {
  res.render("index");
});

app.get("/login", isNotLoggedIn, (req, res, next) => {
  res.render("index");
});
```
따라서 서버에서도 pathname은 다르지만, 모든 페이지들이 entryPoint에서 일어나는 것을 알 수 있습니다.
이렇게 spa 방식으로 만들면 좋은 점은 아무래도 index만을 엔트리 포인트로 잡기 때문에 다른 pathname으로 접속했을 경우는 전부 클라이언트 사이드에서 제어가 가능하다는 점입니다. 따라서 서버가 렌더링하는 것은 기존 index의 레이아웃에 불과하기 때문에 api까지 사용해야 하는 서버의 역할이 분담되는 효과를 가진다고 생각했습니다.

다시 app.js로 돌아오면, pathname에 따라 spa를 구현하기 위해서는 navigation 객체가 필수적이었습니다. 왜냐하면
- pathname 관리
- 기존 레이아웃을 재사용하면서 body의 내용만 달라지게 하는 방식
- 페이지 이동에 따른 페이지별 이벤트 핸들러 붙이기/떼기
등의 조건을 갖춰야 했기 때문에 이를 navigation 객체를 만들어 페이지를 이동하는 로직을 담당하도록 했습니다

```js
// /shared/utils/navigation.js
import Main from "../../pages/main/index.js";
import Login from "../../pages/login/index.js";
import EventManager from "../../feature/index.js";

export default (function navigation() {
  const navigator = {
    "/": Main.render,
    "/login": Login.render,
  };
  function navigate(pathname, prev) {
    document.body.innerHTML = "";
    history.pushState({ pathname: prev }, null, pathname);
    navigator[pathname]();
  }
  function onPageChanged(event) {
    document.body.innerHTML = "";
    EventManager.detachEvent(event.pathname);
    navigator[window.location.pathname]();
  }
  return {
    navigate,
    onPageChanged,
  };
})();

```
navigation 객체는 어디서나 페이지 이동에 쓰여야 로직이기 때문에 fsd 계층 중에 shared 계층이 알맞은 자리일 것이라 생각해서 넣어주었습니다
해당 navigation객체는 등록된 pathname에 따라
1. 기존 레이아웃에서 body를 초기화
2. `history.pushState` 를 활용하여 이전 주소값을 가지고 뒤로가기를 눌렀을 경우 이에 대해서 다시금 올바른 페이지를 렌더링 할 수 있도록 로직 구성
3. 페이지별 렌더링 함수 실행
의 과정을 거칩니다.
onPageChanged는 기존 페이지가 다른 페이지로 이동할 때마다 실행될 수 있도록 window에 등록해놓은 이벤트핸들러인데, 이는 페이지가 바뀔 때마다 다시금 초기화시키고, 해당 페이지의 해당하는 이벤트 핸들러들을 종합해놓은 모듈을 head에서 떼어냄으로써 에러가 발생하지 않도록 구현했습니다.

```js
// /feature/index.js
export default (function EventManager() {
  const route = {
    "/login": "/feature/login/index.js",
    "/main": "/feature/main/index.js",
  };
  function attachEvent(pathname) {
    const script = document.createElement("script");
    script.src = route[pathname];
    script.type = "module";
    document.head.appendChild(script);
  }
  function detachEvent(pathname) {
    const script = document.head.querySelector(
      `script[src="${route[pathname]}"]`
    );
    if (script) script.remove();
  }
  return { attachEvent, detachEvent };
})();

```
메인페이지의 이벤트를 종합하여 등록하기만 해주던 feature/index.js는 페이지가 추가됨에 따라 페이지별로 디렉토리를 만들어 depth를 한단계 늘리는 대신에, 페이지별로 index.js를 따로 만들어 해당 페이지에 등록되어야 할 이벤트 위임과 핸들러들을 종합하여 등록할 수 있도록 해주었으며, 이를 절대경로로 설정하여 head의 script로 넣어주는 방식을 사용했습니다.

## 질문사항
저번 리뷰에서 말씀해주신 history 테이블을 이용한 redo, undo 조언을 참고하여 history 테이블을 다시 구상함에 있어서 애매한 부분이 있어 질문드리고 싶습니다.
```sql
-- `history` 테이블
CREATE TABLE `history` (
	`history_id` int auto_increment,
	`username` varchar(10) NOT NULL,
	`action` varchar(10) NOT NULL,
    `column_name` varchar(20) NULL,
	`title` varchar(20) NULL,
    `detail` varchar(500) NULL,
    `from_column` varchar(20) NULL,
    `to_column` varchar(20) NULL,
    `created_at` timestamp NULL,
    `card_id` int NOT NULL,
    `prev_priority` int NULL,
    PRIMARY KEY(`history_id`),
	FOREIGN KEY (`username`) REFERENCES `user` (`username`) on delete cascade on update cascade
);

```
history는 모든 action에 대해 저장해야 합니다.
하지만 각각의 action들에 대해서 필수적으로 가져야 하는 정보는 조금씩 다릅니다.
 - 카드 이동 -> 이전 칼럼, 카드 id, 간 후의 칼럼
 - 카드 삭제 -> 삭제 전 카드의 모든 내용
 - 카드 추가 -> 카드 id
 - 카드 수정 -> 이전 카드의 모든 내용
이를 어떻게 관리하면 좋을까에 대해서 생각해봤는데, 필수적으로 가져야 하는 값만 NOT NULL로 두고, 다른 칼럼에 대해서는 NULL로 설정해놔 없어도 되는 경우에는 NULL값으로 둘 수 있도록 해놨습니다.
하지만 이렇게 각각 히스토리가 가지는 종류가 여러개인데, 이러한 정보를 한가지 테이블에 모두 두는 것이 맞을까 고민이 됩니다.

이전에는 JSON형식으로 유동적인 정보에 대해서 전부 JSON으로 저장하도록 했는데, JSON을 통해 저장하는 것은 관계형 데이터베이스의 기본 원리와는 좀 벗어나는 방식이라는 피드백을 들었습니다.
그러면서도 이번 스터디그룹 리뷰 시간에서는 이에 대해 JSON으로 하신 분들도 계시는데, 유동적인 정보를 관리해야 하기 때문에 별로 상관이 없다고 생각하셨다는 분도 계셔서 무엇이 RDB의 활용성을 높일 수 있는 방식일지가 헷갈리는 것 같습니다. 이에 대해서 멘토님의 고견을 여쭙고 싶습니다.