## 주요 작업
- [ ] api 개발(진행중)
	- get 카드 불러오기(완료)
	- post 카드 추가하기(완료)
	- get 히스토리 불러오기(완료)
	- delete 카드 히스토리 전체 삭제(리렌더링 로직 진행중)
- [x] MVC 패턴 프로젝트 적용 ✅ 2024-08-29
## 학습 키워드
- [x] sql(학습 진행중) ✅ 2024-08-29
- [x] reverse engineering ✅ 2024-08-29
- [x] 트랜잭션 ✅ 2024-08-29
- [x] 비즈니스 로직 ✅ 2024-08-29
## 고민 및 해결과정
### CardListModel -> columnListModel에서의 column 추출
```js
function CardListModel(cardsList) {
  this.cards = modelProcessing(cardsList);
  function modelProcessing(cardsList) {
    cardsList.map((card) => new CardModel(card));
  }
}

function CardModel(card) {
  this.id = card.card_id;
  this.author = card.author;
  this.title = card.title;
  this.detail = card.detail;
  this.timestamp = card.timestamp.toDateString();
  this.col_name = card.col_name;
}

export default CardListModel;

```
sql 쿼리문을 통해 가져온 각각의 카드들에는 칼럼의 이름에 대한 정보가 들어가 있다. 
문제는  카드 모델 -> 카드 리스트 모델 -> 섹션 모델 -> 섹션 리스트 모델 순으로 데이터를 처리하는 방식으로 생각했었는데, 이 과정에서 카드에 있는 col_name 값을 어떻게 추출하여 카드 리스트에 넣어줘야 하는지에 대한 고민이 있었다.

각각의 요소에 대해서 여러번 for문을 돌면 해결될 수도 있는  방법이긴 하지만 이는 한번 돌았던 요소들에 대해서 다시금 반복문을 도는 것이 과연 좋은 방법일까라는 생각이 들었다.
물론 task card의 특수성을 고려할 때, 대부분 100개를 넘는 일이 그렇게 많지도 않을 것이라 생각할 수 있고, 이정도의 수를 도는 것은 티도 나지 않는 속도이지만서도 보다 효율적으로 칼럼을 추출할 수 있는 방법이 무엇이 있을까 생각해보았다.

1. forEach문을 통해 columnlist, card 배열을 따로 두고 각각 push
2. col_list에 대해서 쿼리문을 통해 컬럼 리스트를 가져오기

현재는 1번을 이용한 방식으로 로직을 작성했는데, 후에 이러한 두 방식 중에 어떤 방식이 나을지에 대해서 계속해서 고민해봐야할 문제인 것 같다.
### 비동기 리렌더링 관련된 문제
```js
import { onColumnDataChanged } from "../../../feature/mainsection/rendering.js";
import apicall from "../../../shared/utils/apicall.js";

export function submitNewCard(targetForm) {
  try {
    const title =
      targetForm.getElementsByClassName("form__input--title")[0].value;
    const detail = targetForm.getElementsByClassName(
      "form__textarea--cardDetail"
    )[0].value;
    const section = targetForm.id;
    apicall.post("/api/todo/new", {
      title: title,
      detail: detail,
      section: section,
    });
    onColumnDataChanged();
  } catch (error) {
    console.error(`error while data fetching : ${error}`);
  }
}

```
새로운 task를 추가했을 경우에 post 메서드의 api를 호출하여 데이터를 갱신하고, 이후에는 다시금 리렌더링을 촉발시킬 수 있도록 렌더링을 위한 파일을 feature에 놓고 끝나면 리렌더링을 시킬 수 있도록 이벤트를 전달하는 방식으로 설계하였다.
하지만 이러한 경우에 제대로 된 정보의 갱신이 이루어지지 않은 데이터를 다시 오는 오류가 있었다.

해당 코드를 자세히 본 결과 비동기적으로 동작하는 코드에서 post가 이루어진 후에 get요청이 이루어져야 하기 때문에 동기적으로 실행할 수 있도록 해야 하는데, 이러한 부분을 간과하고 async/await을 활용하지 않아 비동기적으로 post와 get 요청이 이어지기 때문에 갱신되지 않은 데이터를 fetch해오고 있음을 알게 되었다.

```js
router.post("/new", async (req, res) => {
  const { title, detail, section } = req.body;
  await transaction(todoRepository.addCard, [title, detail, section]);
  res.type("Content-Type", "application/json");
  res.status(201).json({ message: "Card created successfully" });
});
```
하지만 async/await을 사용하여 동기적으로 처리했음에도 똑같은 문제가 발생하게 되었고, api를 호출하는 함수 안에서 post 이후의 코드가 동작하지 않음을 알게 되었다. 문제는 post 요청을 받았을 때 따로 보내줄 데이터가 없다고 생각해서 응답을 추가해주었다.
