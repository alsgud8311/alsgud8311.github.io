## 주요 작업
- 주간계획서 작성
- 프로젝트 초기세팅(의존성 설치, 폴더구조, sass 변수 설정)
- 기본 메인 페이지 구조 html 작성
- 카드 컴포넌트 구조 제작

## 학습 키워드
- FSD
- SCSS와 SASS
- bem 방법론
- Web Component
	- shadow DOM
	- template과 slot

학습정리
https://luxurious-share-af6.notion.site/1-baed698a7b3c40bbbd6b94fb1097dc42?pvs=4

## 고민과 해결과정
### FSD 패턴을 고려한 폴더구조

![](https://i.imgur.com/EGoN63z.png)
폴더 구조를 찾아보던 중 이전에는 항상 리액트 프로젝트를 했기 때문에 대부분 많이 쓰던 hooks, server, pages, components 등으로 나눴던 폴더 구조가 여기선 적용하기 어렵겠다고 판단하여 다른 폴더구조를 찾던 중 슬랙에서 다른 캠퍼분이 FSD 패턴을 추천해주셨다.
하지만 이를 내 프로젝트에 적용시키는 과정에서 어떻게 폴더구조를 잡아야 할지 고민이 많이 됐었다.

![](https://i.imgur.com/CWILLlr.png)

전체적으로는 app, pages, processes, pages, widgets, features, entitites, shared가 있었지만 내 프로젝트에서 이를 모두 쓰기에는 너무 과하다는 생각이 들어 정말 필요할 것 같은 4가지를 골랐다.
- app
	- 애플리케이션의 시작점
- entities
	- 다양한 데이터를 서버와 통신할 수 있도록 설정
- pages
	- 각 페이지를 담을 디렉토리(메인밖에 없긴 하지만 보다 가독성을 위해 추가했다)
- shared
	- 공통 스타일
	- 공통 컴포넌트

### 웹 컴포넌트의 사용
사실상 이제까지는 리액트만 주로 사용했기 때문에 웹 컴포넌트를 사용할 기회가 없었다. 사실 기회가 있었어도 피했었던 것 같다. 기존 HTMLElement를 상속하는 객체를 만들어 shadowDOM을 통해 렌더링시키는 로직 자체가 나에게 너무 생소하여 이해가 잘 되지 않았기 때문이다.
하지만 이번에는 아무래도 하나의 페이지에 정말 많은 html 요소들이 들어가는 만큼 컴포넌트를 사용해야 할 필요가 있다고 생각했다. 하지만 리액트처럼 컴포넌트를 만들 수 있는 환경이 아니기에 웹 컴포넌트를 사용해보기로 하였다.
 ```js
 class Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
  }
  get title() {
    return this.getAttribute("title") || null;
  }
  get detail() {
    return this.getAttribute("detail") || null;
  }
  get id() {
    return this.getAttribute("id") || null;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = this.template({
      title: this.title,
      detail: this.detail,
      id: this.id,
    });
  }

  template(state) {
    return `
        <li>
            <article> 
                <p>${state.title}</p>
                <p>${state.detail}</p>
            </article>
            <aside>
                <img src="../asset/close.svg" alt="delete" />
                <img src="../asset/pen.svg" alt="edit" />
            </aside>
        </li>
    `;
  }
}
window.customElements.define("todo-card", Card);

```
현재는 골대만 잡아 처음으로 렌더링을 시켜보았다. 아직까지는 이벤트를 처리하는 부분이나 리스트 전부를 렌더링하지 못하는 상태지만 이 부분을 보다 보완하여 각 카드들의 리스트를 렌더링하는 컴포넌트를 만들고, 이를 메인 페이지에서 활용할 계획이다.