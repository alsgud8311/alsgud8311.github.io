리액트 코드를 쓰다보면 비동기 통신에서 빠질 수 없는 것이 `useEffect`이다. 하지만 useEffect를 잘 못 쓰게 된다면 무한한 버그와 무한루프의 요청을 받을 가능성이 있으므로 특히 주의를 요하는 훅이다. 나 또한 무지성으로 리액트 훅들에 대한 고찰 없이 사용하다보니 이러한 훅들에 대한 깊은 이해가 바탕이 되어야 한다고 판단하여 정리하기로 결정했다.

## useEffect란?
`useEffect`는 리액트의 훅으로, 애플리케이션 내 컴포넌트의 여러 값들을 활용해 동기적으로 **부수 효과(side effect)**를 얻는 메커니즘이다.

> 부수효과(side Effect)란?
> 함수 내에서 어떤 구현이 함수 외부에 영향을 끼치는 효과. '의도하지 않은 결과'를 가질 수 있는 가능성이 있다는 의미를 내포한다.

```jsx
function component(){
	useEffect(() => {
	//뭔가 이것저것 할 것들
	}.[])
}
```
`useEffect` 는 첫 번째 인수로 부수 효과가 포함된 콜백 함수, 두번째 인수로는 의존성 배열을 받는다. **의존성 배열의 경우 배열에 아무 것도 넣지 않을 수도 있다.**

`useEffect`가 두번째로 받는 의존성 배열에 담긴 값이 변경될 때마다 useEffect는 첫 번째로 받은 콜백 함수를 실행한다. 근데 얘는 어떻게 의존성 배열이 바뀐걸 알까?

 함수 컴포넌트는 **매번 함수를 실행해 렌더링을 수행한다**. 따라서 `useEffect`는 자바스크립트의 데이터 바인딩, 옵저버 등을 사용하여 값의 변화를 관찰하는 것이 아니고 이러한 **리렌더링마다 매번 함수가 실행**되고 `useEffect`도 **실행되기는 하지만 렌더링 될 때마다 의존성의 값이 이전과 다른게 하나라도 있을 경우에만 부수효과를 실행**하는 일반 함수라고 할 수 있다. 따라서 렌더링 과정에서 실행되는 **부수 효과 함수**인 셈이다.
## 클린업 함수의 목적

`useEffect`는 비동기 데이터를 받는 것뿐만 아니라 이전에 등록한 이벤트 핸들러를 지울 때도 사용된다.

```jsx
import { useEffect, useState } from "react";

export default function App() {
  const [counter, setCounter] = useState(0);
  function handleClick() {
    setCounter((prev) => prev + 1);
  }
  useEffect(() => {
    function addMouseEvent() {
      console.log(counter);
    }
    window.addEventListener("click", addMouseEvent);

    return () => {
      console.log("클린업 함수 실행", counter);
      window.removeEventListener("click", addMouseEvent);
    };
  }, [counter]);
  return (
    <>
      <h1>{counter}</h1>
      <button onClick={handleClick}>+</button>
    </>
  );
}

```

해당 컴포넌트를 실행시켜보면 

