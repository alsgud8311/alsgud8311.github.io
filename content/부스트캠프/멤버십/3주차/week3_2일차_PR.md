## 주요 작업

- [x] history설계 ✅ 2024-09-03
	- history 테이블 설계
	- action별 history에 대해 레코드 추가 설정
	- 각 card 메서드에 대한 history 업데이트 로직
- [x] 쿠키와 세션 학습 ✅ 2024-09-03
- [x] 서버 로그인 작업 ✅ 2024-09-04
	- 서버에서 passport 사용하여 로그인 및 세션관리(진행중) 

## 학습 키워드
- XSS 공격
- sql Trigger
- 쿠키와 세션

#### 학습정리 종합본
https://luxurious-share-af6.notion.site/3-1f7fcdb0591241f487bdfa6f74f1200a?pvs=4

## 실행 방법
실행의 경우 
```shell
npm install
npm start
```
를 통해 실행하시면 됩니다!(.env 파일의 경우는 슬랙으로 송부드리겠습니다)

## 고민 및 해결과정
### undo, redo를 고려한 history 저장 관계
어제 올린 PR에서는 Undo, Redo를 고려한 history의 저장 관계와 이에 대해서 undo와 redo를 어떻게 수행할 것인가에 대한 고민을 적었습니다.

```
1. mysql 자체에서 트리거를 사용한 히스토리 기록
	- Mysql에서 지원하는 트리거(Trigger)은 특정 조건이 만족하면 저절로 실행되는 일종의 장치로, 한번 설정을 해놓으면 이벤트리스너와 비슷한 방식으로 동작을 계속 감시하면서 조건에 해당하는 동작이 수행되는 순간 실행되는 특징을 가진다.
	- 트리거를 사용하여 히스토리를 기록할 때, 히스토리는 자동으로 데이터베이스에 추가되기 때문에 undo, redo를 고려하는 입장에서 이를 설계해보자면
		- undo, redo를 수행하면 히스토리에서 해당하는 유저의 히스토리에서 가장 최근의 히스토리를 제거한다.
		- 히스토리가 제거될 때 실행되는 트리거를 등록하여 트리거를 통해 history의 undo를 수행한다.
		- 그러나 redo를 수행할 때는 지금 생각한 정도로는 history에 대한 History 테이블을 다시 만드는 방법밖에는 생각나지 않는데, history 테이블을 두 개 두는 것이 상식상으로는 괜찮아 보이지 않아서 고민이다.
2. 온메모리에서 deque를 통한 history 저장
	- mysql의 트리거를 사용하지 않고 따로 history에 Insert를 통해서 넣어주는 방식이다.
	- deque에서 5개의 개수제한을 놓고, action이 이루어질 때마다 하나씩 push해주되, 개수를 넘어가면 하나씩 dequeue해주면서 이에 대해 실질적으로 db에 반영해주는 방식이다.
	- 이렇게 설계할 경우, 온메모리에서 deque를 하나 두고 Undo와 redo에 대해서 action마다 수행하는 로직을 브라우저 상에 놓고 관리하게 된다.
	- 일반적으로 undo, redo는 새로고침이나 창을 나갔다가 다시 접속할 시에 없어지게 되므로, 새로고침이나 창 닫기 등의 행위를 이벤트리스너를 등록해놓고 있다가 해당 이벤트가 발생하면 flush를 통해서 모든 history의 내용을 반영하는 로직으로 작동시킨다.
		- 하지만 이러한 방식으로 갈 경우, history에 대한 예외 로직이 이루어지지 않아 만약 창을 껐을 시에 이벤트가 제대로 동작하지 않는다면 history의 갱신이 이루어지지 않으므로 이는 db의 손상을 일으킨다.
3. db에 action때마다 직접 넣되, 하나씩 빼서 undo, redo
	- 이 경우, action에 대한 api 호출을 하면서 해당 api를 처리하는 로직에서 히스토리 업데이트 + aciton에 대한 수행 자체를 하나의 트랜잭션으로 인식하여 사용해야 한다.
	- 각각의 action에 대한 히스토리의 레코드를 직접 쿼리문을 통해 넣어준다.
	- redo의 경우 undo한 것을 빼서 온메모리에서 stack 형식으로 저장하고 있다가 다시 실행할 경우 이에 대한 로직을 설계하여 다시금 돌아갈 수 있다.
	- redo의 경우 굳이 새로고침이나 창을 껐을 때, 복구시킬 의무는 없다고 생각한다. undo 또한 db에서 계속 끌어다가 복구할 수는 있겠지만은 굳이 이걸 전부 할 수 있도록 허용해주면 db에 부담이 갈 수 있기 떄문에 브라우저 내부에서 개수를 정해놓고 이를 막는 방식이 나을 것 같다고 판단했다.
	- 나는 히스토리와 action의 수행이 하나의 트랜잭션으로 판단해야만 정상적인 db의 갱신이 이루어지기 때문에 이 방식이 제일 합리적이라고 생각한다.
```

