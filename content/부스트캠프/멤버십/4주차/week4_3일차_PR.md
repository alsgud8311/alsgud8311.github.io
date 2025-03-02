## 주요 작업
- 옵저버 패턴 적용 - notify시 페이지별 컴포넌트 리렌더링
- MVC 패턴 재구조화(싹 뜯어고침)
- 테스트 코드 작성
## 학습 키워드
- Jest 테스트코드
- javascript class
- 옵저버 패턴
- MVC 패턴

https://luxurious-share-af6.notion.site/4-aba822d7763544a5ad64778df911c630?pvs=4

## 고민 및 해결과정
### TroubleShooting: Class의 getter와 setter 설정
```js
    RangeError: Maximum call stack size exceeded

      33 |   }
      34 |   set title(title) {
    > 35 |     this.title = title;
         |               ^
      36 |   }
      37 |   set detail(detail) {
      38 |     this.detail = detail;
```
getter 함수와 setter 함수를 사용함에 있어서 자꾸 생성자를 통해 인스턴스를 만들려고 했지만 setter함수를 실행함으로써 에러가 발생했다.

무엇이 문제인지 테스트코드를 통해서 차근차근 분석해보았다.
```js
class Card {
  constructor({
    id,
    author,
    created_at,
    title,
    detail,
    task_column,
    priority,
  }) {
    this.id = id;
    this.author = author;
    this.created_at = created_at;
    this.title = title;
    this.detail = detail;
    this.task_column = task_column;
    this.priority = priority;
  }
```
Card Class의 constructor는 새로운 객체를 만드는 과정에서 this.id = id, author 등을 실행한다.
title를 예로 들어보자면, this.title = id를 실행하는 과정이 사실상 **id에 할당**하는 과정과 같다는 점이다.
```js
  set title(title) {
    this.title = title;
  }
```
이전에 내가 썼던 setter 함수이다.
보면 생성자에서 할당하는 과정과 같다.
그렇기에 `this.title = title`이라는 할당문은 setter함수를 실행시키고, 함수에서는 다시금 `this.title = title`을 실행시키면 setter 함수를 재귀적으로 호출하는 구조가 되어버렸다.

이를 해결하기 위해 찾아본 결과 클래스의 getter,setter함수에서는 주로 property를 대시바(\_)를 넣어 구분한다고 한다.
```js
get title() {
    return this._title;
  }
set title(title) {
	this._title = title
}
```
그냥 내가 함수덕후라 클래스를 많이 안 사용해봐서 멍청이슈였던걸로..


### 옵저버 패턴의 적용 범위
처음에는 각각의 모든 컴포넌트에 대해서 리팩토링을 한 뒤, 컴포넌트 별로 상태를 관리할 수 있는 리액트의 useState, setState와 같이 유틸함수를 만들어 사용해볼까 하는 생각을 했었다.

하지만 우리가 만들고 있는, 또한 내가 만든 프로젝트의 구조에서 옵저버 패턴을 각 컴포넌트마다 적용하는 것은 아래와 같은 이유에서 오버엔지니어링이라고 생각했다.

> 애플리케이션의 비즈니스 로직, 시나리오에 따라 지속해서 변경될 수 있고, 이를 시각적으로 표현해야 하는 데이터를 '상태'라고 생각했다. 해당 상태의 정의로 나의 프로젝트를 보았을 때, 정보 갱신이 이루어질 때는 **api를 호출했을 때** 이외의 상황에서는 개별적으로 상태 관리를 할 필요가 없어진다. 이에 굳이 필요할까? 하는 생각이 들었다.

따라서 나는 어떤 방식으로 현재 시각적으로 표현되어 있는 데이터들을 어떤 방식으로 옵저버를 관리하며, 정보 갱신이 일어났을 때 옵저버블에게 notify할 수 있을까? 를 고민했다.

### 컴포넌트 별로 리렌더링이 필요한 곳에 옵저버블 내려주기
```js
...
function Main() {
  const observable = new Observable();
  function render() {
    new Header(observable);
    new Mainsection(observable);
    fab.render(observable);
    EventManager.attachEvent("/main");
  }
  return { render };
}

export default Main();

```
나는 컴포넌트 단위, 페이지 단위로 함수형을 만들고, 마치 컴포넌트처럼 렌더링하도록 로직을 구성했다.
여기서 나는 정보 갱신이 이루어졌을 때 함께 렌더링과 정보를 다시금 fetch해올 수 있는 컴포넌트에 대해서만 observable을 구독한 후에, api 호출 부분에서 기존에 가졌던 리렌더링 로직 대신 콜백함수로 observable에게 notify해주는 함수를 넣어주는 방식으로 리팩토링했다.

```js
function Section(observable) {
  observable.subscribe(render);

  async function render() {
    try {
      const { data, path } = await fetch();
      console.log("section render:", data);
      const compiledFunction = window.pug.compile(template, {
        basedir: path,
      });
      document.getElementById("sections").innerHTML = "";
      data.forEach((section) => {
        const html = compiledFunction({ section: section }); // 렌더링된 HTML
        document.getElementById("sections").innerHTML += html;
        addTodo.render(section.classify);
        if (section.cards)
          card.render(document.getElementById(section.classify), section.cards);
      });
      addcolumn.render();
    } catch (error) {
      alert("카드 정보를 불러오던 중 에러가 발생했습니다.");
    }
  }
  render();

  return {
    render,
  };
}

export default Section;

```
이처럼 정보 갱신이 이루어진 후에, fetch를 다시 해옴으로써 정보를 확정적으로 보여줄 수 있는 db에서 가져와 띄워주는 `render` 함수를 옵저버블에 구독해주고, 갱신이 이루어졌을 때, 메인페이지의 경우 히스토리 창 안의 내용들과 카드들에 대해서 다시금 fetch해오고 정보를 최신 정보로 리렌더링 시킬 수 있도록 설계하였다.

## 리뷰요청
안녕하세요 멘토님!
저는 수,목 동안 서버의 구조를 리팩토링하는 작업을 주로 진행했습니다.
화요일 멘토님이 리뷰해주신 것을 보고 제 코드를 다시금 보니 기존에 모델에 대한 이해가 높지 않아 한 도메인에 대한 단일 비즈니스 로직이라고 생각을 했었던 점과 컨트롤러의 역할 자체가 서비스 로직을 담고 있었다는 점이 문제라고 생각했습니다.

이에 개선한 서버의 구조를 간단히 말씀드리자면
- 컨트롤러 : 요청과 응답에 대한 단순 응답/요청 객체를 클라이언트/서비스에 전달
- 서비스: 일련의 비즈니스 로직들을 전부 수행
- 레포지토리 : db에 직접적인 접근 및 조작을 하는 계층으로 데이터 객체를 넘겨받고 데이터 객체를 리턴함
- 모델 : 해당 도메인에 대한 데이터를 객체로 다루며, 해당하는 데이터의 객체를 서비스에서 레포지토리로 전달하면서 데이터의 갱신을 담당
의 구조로 개선해 보았습니다.
개선한 구조에 대해서 멘토님의 간단한 피드백과 전체적인 코드에 대한 피드백 주시면 감사하겠습니다 :) 
2주일동안 고생하셨습니다!