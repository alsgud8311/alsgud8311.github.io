비용이 큰 수행에 대해 수행결과를 메모이제이션하고 필요할 때마다 계속해서 연산을 하는 것이 아닌 저장된 값을 사용하는 최적화를 제공하는 `useMemo`와 `useCallback`에 대해 알아보자.
얘네는 얼핏 보면 비슷한 놈들 같아 보이기 때문에 적절한 상황에 맞춰 사용하는 것이 중요하다.(사실 실제로도 비슷함)

# UseMemo

비용이 큰 연산에 대한 결과를 저장하고 저장된 값을 반환하는 훅이다.

```jsx
import { useMemo } from 'react'

const memoizedValue = useMemo(() => expensiveComputation(a,b),[a,b])
```

첫 번째 인자로는 값을 생성하는 콜백함수가 들어가고, 두번째 인자에는 의존성 배열이 들어가는데, 해당 의존성 배열 안의 값이 달라질 때마다 다시금 콜백 함수를 넣어 계산한 뒤 계산된 값을 다시 저장해 놓는다.

해당 훅은 컴포넌트에도 사용이 가능하다.

```jsx
import { useEffect, useMemo, useState } from "react";

function ExpensiveComponent({ value }) {
  useEffect(() => {
    console.log("Rendering");
  });
  return <span>{value + 1000}</span>;
}

export default function App() {
  const [value, setValue] = useState(10);
  const [, triggerRendering] = useState(false);

  const memoizedComponent = useMemo(
    () => <ExpensiveComponent value={value} />,
    [value]
  );

  function handleChange(e) {
    setValue(Number(e.target.value));
  }
  function handleClick() {
    triggerRendering((prev) => !prev);
  }

  return (
    <>
      <input value={value} onChange={handleChange} />
      <button onClick={handleClick}>렌더링하기</button>
      <br />
      {memoizedComponent}
    </>
  );
}
```

얘를 비싼 연산을 가진 컴포넌트라고 보자

![](https://i.imgur.com/fAZdCMY.png)

처음에는 계산한 값이 없으므로 계산 후에 `Rendering`이 콘솔에 뜰 수밖에 없다.
하지만 렌더링하기 버튼을 누르면 `setter함수`가 발생하기 때문에 렌더링이 계속 이루어지는데, `ExpensiveComponent`에 `useEffect`를 걸어 놓은 `console.log`가 뜨지 않는다.
렌더링이 계속 이루어지기는 하지만 해당 `value`의 값이 변경하지 않았기에 해당 값의 연산 또한 따로 실행하지 않는 것이다.

![](https://i.imgur.com/PR5o74J.png)

하지만 값이 변하자마자 `setter함수`가 발동하면서 렌더링이 일어나고, 의존성 배열에 있는 `value`의 값이 바뀌었으므로 다시 연산을 실행하여 렌더링에 반영되는 것이다.

이렇듯 그저 값 뿐만이 아닌 컴포넌트에서도 유용하게 사용이 가능하다.
근데 이런 기능은 `React.Memo` 또한 가능하다. 그러니 **고차 컴포넌트**인 `React.Memo`를 쓰자

> 고차 컴포넌트란(HOC, Higher-Order Component)
> 고차 컴포넌트는 컴포넌트를 가져와 새 컴포넌트를 반환하는 함수이다.
> 애플리케이션의 각 계층에서 공통적으로 필요한 **문제를 횡단하는 관심사**(Cross-Cutting concern)로 컴포넌트를 래핑하여 객체를 추가하는 등의 확장이 가능하다

# useCallback

`useMemo`가 값이나 컴포넌트를 기억했다면, `useCallback`은 인수로 넘겨받은 콜백 자체를 기억한다. 매 렌더링마다 해당 함수를 실행하지 안고 기억해놨다가 다시 사용한다는 의미이다.

```jsx
import { useCallback } from 'react';

export default function ProductPage({ productId, referrer, theme }) {
  const handleSubmit = useCallback((orderDetails) => {
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails,
    });
  }, [productId, referrer]);
```

얘도 첫 번째 인수로 함수를 받고 두 번째 인수로 의존성 배열을 받는다.
하지만 얘는 사용하는 방법이 약간 다른데, `useMemo`의 경우 해당 함수를 실행하여 나오는 값을 메모이제이션하는 반면, `useCallback`은 함수 자체를 메모이제이션하여 매 렌더링마다 새로 함수가 만들어지는 것을 방지하는 역할을 한다. 

익명함수 쓰는 모양이 익숙해져서 기명 함수를 사용할 시 어색할 수도 있겠지만, 기명함수를 씀으로써 디버깅에 용이하다는 이점을 가지고 갈 수 있기 때문에 기명함수를 사용하는 것도 나쁘지 않다.

```jsx
import { useCallback } from 'react';

export default function ProductPage({ productId, referrer, theme }) {
  const handleSubmit = useCallback(
  function handleSubmit(orderDetails){
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails,
    });
  }, [productId, referrer]);
```

어느 의존성 배열과 마찬가지로 얘도 의존성 배열에 있는 값이 변할 때만 함수가 새롭게 재생성된다.
해당 값 말고는 해당 함수가 필요한 곳은 없을 테니 의존성 배열을 통해 필요할 때만 생성되도록 해놓는게 최적화에 긍정적이다.

```jsx
/**
 * @param {() => void} callback
 * @param {any[]} args
 */
export function useCallback(callback, args) {
	currentHook = 8;
	return useMemo(() => callback, args);
}
```

`useMemo`와 `useCallback`의 유일한 차이는 **메모이제이션의 대상이 변수냐 함수냐**의 차이일 뿐이다. 하지만 자바스크립트에서는 함수 또한 값으로 표현될 수 있으므로 `useMemo`를 통해 `useCallback`을 구현하는 것도 가능하다.

```jsx
const handleClick1 = useCallback(() => {
	setCounter((prev) => prev+1)
})

const handleClick2 = useMemo(() => {
	return () => setCounter((prev) => prev+1)
})
```

따라서 위에 애랑 밑에 애 모두 똑같이 동작한다는 것이다.
근데 함수 메모이제이션은 `useMemo`를 통해 구현하면 코드가 좀 더 길어지기에 귀찮아서 따로 만들어놓은듯 싶다

# useMemo vs. useCallback

뭘 쓸까?
알아서 필요한 데 따라서 골라 쓰자
함수 쓸 거면 `useCallback` 쓰고 함수가 아닌 값들을 쓸 때는 `useMemo`쓰는게 편하다.