그때 생각한 방안은 세 가지가 있었는데요,
1. mysql 자체에서 트리거를 사용한 히스토리 기록
2. 온메모리에서 deque를 통한 history 저장
3. db에 action때마다 직접 넣되, 하나씩 빼서 undo, redo

처음에는 히스토리와 action 자체가 하나의 트랜잭션이라고 생각해야 한다고 생각했기 때문에 이를 보다 세심하게 관리할 수 있는 3번을 고민했었습니다. 2번의 방식에서 data flush에 대한 위험성을 줄인 버전이기 때문입니다.

하지만 그럼에도 불구하고 온메모리로 history에 대해서 관리하는 것에 대한 부담을 완전히 제거하기는 어렵다고 생각합니다. 세부적인 history 내역을 온메모리로 관리하는 것이 과연 안전하다고 할 수 있을까? 에 의문을 가졌습니다. 메모리에 있는 history의 내용이 변경될 가능성도 포함하고 있기 때문에 데이터의 일관성을 유지하기 어렵다는 점과 브라우저의 메모리를 낭비하는 것 자체가 비효율적으로 느껴지기 때문입니다.

그래서 이에 대한 해결책으로 1번의 방안과 3번의 방안을 합쳐 활용하는 방식이 어떨까 생각했습니다.
action이 일어나면 mysql 자체에서 트리거를 사용한 히스토리 기록을 업데이트 하고, 히스토리를 db에서 하나씩 빼어 쓰는 형태입니다.

트리거를 사용하여 히스토리를 기록할 때, 히스토리는 자동으로 데이터베이스에 추가되도록 해놓고, undo, redo가 나중에 추가될 경우에는 해당 유저에 해당하는 히스토리를 undo할 경우에는 가장 최신의 히스토리를 db에서 빼내어 이에 대한 action을 되돌리는 코드를 작성하면 될 것 같고, redo의 경우에는 어차피 action을 되돌리는 코드를 쓸 경우 또한 action이 card에 이루어질 것이기 때문에 이를 다시금 빼내어 undo를 undo 하는 방식으로 하면 될 것 같다고 생각했습니다.

아래는 제가 작성한 트리거입니다.(mysql workbench에서 수행했습니다)
```sql
delimiter $$

create trigger todo_submit_history
after insert on todo_cards
for each row
begin
	insert into history (username, card_id,action, column_name, title)
	values(NEW.author,new.card_id,"submit", NEW.task_column, NEW.title);
end$$

delimiter $$

create trigger todo_move_or_edit_history
after update on todo_cards
for each row
begin
	if OLD.task_column != NEW.task_column then
		insert into history(username, action, card_id,title, from_column, to_column)
        values(OLD.author, "move", old.card_id, old.title,old.task_column, new.task_column);
	else
		insert into history(username,card_id,action,title,detail)
        values(old.author,old.card_id,"edit", old.title, old.detail);
	end if;
end$$

delimiter $$

create trigger todo_delete_history
after delete on todo_cards
for each row
begin
	insert into history(username,card_id, title, detail, column_name, created_at)
    values(old.author, old.card_id, old.title,old.detail,old.task_column,old.created_at);
end$$
```

이러한 고민 과정에서 제가 드리고 싶은 질문은, `제가 선택한 방법이 효율적이고 안전한가?`에 대해 여쭙고 싶습니다. undo와 redo를 고려하여 trigger를 설계했지만, `서버 -> db에서 하나씩 꺼내어 해당 action에 맞춘 undo 로직 -> 다시 서버로 반영하는 과정에서 db에 대한 부담이 없는가?`에 대한 의문이 제대로 해소되지 못한 상태입니다. 이에 대해서 피드백 해주시면 감사하겠습니다!