![](https://i.imgur.com/k59tYjy.png)

이런 식으로 `counter`를 참조했지만 0부터 나오는 것을 볼 수 있다. 분명 클린업 함수 실행은 `counter`가 1 올랐음에도 왜 0일까?

답은 **클린업 함수가 이전 `counter` 값, 즉 이전의 state를 참조에 실행되기 때문**이다.
클린업 함수는 새로운 값과 함께 렌더링 된 뒤에 실행되는데, 새로운 값을 기반으로 실행된다는 점은 맞지만, 함수가 정의됐을 당시에 선언됐던 이전 값을 보고 실행된다. 

그러니 왜 `useEffect`에 이벤트를 추가했을 때 클린업 함수에서 지워야 하는지 알 수 있다. `useEffect`는 콜백이 실행될 때마다 이전의 클린업 함수가 존재한다면 그 클린업 함수를 실행한 뒤에 콜백을 실행한다. 그러므로 이벤트를 추가하기 전에 이전에 등록됐던 이벤트 핸들러를 삭제함으로써 특정 이벤트의 핸들러가 무한히 추가되는 것을 방지하는 것이다. 

대부분 컴포넌트가 '언마운트될 때 이벤트 핸들러를 지운다'는 개념으로 접근하는데, '**이전 이벤트 핸들러의 상태를 청소해준다**'는 개념으로 접근해야 올바르게 안다고 말할 수 있다.

>언마운트(unmount)
>특정 컴포넌트가 DOM에서 사라질 때를 의미한다.
>클래스형 컴포넌트에서는 `componentWillUnmount` 함수를 의미한다.

## 의존성 배열

의존성 배열에 빈 배열을 둔다면 `useEffect`는 비교할 의존성이 없다고 판단해 최초 렌더링 직후 실행된 다음부터는 실행되지 않는다.

그렇다면 앞에서 함수 컴포넌트는 매 렌더링마다 실행된다고 했는데, 그냥 여기다 `useEffect` 없이 쓰면 되지 않을까 생각할 수 있는데 그러다가 빈 의존성 배열마냥 내 합격 회사도 빈 배열로 남을 수 있다.

```jsx
function Component(){
	console.log('렌더링')
}
function Component(){
	useEffect(() => {
		console.log('렌더링')
	})
}
```

컴포넌트 내부에서 `useEffect` 없이 사용하는 방식과 `useEffect`를 사용하는 방법은 차이가 있다.

컴포넌트 내부에서 직접 실행시킬 경우 위 코드는 **컴포넌트 렌더링 중 실행**된다. 반면 `useEffect`가 있으면 **컴포넌트의 렌더링 후에 수행된다는 순서적 차이**가 있다.

이러한 순서는 `useEffect`가 클라이언트 사이드에서 실행되는 것을 보장해주어 `window` 객체의 접근에 의존하는 코드를 사용할 수 있다.

또한 `useEffect` 없이 사용할 경우, 컴포넌트 렌더링 도중 실행되기 때문에 서버 사이드 렌더링의 경우에 서버에서도 실행되어 **함수 컴포넌트의 리턴을 지연**시켜 성능에 악영향을 끼친다.

그러니 `useEffect`가 부수효과를 위한 훅임을 뇌에 박아놓고 사용하도록 하자.

## useEffect 사용 주의점

`useState` 다음으로 `useEffect`는 많이 사용되는 훅이다 . 잘 쓰면 좋지만 못 쓰면 나락이다. 그러니 유의할 점을 고려해서 쓰도록 하자.

### eslint-disable-line react-hooks/exhaustive-deps 주석 자제하기

> ESLint란?
> ES(Ecma Script) + Lint(에러 코드 표식)의 합성어로 내 코드를 분석하고 잠재적인 오류나 버그를 찾는데 도움을 주는 툴로, 협업에서 많이 쓰이며 시어머니같이 잔소리를 해주어 내 코드의 질을 높여준다

useEffect를 쓸 때 useEffect 인수 내부에서 사용하는 값 중 의존성 배열에 포함돼 있지 않은 값이 있을 경우 `eslint-disable-line react-hooks/exhaustive-deps` 경고가 뜬다. 
경고를 하는 데는 이유가 있다. 무지성 주석처리 하지 말자. 

`useEffect`는 클래스 컴포넌트 생명주기 메서드인 `componentDidMount`에 기반한 접근법이다. 마운트하는 시점에 실행시키기 위해 사용하기보다는 의존성 배열로 전달한 값의 변경에 의해 실행되어야 하는 코드가 있을 경우에 쓰는 경우가 이상적이다.

부수효과가 발생한다는 것은 곧 **값의 변경**이 이루어진다는 것이다. 하지만 이러한 값을 관찰하지 않고 콜백함수 내에서 특정 값을 사용한다는 것은 **부수효과의 관찰에서 실행해야 하는 값과는 별개로 작동한다는 것을 의미**한다. 따라서 `useEffect`의 흐름과 컴포넌트 내 값들의 흐름이 맞지 않게 되기 때문에 **잠재적인 버그의 위험성을 가진다.**

그러니 빈 배열을 쓸 때는 `useEffect`의 부수효과가 컴포넌트의 상태와 별개로 작동해야만 하는지, 여기서 호출하는게 최선인지 검토하자.

![](https://i.imgur.com/HYl1IYe.png)

특정 값을 사용하지만 해당 값의 변경 시점을 피할 목적으로 `useEffect`를 사용하려면 `메모이제이션`을 적절히 활용해 해당 값의 변화를 막거나 위치를 다시금 생각해보자.

### useEffect의 첫 번째 인수에 함수명을 넣기

```jsx
useEffect(function logActiveUser(){
      logging(user.id)
    },[user.id])
```

솔직히 안넣는게 당연하다고 여겼는데, 생각해보니 무슨 일을 하는 `useEffect`인지 확인하기가 어렵겠다 싶었다. 

익명함수가 아닌 기명함수도 사용하는데는 상관이 없으니, 무슨 목적으로 사용하는 함수인지 이름을 넣어주어 가독성을 높이자.

### 거대한 useEffect 자제하기

`useEffect`는 의존성이 변경될 때마다 부수 효과를 실행하므로 부수 효과의 크기가 커질수록 애플리케이션 성능에 악영향을 미친다.

`useEffect`는 최대한 간결하고 가볍게 유지하자.
부득이하게 크게 될 경우 `useEffect`를 여러 개 만들어 의존성마다 관리하는 것도 방법이 될 수 있다.
만약 불가피하게 여러 개의 변수가 들어가야 하는 상황이라면 `useCallback`과 `useMemo`를 통해 정제된 내용만 담아두자

### 불필요한 외부 함수를 만들지 말기

```jsx
function Component({id}){
  const [info, setInfo] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    ;(async() => {
      const result = await fetchInfo(id, {signal: controller.signal})
    })()

    return () => controller.abort()
  },[id])
  return <div>렌더링</div>
}
```

`useEffect`에서 처리할 함수를 바깥에 만들지 말고 차라리 익명 함수로 만들어서 넣으면 가독성이 높아지고 간결해진다. 