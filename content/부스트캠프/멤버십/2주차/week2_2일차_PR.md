## 주요 작업
- [x] 폴더 구조 및 모듈 구조 변경 ✅ 2024-08-27
- [x] express api와 데이터 연결 ✅ 2024-08-27
- [x] 리렌더링 로직 작성 ✅ 2024-08-27
## 학습 키워드
- [x] fsd 패턴 ✅ 2024-08-27
- [x] esm ✅ 2024-08-27
- [x] Webpack과 babel ✅ 2024-08-27
- [ ] https://luxurious-share-af6.notion.site/2-bfaf16a16f8743eb9ee0e08af52673be?pvs=4
## 고민 및 해결과정
### 클라이언트 사이드 렌더링 방식으로 동적 렌더링하기
어제까지만 해도 웹팩을 통해 라이브러리 의존성을 웹팩에 넘겨주어 이러한 모듈을 사용하는 방식을 고려했었다.
하지만 어제 계속해서 실패를 거듭한 결과, 이러한 웹팩의 스크립트 파일에서 실행하다는 것이 불가능하다는 결론을 내렸다.

나는 어제 총 세 가지 방식을 사용했다.
1. 웹팩에서 모듈 번들링 후 import 해서 사용 -> 실패
	- Pug는 fs에 의존하는 모듈이기 때문에, 브라우저에서 pug를 Import하게 되면 의존성이 있는 fs 모듈 또한 사용해야 하는데, fs 모듈은 node.js가 아닌 브라우저 환경에서는 작동하지 않기 때문에 실패했다.
	- not defined 에러와 not relative path~와 같은 에러만 이어졌다.
2. commonjs의 require문을 통해 import
	- commonjs를 통해 import 하는 방식도 시도해봤지만, 애초에 브라우저에서 require 문법 자체가 동작하지 않으므로 소용없었다.
	- require is not defined 에러만 떴다.
3. 스트립트 태그로 cdn jsdeliver을 통해 모듈을 가져와 사용
	- 스크립트 태그로 가져온 pug esm에서  export default를 설정해주지 않아 나오는 에러만 나왔다.

어제 하루종일 이거만 잡고 있었기에 거의 포기하고 그냥 pug 파일을 온라인 컴파일러를 통해 변환한 뒤 사용하려던 찰나, 문득 'Pug online compiler'는 어떻게 컴파일을 하는걸까? 싶어서 해당 컴파일러의 스크립트 태그를 봤는데 `https://gnjo.github.io/pug/pug.js?v=1`라는 주소로 import 해와서 사용했다. 나도 이 태그를 활용해서 사용하고, module에서 `window.pug`를 통해 사용했더니 제대로 compileClient 메소드가 동작했다!

하지만 기존에 가지고 있던 pug 파일 중에 import 해서 mixin을 사용하거나 템플릿 자체를 Import 해오는 작업은 fs 모듈을 거치기 때문에 브라우저에서 활용할 수 없다.
```js
import deleteConfirm from "/shared/deleteConfirm/index.js";

function Card() {
  const template = `style
    | @import url('/entities/card/style/card.css')
div.cardContainer(id=card.id draggable="true" data-date=card.date)
    form(action="post").editform(hidden)
        .form__div--cardForm
            input.form__input--title(type="text" placeholder="제목을 입력하세요" value=card.title) 
            textarea.form__textarea--cardDetail(type="text" placeholder="내용을 입력하세요" rows=1 maxlength=500)#cardDetail #{card.detail}
            .form__div--buttonWrapper
                input.form__input__cancel-button(type="button", value="취소")
                input.form__input__submit-button(type="button", value="등록")
    li.generalCard(data-drag=card.id)
        .articleWrapper
            article
                p.title #{card.title}
                p.detail #{card.detail}
            p.author author by #{card.author}
        aside
            img.deleteTodo(src="/asset/close.svg", alt="delete", data-close=card.id)
            img.activeEditmode(src="/asset/pen.svg", alt="edit", data-edit=card.id)`;
  const compiledFunction = window.pug.compile(template, {
    basedir: "/Users/miguel/Desktop/naver/membership/week1/views",
  });
  function render(section, cards) {
    cards.forEach((card) => {
      section.innerHTML += compiledFunction({ card: card });
      deleteConfirm.render(card.id);
    });
  }
  return {
    render,
  };
}

const card = new Card();
export default card;

```
이처럼 esm을 활용하여 함수형의 특징을 활용하여 사용할 수 있도록 하였다.  함수 안에 함수를 넣고, 클로저를 활용한 내부 함수에 대해서는 캡슐화가 적용되어 보안에도 이점을 지닌다.

위와 같은 카드 컴포넌트의 경우, mainsection 컴포넌트 내부 -> section 컴포넌트 내부를 거쳐 import 해온 컴포넌트를 해당 부모 요소의 함수 안에서 렌더링하는 로직을 포함하는 방식으로 하여금 연쇄적으로 렌더링을 시키도록 설계하였다.

### fsd 원칙에 충실한 모듈들
이러한 방식의 렌더링은 모듈화가 잘 되어 있기 때문에, 이를 보다 계층적으로 보다 잘 파악하고, 구체적인 방식으로 모듈을 사용하면 가독성이나 구조 측면에서 가지는 이점이 크다. 이에 기존의 fsd 원칙은 그저 개념을 내가 편한대로 해석하여 설계했다면, 이번에는 fsd 원칙에 충실한 디렉토리 구조를 짜려 한다.
