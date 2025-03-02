## Concurrent mode
동시성 모드(concurrent mode)는 한 가지 일이 끝날 때 까지 무조건 다음 작업을 기다리는 것이 아닌, 한 가지 일이 실행 중일 동안 다른 일을 수행하는 것을 의미한다.
그렇다면 이 동시성(concurrency)이 병행성(parallelism)과 같은 의미를 가진 동의어가 아닌가? 라고 생각할 수 있겠지만 둘이 말하는 작업의 동시성은 조금 다르다.

동시성의 경우 한 가지 일이 무조건 끝날 때까지 기다리는 것이 아니라, **그 사이에 다른 일을 할 수 있으면 하는 것**이다.
반면 병행성의 경우는 **동시에 두 가지 이상의 일을 하는 것**이다. 그러니 한 가지 일이 끝날 때까지 기다리는 것과는 상관이 없고 작업마다 각각 알아서 수행하는 것이다.
가장 쉬운 예로, **손이 두개지만 빠른 사람**과 **손이 여덟개인 사람**을 생각하면 동시성과 병행성이 무엇을 의미하는 것인지 느낌이 올 것이다.

리액트에서의 동시성 처리는 여러 작업을 처리할 수 있도록 작업들을 작은 조각들로 나누고, 스케줄러를 통하여 각 작업들의 중요도에 따른 우선순위를 부여한다(time-slicing). 

### 왜 우선순위를 분리할까?
아무리 손이 빠른 사람이라고 하더라도 사실상 단계별로 하지 않으면 결국 전체적인 작업은 망가지기 마련이다.
샌드위치 만드는 과정에서 빵을 굽는 작업과 잼을 바르는 작업을 할 때, 빵을 먼저 굽고 잼을 바르듯이 작업에도 우선순위를 부여하고 이에 따라 작업을 처리할 필요가 있다.

리액트가 이렇게 나눈 작업들을 처리하는 과정에서 **메인스레드는 블록되지 않으며**, **동시에 여러 작업을 처리하면서 우선 순위에 따라 각 작업들 간에 전환이 가능**하게 되었다.

이와 같이 리액트 18버전부터는 동시성 렌더링을 통해서 렌더링 자체에 개임하고, 이를 중단하거나 재개, 폐기하는 등 작업들을 단위별로 조정할 수 있게 되었다.

### 동시성의 도입 배경
React 18 이전에는 렌더링이 동기적으로 처리되었기 때문에 이 중간에 어떤 것도 개입할 수 없었다. 이는 곧 렌더링이 실행되면 렌더링이 끝날 때까지 무조건 기다려야 했다는 이야기기도 했다.

그래서 만약 렌더링이 오래 걸리는 작업의 경우에는, 다음 수행한 작업이 블로킹되어 애플리케이션 자체가 렉을 먹는 듯한 모습을 보여주어 UX가 현저히 떨어지게 된다.

이러한 문제를 해결하기 위해서 개발자들은 **Debounce**와 **Throttle** 방식을 사용하여 어느정도 해소할 수 있었다.

>Debounce
>사용자의 입력이 연속으로 들어올 때 마지막 입력 후 일정 시간이 지난 다음에 무거운 작업을 수행하는 방식

>Throttle
>특정 시간 동안 한 번만 함수를 실행할 수 있도록 제한하는 방식.

하지만 이러한 방식 또한 Debounce의 경우에는 성능이 좋아도 **모든 기기에서 같은 시간동안 대기 후에 작업 수행**을 해야했고, Throttle의 경우에는 **Throttle 주기를 짧게 가져갈수록 성능은 점점 떨어진다**는 한계가 보였다.

그렇기 때문에 이러한 동기적 렌더링의 한계를 해소하고자 동시성의 필요성이 대두되어 나오게 되었다.

