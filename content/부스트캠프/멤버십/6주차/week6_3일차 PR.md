## 주요 작업
- 클라이언트
	- 스타일 작업
	- useEffect를 통한 data fetch
	- api 호출을 통해 데이터를 가져오고 리렌더링시키기
	- 로딩중에는 로딩임을 알 수 있는 문구 띄우기
- 서버
	- 배포
	- date 값을 추가해서 날짜순으로 데이터를 보내도록 설계 및 구현
	- 빌드한 정적 파일을 렌더링할 수 있도록 설계하여 서버에서 페이지 렌더링
- 라이브러리
	- useEffect 설계 및 구현(프로토타입)
	- root에서 useEffect를 관리
## 학습 키워드
- 소스맵
- useEffect
## 고민 및 해결과정
### useEffect의 로직 설계 및 구현
useEffect의 경우 가장 먼저 이를 구현하기 위해 생각했던 방법은, state처럼 root에 useEffect의 콜백을 등록해놓고, 렌더링 될 때 실행하는 방법이었다.

따라서 useEffect 또한 포인터를 옮겨가면서 계속해서 등록할 수 있도록 해놓고, 렌더링이 끝난 뒤 root에 등록되어있는 모든 useEffect에 대해서 실행시킬 수 있도록 했다.
하지만 그런 경우 문제가 있었다.
```js
async function fetchData() {
    const data = await apicall.get("/todo");
    setTodoList(data);
  }

  mhReact.useEffect(async () => {
    await fetchData();
  }, []);
```
해당 컴포넌트 내부의 함수와 같이, useEffect내에서 fetchData하는 함수를 실행시키고, 받은 데이터에 대해서 setter함수를 통해 새롭게 받은 데이터를 등록할 수 있도록 해놓았다.
이런 경우에, useEffect 내의 콜백함수가 commit이 끝난 후 실행이 되면, useEffect 콜백이 실행되면서 setter함수를 통해 다시금 리렌더링을 실행시켰고, 리렌더링이 다시 되고 난 후에는 다시금 useEffect내의 콜백 함수 실행 -> 리렌더링 -> useEffect 콜백 실행....의 무한 루프가 되었다.

어떻게 이를 구분해서 한번만 실행하면 좋을까? 라는 고민을 했었는데 현재로서 할 수 있는 생각은 실행 플래그를 놓는 것이었다.
```js
import { Root } from "../dom/DomRoot";

/**
 *
 * @param {function} callbackFn
 * * @param {[]} dependencies
 */
export function useEffect(callbackFn, dependencies) {
  const root = Root();
  if (!root.global.hasOwnProperty("effects")) {
    root.global.effects = {};
    root.global.effectsIdx = 0;
  }
  const effectInformation = {
    fn: null,
    prev: null,
    dependencies: null,
    called: false,
  };
  effectInformation.fn = callbackFn;
  effectInformation.prev = dependencies;

  effectInformation.dependencies = dependencies;

  const index = root.global.effectsIdx;
  root.global.effects[index] = effectInformation;
  root.global.effectsIdx++;
}
```
called라는 프로퍼티를 객체 리터럴에 놓고 객체 자체를 effect로 관리했다.
한번 렌더링이 되면 called가 true로 바뀌고, true된 함수에 대해서는 실행시키지 않고 flag의 값만 false로 다시 바꾸는 방식을 통해 최초 한번만 실행될 수 있도록 하였다.

이 외의 prev나 dependencies같은 경우는  Dependencies에 있는 값이 prev값과 변하면 리렌더링이 이루어질 수 있도록 했는데, 아직까지 이는 보완되지는 않았고 계속해서 보완할 예정이다.