### 클라이언트 사이드 렌더링에 따른 리렌더링 로직
#### 폴더 구조 설명
저도 하다보니 디렉토리가 너무 많아진 탓에 구분하시기 힘드실 수 있으실 것 같아 간단히 말씀드리려 합니다.
저는 클라이언트 사이드 렌더링을 많이 활용하고자 각각의 컴포넌트들에 대해서 fsd 패턴을 참고하여 컴포넌트들을 폴더별로 나눈 뒤에 다시금 해당 컴포넌트에 필요한 api나 스타일시트 등에 대해서는 가까운 자리에 배치했고, 이벤트 위임을 통한 로직은 feature에 큰 컴포넌트(widget)별로 구분한 뒤 index를 통해 스크립트를 통합하여 불러오는 방식으로 설계하였습니다.

전체적인 디렉토리 구조는 아래와 같습니다.
```
📦views
 ┣ 📂app
 ┃ ┣ 📜app.css
 ┃ ┣ 📜app.js
 ┃ ┗ 📜app.scss
 ┣ 📂asset
 ┣ 📂entities
 ┃ ┣ 📂addTodo
 ┃ ┃ ┣ 📂api
 ┃ ┃ ┣ 📂style
 ┃ ┃ ┣ 📂template
 ┃ ┃ ┗ 📜index.js
 ┃ ┣ 📂card
 ┃ ┃ ┣ 📂api
 ┃ ┃ ┣ 📂component
 ┃ ┃ ┣ 📂style
 ┃ ┃ ┣ 📂template
 ┃ ┃ ┗ 📜index.js
 ┃ ┣ 📂history
 ┃ ┃ ┣ 📂script
 ┃ ┃ ┣ 📂style
 ┃ ┃ ┣ 📂ui
 ┃ ┃ ┗ 📜index.js
 ┃ ┣ 📂historyItem
 ┃ ┃ ┣ 📂api
 ┃ ┃ ┣ 📂style
 ┃ ┃ ┣ 📂ui
 ┃ ┃ ┗ 📜index.js
 ┃ ┗ 📂section
 ┃ ┃ ┣ 📂api
 ┃ ┃ ┣ 📂component
 ┃ ┃ ┣ 📂style
 ┃ ┃ ┗ 📜index.js
 ┣ 📂feature
 ┃ ┣ 📂header
 ┃ ┃ ┣ 📜historyHandler.js
 ┃ ┃ ┣ 📜index.js
 ┃ ┃ ┣ 📜rendering.js
 ┃ ┃ ┗ 📜sortHandler.js
 ┃ ┣ 📂mainsection
 ┃ ┃ ┣ 📜addCardHandler.js
 ┃ ┃ ┣ 📜deleteCardHandler.js
 ┃ ┃ ┣ 📜editCardHandler.js
 ┃ ┃ ┣ 📜index.js
 ┃ ┃ ┣ 📜moveCardHandler.js
 ┃ ┃ ┗ 📜rendering.js
 ┃ ┗ 📜index.js
 ┣ 📂pages
 ┃ ┗ 📂main
 ┃ ┃ ┣ 📂css
 ┃ ┃ ┣ 📂ui
 ┃ ┃ ┗ 📜index.js
 ┣ 📂shared
 ┃ ┣ 📂deleteConfirm
 ┃ ┃ ┣ 📂component
 ┃ ┃ ┣ 📂css
 ┃ ┃ ┗ 📜index.js
 ┃ ┣ 📂fab
 ┃ ┃ ┣ 📂style
 ┃ ┃ ┗ 📜index.js
 ┃ ┣ 📂utils
 ┣ 📂widgets
 ┃ ┣ 📂header
 ┃ ┃ ┣ 📂component
 ┃ ┃ ┣ 📂style
 ┃ ┃ ┗ 📜index.js
 ┃ ┗ 📂mainsection
 ┃ ┃ ┣ 📂api
 ┃ ┃ ┣ 📂style
 ┃ ┃ ┣ 📂ui
 ┃ ┃ ┗ 📜index.js
 ┗ 📜index.pug
```
예를 들어, 각각의 section들을 불러오는 mainsection의 경우, /widgets/mainsection/index.js에서 해당 하는 하위 컴포넌트들을 의존 관계로 묶어 렌더링 하는 방식으로 설계했습니다.
```js
// /widgets/mainsection/index.js
import section from "/entities/section/index.js";
import pug from "/shared/utils/pugCompile.js";

function Mainsection() {
  const template = `style
  | @import url('/widgets/mainsection/style/mainsection.css')
