## React Context
Context란? 
리액트로 만들어진 애플리케이션에서는 부모가 가지고 있는 데이터를 자식에서도 사용하고 싶다면 props로 데이터를 넘겨준다.
이렇게 부모의 데이터를 계속해서 자식 컴포넌트로 넘겨주는 과정을 props drilling이라고 하는데, 이 props drilling은 일정 depth를 넘게 된다면 어느순간 데이터의 흐름을 놓치기 십상이고, 이에 따라 유지보수성 또한 떨어진다.

이러한 props들의 관리가 점점 어려워지자, 리액트에서 등장한 개념이 Context이다. context를 사용하면 **명시적인 props의 전달이 없더라도 선언한 하위 컴포넌트 모두에서 자유롭게 원하는 값을 가져와 사용**할 수 있다. 이게 가능할 수 있었던 이유는 리액트는 구성 요소들의 정보를 가진 fiber 트리가 있기 때문에 해당 트리에서 따로 관리할 수 있도록 context를 일반 함수형 컴포넌트가 아닌 따로 context에 대한 처리가 있기 때문이다. 그렇기 때문에 props는 구성 요소 트리를 통해 데이터를 전달하게 될 수 있다.
```js
function ParentComponent() {
  const [counter, setCounter] = useState(0);
  //context 선언
  const MyContext = React.createContext()
  // state와 setter함수를 한번에 담고 있는 객체 설정
  const contextValue = {counter, setCounter};

  return (
    <MyContext.Provider value={contextValue}>
      <SomeChildComponent />
    </MyContext.Provider>
  )
}
```
이런 식으로 state와 setter 함수에 대해서 하나로 묶어준 다음에, `useContext()`로 선언한 값에 떄하여 Provider 속성을 통해 context를 내려주는 컴포넌트로 사용할 수 있다.

```js
function NestedChildComponent() {
  const { counter, setCounter } = useContext(MyContext);

  // do something with the counter value and setter
}
```
그렇게 되면 