## 주요 작업
- 클라이언트
	- 스타일 작업
	- css 번들링과 클래스 선택자를 통한 스타일 입히기
	- spinner 설정과 state에 따른 spinner 렌더링 테스트
- 서버
	- updateTodo에서 객체를 넘겨주는 방식으로 리팩토링
- 라이브러리
	- useEffect에서 이전의 값과 현재 값을 비교하기 위해 넣을 수 있도록 설계
	- Object.keys()대신 map 자료구조를 사용하여 이벤트 핸들러 검색 성능 최적화
## 학습 키워드
- firebase functions & firestore
- NOSQL
- 서버리스 아키텍처
- useEffect
- useRef
- useContext
## 고민 및 해결과정
### state와 함수를 동시에 다른 컴포넌트의 인자로 넘겨줄 때
```js
export default function Mainpage() {
...
  const [isLoading, setIsLoading] = mhReact.useState(false);
  
  async function fetchData() {
    const data = await apicall.get("/todo");
    setTodoList(data);
  }

  mhReact.useEffect(async () => {
    await fetchData();
  }, []);
...

  return (
	<div>
   ...
   <TodoList
        todoList={todoList}
        fetchData={fetchData}
      />
      <Spinner isLoading={isLoading} />
    </div>
  );
}

```
state에 따른 화면 렌더링을 테스트해보고 있던 와중에 TodoList에서 각 요소에 대해 
![](https://i.imgur.com/VwpeWPh.png)
이와 같이 X 버튼을 만들어 누르면 삭제 api 요청이 갈 수 있도록 만들었다.
하지만 삭제 api 요청이 가고난 뒤에는 다시금 데이터를 fetch해와 삭제해온 뒤 최신 정보를 갱신하기 위해서 앞에서 실행했던 fetchData를 가져올 필요가 있었다. 상위 컴포넌트에서 `setTodoList`를 통해 해당 리스트들에 대해서 관리하고 있기 때문이다.
```js
import * as mhReact from "mhreact";
import { deleteTodo } from "../../features/todo";
import "./index.css";

export default function TodoList({ todoList, fetchData }) {
  if (!todoList.length) {
    return <h1>로딩중...</h1>;
  }
  async function onClickDelete(id) {
    try {
      await deleteTodo(id);
      await fetchData();
    } catch (error) {
      alert("삭제 중 오류가 발생했어요!");
    }
  }
  return (
    <ul class="todo-list">
      {todoList.map((todo) => (
        <div class="todo-item">
          <li>{todo.detail}</li>
          <button
            class="todo-deleteButton"
            onClick={() => onClickDelete(todo.id)}
          >
            ❌
          </button>
        </div>
      ))}
    </ul>
  );
}

```
따라서 이런 식으로 fetchData 함수 자체를 가져와 delete 버튼을 누르면 delete api를 보낸 후에 fetchData를 통해서 다시금 정보를 갱신할 수 있도록 해주었다.
```js
export function destructuringFunctionalComponentWithRef(element) {
  const duplicated = {};
  Object.entries(element.props.refs).forEach(([ref, val]) => {
    if (typeof val === "function") duplicated[ref] = val();
    else duplicated[ref] = val;
  });
  return element.type(duplicated);
}
```
하지만 내가 설계한 fiber를 구성하는 과정에서 `destructuringFunctionalComponentWithRef()`는 혹시나 컴포넌트가 원하는 것들 중 상태를 넘겨주게 된다면, 홤수는 루트에 붙어있는 상태 참조값을 가져와 반환하는 함수이기 때문에 해당 함수를 실행시켜 반환받은 값을 컴포넌트의 함수 인자로 넣어줬어야 했다. 이 과정때문에 ref에 설정해놓았던 함수들은 모조리 실행시켜 주는 로직으로 작성하였다. 상태와 일반 함수를 따로 구분할 수도 없기 때문이다.
따라서 이를 어떻게 해결하면 좋을까 생각하다가 클라이언트에서 함수를 주는 방식을 바꿔보면 되지 않을까 생각했다.
```js
// 변경 전
<TodoList
        todoList={todoList}
        fetchData={fetchData}
      />
      
// 변경 후
<TodoList
        todoList={todoList}
        fetchData={() => {
          return fetchData;
        }}
      />
```
기존에는 함수 자체를 넣어줬었지만, 이번에는 함수를 wrapper 함수로 감싸 함수를 실행하면 내가 넘겨주고자 하는 함수 자체를 반환할 수 있는 함수를 인자로 넘겨주었다.
 fetchData 인자는 createElement 과정에서 사용자가 정의한 커스텀 property이기 때문에 props의 ref로 가게 되고, 이를 기반으로 fiber를 만드는 과정에서 `destructuringFunctionalComponentWithRef()`을 실행시키게 되는데, 해당 함수는 함수를 실행하는 함수가 아닌 함수를 반환하는 함수이기 때문에 실행 과정에서 실행할 함수만 남게 되어 문제를 해결할 수 있었다.

### 리뷰 요청
안녕하세요 멘토님! 고생 많으십니다ㅎㅎ

부족하지만 클라이언트도 번들링한 파일을 보내도록 해서 배포했습니다!
https://asia-northeast3-todo-24f54.cloudfunctions.net/api/

오늘 질문드리고 싶은 것이 한가지가 있습니다.
화요일 리뷰에서 멘토님께서 커스텀 이벤트를 말씀해주셔서 커스텀 이벤트에 대해서 조금 찾아보았습니다.

```js
// CustomEvent 생성
const catFound = new CustomEvent("animalfound", {
  detail: {
    name: "cat",
  },
});
const dogFound = new CustomEvent("animalfound", {
  detail: {
    name: "dog",
  },
});

// 적합한 이벤트 수신기 부착
obj.addEventListener("animalfound", (e) => console.log(e.detail.name));

// 이벤트 발송
obj.dispatchEvent(catFound);
obj.dispatchEvent(dogFound);

// 콘솔에 "cat"과 "dog"가 기록됨

```
이런 식으로 Custom Event에 대해서 객체를 생성하고 생성한 객체를 dispatchEvenet를 통해 이벤트를 발송하면 해당 커스텀 이벤트를 구독한 곳에 해당 이벤트를 실행하는 발행-구독 패턴을 닮았다고 생각합니다.

여쭤보고 싶은 것은 이러한 **커스텀 이벤트가 현업에서 많이 쓰이는지** 궁금합니다. 저는 이제까지 한번도 사용해본 적이 없어서 생소한 개념이기도 하지만, 발행-구독과 비슷한 패턴을 통해 전역에서 관리할 수 있는 장바구니같은 기능과 같은 곳에서 유용할 것 같다고 생각합니다. 현업에서는 이를 활용하는지, 한다면 어떤 식으로 활용하는지 궁금합니다!

벌써 마지막 리뷰네요,,🥲 이제까지 제가 꼼꼼하게 생각하지 못했던 것들을 많이 집어주셔서 저만의 안티패턴을 발견할 수도 있었던 시간이었던 것 같습니다. 항상 정성들여 리뷰해주셔서 정말 감사합니다! 