main#sections`;

  function render() {
    const mainsection = pug.compileHTML(template);
    document.getElementById("html__body--pageContainer").innerHTML +=
      mainsection;
    section.render();
  }

  return {
    render,
  };
}

const mainsection = new Mainsection();
export default mainsection;

```
그렇기 떄문에 mainsection을 렌더링시키는 함수를 만들어 해당 함수에서는 기존에 pug 파일을 컴파일하여 반환된 HTML element들을 DOM Api를 통해 직접 지정한 위치에 그려갑니다.
```js
// entities/section/index.js
import fetch from "./api/index.js";
import card from "/entities/card/index.js";
import addTodo from "/entities/addTodo/index.js";

function Section() {
  const template = `style
    | @import url('/entities/section/style/section.css')
section(id=section.classify)
    .main__div--topbar
        .section__div--titleWrapper
            span.titleWrapper__span--title #{section.classify}
            span.titleWrapper__span--count #{section.cards.length}
        .section__div--buttonWrapper
            img(src="/asset/plus.svg", alt="add", data-action="add", data-target=section.classify)
            img(src="/asset/close.svg", alt="delete")
    ul.todoList`;

  async function render() {
    const { data, path } = await fetch();
    console.log(data);
    const compiledFunction = window.pug.compile(template, {
      basedir: path,
    });
    document.getElementById("sections").innerHTML = "";
    data.forEach((section) => {
      const html = compiledFunction({ section: section }); // 렌더링된 HTML
      document.getElementById("sections").innerHTML += html;
      addTodo.render(section.classify);
      card.render(document.getElementById(section.classify), section.cards);
    });
  }

  return {
    render,
  };
}

const section = new Section();
export default section;

```
이렇게 렌더링 중간에 데이터를 fetching해와야 하는 부분은 컴포넌트마다 설정하여 데이터를 가져온 후에 가져온 데이터를 기반으로 렌더링하게 됩니다. 만약 카드 추가나 삭제와 같은 행위 또한 이벤트를 호출하면 해당 section 전체를 위 함수의 `render()` 함수를 통해서 리렌더링하는 방식을 구상하여 구현해 보았습니다.

제가 원하는 대로 컴포넌트마다 각각에 대해 데이터를 json 형식으로 가져오고, 받아온 데이터를 기반으로 templating 및 painting 작업을 클라이언트에서 한다는 점에서 클라이언트 사이드 렌더링이 어느정도 구현되었다고 생각합니다.

#### 하지만 클라이언트 사이드 렌더링 방식을 사용함에 있어서 고민이 있었습니다.

리렌더링의 경우 DOM API를 사용해서 다시금 초기화하고 그려내는 방식 자체가 너무 raw하다는 생각이 들었습니다. 

DOM 작업의 경우 고비용인데 반해 이를 계속 데이터 갱신이 이루어질 때마다 다시금 http 요청을 보내고 렌더링 단위인 전체 column에 대해 리렌더링하는것이 **자원 낭비**라고 생각이 들었습니다. 
하지만 이러한 비용을 아끼고자 카드 추가, 삭제와 같은 경우 받아온 json 데이터를 통해 하나만의 카드를 추가하거나 삭제하는 soft한 방식의 추가나 삭제의 경우 동시 접근해서 수정이나 다른 곳에서 같은 계정의 column의 작업에 대해 **반영사항을 불러오지 못한다**는 점에서 전체적인 column의 데이터를 다시 get해와서 리렌더링 하는 것이 합리적이라는 생각 또한 들어 어떤 방식이 더 맞을까에 대한 고민이 계속 되는 것 같습니다. 이에 대한 멘토님의 고견을 여쭙고 싶습니다!


