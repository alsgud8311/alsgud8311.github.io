## 주요 작업
- 라이브러리
	- diff 알고리즘 구현
	- useState
## 학습 키워드
- 오늘도 Virtual DOM과 React Fiber..

## 고민 및 해결과정
### useState의 사용
useState의 경우 해당 상태를 기존의 Root Fiber에 구독하고 상태 업데이트가 일어날 경우 Root부터 Fiber를 구성하여(원래의 리액트는 기존의 fiber를 재사용한다. 나의 경우는 새롭게 Fiber를 만드는 것으로 구상했다) 재구성 과정을 거친 다음에 새롭게 변경된 DOM tree로 교체할 수 있도록 설계를 했었다.

나는 바뀐 상태를 다시금 createElement를 통해 구성 요소들을 루트부터 fiber로 만들고 reRender함수를 실행시킴으로써 새롭게 바뀐 것들이 반영되어 렌더링되도록 하고 싶었다. 하지만 `새롭게 createElement하는 부분은 어떻게 할 것인가?` 에 대해서 고민이 많아진 것 같다.

```js
import { Root } from "../dom/DomRoot";
import { RootFiber } from "../dom/rootFiber";

/**
 *
 * @param {RootFiber} initialState
 * @returns {[any, function]}
 */
export function useState(initialState) {
  let state =  initialState;
  const hostRoot = Root();
  function setState(newState) {
    state = newState;
    hostRoot.reRender();
  }
  idx++
  return [state, setState];
}
```
현재는 싱글톤으로 구현해놓은 Root의 안쪽 요소를 맨 처음 createElement하는 과정에서 해당 Element객체들을 elements라는 프로퍼티에 넣어놓고 프로토타입 함수 `reRender`를 추가하여 해당 Element에게 다시금 렌더링을 시킬 수 있도록 했다.

처음 렌더링 됐을 때는 자동적으로 render함수 안에 createElement 함수의 결과물이 인자로 들어갔지만, 이를 다시금 렌더링 하는 과정에서는 createElement에 인자로 들어간 state의 값이 원시값이기 때문에 복사하여 넣어져 있는 상태이다. 따라서, 해당 상태를 변경한다고 해서 createElement 안에 있는 내 state의 값이 변하지 않는다.

일단 리액트 자체가 내가 설계한 방식보다 훨씬 복잡하게 구성되어 있기때문에 완전히 똑같이 만들기는 어렵다. 이에 기능을 최대한 줄이면서 내가 원하는 방식대로 동작할 수 있도록 하는 것이 목표인데 useState가 가장 난관인 것 같다. 아직은 해결 방안이 명확하게 떠오르지 않아 이 useState방식에 대해서 보다 고민을 해야 할 것 같다.

### 리뷰 요청
안녕하세요 멘토님! 고생 많으십니다.
오늘 리뷰에서는 따로 기술적 질문사항은 없습니다. 위에 보시다시피 현재 useState의 설계 방식에 대해서 고민하고 있는데, 이러한 부분은 아직까지 여러 경우의 수를 생각하고 시도하는 중이라 이에 대해서 무턱대로 질문을 하기보다는 여러가지 도전을 해보고 싶습니다.

하지만 이 과정에서 제가 겪는 학습 방식의 문제에 대해 조금 여쭤보고 싶습니다.
현재 제가 구현하는 fiber와 이 fiber를 비교하는 diff 알고리즘, dom의 createRoot등 사실상 사용하는 모든 함수들은 리액트를 참고하면서 만든 기능이기는 하지만 프로젝트의 규모에 맞게 임의로 축소한 버전이기에 부족한 부분이 많습니다. 그렇기 때문에 리액트의 로직을 많이 변형하기도 했습니다.
문제는 이러한 리액트의 기본 로직에 대해서 학습을 하고 나름대로 변형해서 구현하는 과정이다 하더라도 사실상 변형하여 구현하는 것이 과연 `리액트의 기본 로직 학습`이라는 관점에서 볼 때 괜찮은 방법이 맞을까? 하는 생각이 들었습니다.
원리는 학습을 하고 구현을 다른 방식으로 한다 쳐도, 이렇게 변형하면서 학습하는 방식이 오히려 구상하는 로직과 학습했던 지식이 혼동되는 문제가 종종 생겨 걱정도 되어 여쭤보게 되었습니다.  이에 대해서 멘토님의 고견을 여쭈어 봐도 될까요?

리뷰해주셔서 감사합니다!😊