### Concurrent Mode 설정
기존의 ReactDOM 함수의 프로토타입 함수로 사용하던 render를 사용하지 않고 ReactDOM의 프로토타입 함수인 createRoot를 통해서 객체를 생성한 뒤, 해당 객체의 render 함수를 통해 엔트리 포인트를 렌더링시킨다.
```tsx
import ReactDOM from 'react-dom';
import App from 'App'; 

const container = document.getElementById('app'); 

// 이전 버전(React 17)
const container = document.getElementById('app'); 

ReactDOM.render(<App />, container);

// Concurrent Mode 도입 이후(React 18)
// 루트 생성
const root = ReactDOM.createRoot(container); 

// 루트 객체의 메서드로 앱을 렌더링
root.render(<App />);
```
`{루트객체}.render`를 통해서 앱을 렌더링시키게 되면 개선된 기능들과 동시 처리를 위한 `startTransition`, `useTransition`, `useDeferredValue` 훅을 사용할 수 있다.


## Concurrent Mode의 활용
### Automatic Batching(상태 일괄처리)
![](https://i.imgur.com/VbEpPyR.png)
여러 개의 상태를 업데이트할 경우, 기존에는 `하나의 state의 업데이트 -> 변경된 상태를 리렌더링 -> 다음 state의 업데이트`의 단계로 상태가 업데이트 되었기 때문에 여러번 리렌더링이 발생하였고, 이에 성능적으로 좋지 않은 효과를 가져왔다.

기존의 React 17까지도 Automatic Batching이 적용은 되어 있었지만, 적용되는 곳이 **이벤트 핸들러 함수 내부**로 한정적인 특성을 가졌다.
그러다보니 네트워크 호출(Promise)에 대한 `.then` 메서드의 콜백 함수에 여러개의 상태 업데이트가 들어가 있다거나 `setTimeout`의 콜백 함수 안의 여러 상태 업데이트 등에서는 상태 업데이트가 일괄처리가 아닌, **순차처리 방식으로 동작**하면서 변경된 state의 수만큼 리렌더링을 수행하게 된다. 그러다보니 성능적으로 떨어지는 효과를 가지게 된 것이다.

이에 React18부터 Concurrent Mode가 활성화되면, 모든 Promise나 setTimeout, 이벤트 콜백 등에서 다수 개의 상태 업데이트가 일괄로 처리되도록 변경되었다.
### Transition 관련 훅들
![](https://i.imgur.com/rwH08eL.png)

Transition 관련 훅들은 전부 우선순위를 직접 관리하여 렌더링 과정에서 성능을 개선하기 위해 새롭게 추가된 훅들이다.
위에서 말한 것과 같이 이전의 렌더링 방식은 동기적으로 계속해서 `UI에 대한 업데이트 실행 -> 리렌더링`의 반복이었다. 

![](https://i.imgur.com/CQ49j39.png)

하지만 동시성 렌더링 방식으로 변경되면서 첫 상태 업데이트부터 최종적으로 보여야 하는 화면의 렌더링까지 가는 과정에서 중간에 계속해서 우선순위가 낮은, 즉 가벼운 업데이트를 끼워 비교적 `가벼운 업데이트 -> 무거운 업데이트`순으로 업데이트를 시킬 수 있도록 처리하여 UI blocking 없이 동시에 다른 작업이 수행되는 것과 같은 사용자 경험을 제공할 수 있게 되었다.

#### useTransition
`useTransition`은 이러한 동시성을 구현하기 위해 필요한 훅이다. 이 훅은 리액트 컴포넌트 안에서 **동시성 모드에 접근할 수 있도록 해준다.**

```tsx
import { useState } from 'react';

export function FilterList({ names }) {
  const [query, setQuery] = useState('');

  const changeHandler = ({ target: { value } }) => setQuery(value);

  return (
    <div>
      <input onChange={changeHandler} value={query} type="text" />
      {names.map((name, i) => (
        <ListItem key={i} name={name} highlight={query} />
      ))}
    </div>
  );
}

function ListItem({ name, highlight }) {
  const index = name.toLowerCase().indexOf(highlight.toLowerCase());
  if (index === -1) {
    return <div>{name}</div>;
  }
  return (
    <div>
      {name.slice(0, index)}
      <span className="highlight">
        {name.slice(index, index + highlight.length)}
      </span>
      {name.slice(index + highlight.length)}
    </div>
  );
}
```
해당 코드를 보면 input의 내용이 바뀔 때마다 setState를 실행하고 있고, state가 바뀌게 되면 리렌더링이 이루어지며, `names`를 map하는 함수가 리렌더링 때마다 실행되며 UI를 다시금 화면에 띄운다.

하지만 이러한 name들이 점점 많아질 수록, input에 빠르게 입력하게 된다면 리렌더링 속도가 input 이벤트핸들러의 setState가 실행되는 속도를 따라가지 못하게 되고, 결극 input의 value가 빠르게 입력될 수 없는 문제를 가지게 된다.
[예시 보기](https://codesandbox.io/p/sandbox/heavy-update-as-urgent-ejwbg)

이럴때, 무거운 작업은 **List의 리렌더링**이 될 것이고, 비교적 가벼운 작업은 **input의 eventHandler 안에 들어있는 setState에 대한 input의 value 리렌더링**이다. 그렇다면 이 input의 리렌더링에 대해서 우선순위를 높여 input먼저 계속 먼저 리렌더링 될 수 있게만 한다면 input이 밀리게 되는 현상을 방지할 수 있는 것이다. 그럴 때 사용하는 훅이 **useTransition** 훅이다.


```jsx
[isPending, startTransition] = useTransition()
```
useTransition을 사용하면 `isPending`, `startTranstion`의 리턴값을 받는다.
- isPending: transition이 pending 상태인지 알려주는 boolean 값
- startTransition(callbackFn): UI 업데이트에 관한 로직을 콜백 함수로 넘겨줌
이 startTransition을 통해서 콜백함수의 setState를 통한 리렌더링 로직을 우선순위가 낮도록 설정하여 후순위로 렌더링이 이루어질 수 있도록 하면서 성능을 개선한다.
```
`startTransition` lets you update the state without blocking the UI.
```
라고 React의 공식문서에서 나와 있는 설명과 같이, UI를 따로 블로킹하지 않고 상태를 업데이트 하도록 시킴으로써 비교적 무거워서 다른 UI의 렌더링을 막는 작업들을 의도적으로 지연시킬 수 있다.
```jsx
import { startTransition } from 'react';

function TabContainer() {
  const [tab, setTab] = useState('about');

  function selectTab(nextTab) {
    startTransition(() => {
      setTab(nextTab);
    });
  }
  // ...
}
```
이런 식으로 setState가 있는 부분의 경우 렌더링 과정에서 막히지 않고 따로 진행되기 때문에 가벼운 UI의 업데이트 등이 막히지 않고 바로바로 렌더링이 될 수 있는 환경을 제공한다.


#### useDeferredValue
`useDeferredValue`는 상태의 업데이트 우선순위를 낮춘다는 점에서 `useTransition`과 유사하게 동작하는 면이 있다.
하지만 `startTransition`은 콜백함수 내부에 setState를 사용하는 방식이고, `useDeferredValue`는 **state값을 인자로 받아서 지연된 값을 반환하는 함수**이다. 따라서 `useTransition`은 상태를 변화시키는 **행동** 자체를 래핑하는 것이고, `useDeferredValue`은 **값 자체를 래핑해서 사용**하는 형태이다.

useDeferredValue로 래핑한 상태의 경우에는 다른 상태값이 모두 **상태 변경이 이루어진 이후에** 자신이 바뀌게 된다. 값 변화의 우선순위가 낮아지기 때문에 다른 상태들의 업데이트 이후에 실행되는 것이다.

그렇기에 사용하는 방식에 따라 `useTransition`과 `useDeferredValue`를 취사 선택하여 사용한다.
- useTransition : 상태 변경에 대한 리렌더링이 모두 이루어진 후 콜백 함수 실행
	- 콜백 함수 안에 setState를 넣어 사용
- useDeferredValue: 상태 변경에 대한 리렌더링이 모두 이루어진 후에 변한 값에 대한 리렌더링

추가적으로 `useDeferredValue`는 **`Suspense`와 함께 사용이 가능하다 .** 
만약 `useDeferredValue`의 인자로 설정한 상태가 변경하게 되면 새로운 값으로 인한 백그라운드 업데이트 동안 이전의 상태를 보여준다. 업데이트 이전의 상태를 보여주면서 다음 컴포넌트들의 렌더링이 모두 이루어진 후에 해당 상태를 참조하는 컴포넌트에서 다시금 렌더링을 시도한다. 이 렌더링을 시도하는 과정에서 기존에는 훅을 사용하여 새롭게 데이터를 fetching하는 동안 나올 ui를 설정하거나 **Suspense**를 활용하여 fallback UI를 보여줌으로써 사용자에게 로딩중임을 보여줄 수 있다.

> Suspense
> 콘텐츠가 렌더링할 준비가 되기 전까지 대체 UI를 보여주는 태그

```jsx
export default function App() {
  const [query, setQuery] = useState('');
  return (
    <>
      <label>
        Search albums:
        <input value={query} onChange={e => setQuery(e.target.value)} />
      </label>
      <Suspense fallback={<h2>Loading...</h2>}>
        <SearchResults query={query} />
      </Suspense>
    </>
  );
}

```
> 기본적으로 컴포넌트가 일시 중단됐을 때 lazy loading이나 use, Next.js와 같은 suspense 지원하는 프레임워크의 데이터 페칭 등을 사용하게 되면 가장 가까운 상위 Suspense 컴포넌트가 fallback ui를 띄워주게 된다. 
```jsx
import { Suspense, useState, useDeferredValue } from 'react';
import SearchResults from './SearchResults.js';

export default function App() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  return (
    <>
      <label>
        Search albums:
        <input value={query} onChange={e => setQuery(e.target.value)} />
      </label>
      <Suspense fallback={<h2>Loading...</h2>}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </>
  );
}
```
여기서 `useDeferredValue`를 사용하게 되면 기존 상태를 업데이트한 값에 대해서 지연된 렌더링이 이루어지고, 그 렌더링이 다시금 이루어지는 동안 이전의 값이 있을 경우 이를 표시함으로써 이전의 값을 나타낼 수 있다.

또한 이 방식을 조금 더 활용하여 기존의 값과 만약 값이 바뀌었다면 이를 비교하는 변수 하나를 만들어 refetching하고 있는 상태를 알 수 있는 ui로 보여줄 수도 있다.
```jsx
import { Suspense, useState, useDeferredValue } from 'react';
import SearchResults from './SearchResults.js';

export default function App() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;
  return (
    <>
      <label>
        Search albums:
        <input value={query} onChange={e => setQuery(e.target.value)} />
      </label>
      <Suspense fallback={<h2>Loading...</h2>}>
        <div style={{
          opacity: isStale ? 0.5 : 1,
          transition: isStale ? 'opacity 0.2s 0.2s linear' : 'opacity 0s 0s linear'
        }}>
          <SearchResults query={deferredQuery} />
        </div>
      </Suspense>
    </>
  );
}
```
위 예시에서는 새롭게 업데이트된 `deferredQuery`와 이전의 값이어던 `query`를 비교한 변수인 `isStale`을 따로 선언하여 이에 따라 transition을 주며 refetching중인 상태를 나타내었다. 이를 비교하여 ui를 띄울 때는 suspense의 fallback ui보다는 기존의 값을 띄우는 방식으로도 사용할 수 있다.





https://dmitripavlutin.com/react-usetransition/
https://velog.io/@heelieben/React-18-Concurrent-Rendering