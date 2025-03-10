# 리액트 상태관리 - props & Context API

# 1. 클라이언트 상태관리 (State management) ?

- SPAs구조에서는 다양한 화면 렌더링이 필요함.
    
- 화면 렌더링은 다양한 state 변경에 의해서 발생.
    
- 다수의 state가 있으며 각 state는 변경될 수 있고, 어떤 state는 서버와 동기화 돼야 한다.
    

# 2. React state management

## component block state

- 하나의 컴포넌트 안에서의 변경
    
- 지역변수의 변경과 비슷
    
- ```
    const [data, setData] = useState("");
    ```
    

## component sharing state

컴포넌트 간에 상태를 공유하는 경우가 많고, 대부분은 global state 수준으로 관리한다.

- 상태를 자식에게 전달
    
    - props 로 전달
        
    - 자식 컴포넌트는 props속성을 통해서 필요한 상태를 받아서 렌더링
        
- 상태를 자식이 아닌 다른 node 계층에 전달
    
    - 상위 어딘가 state를 만들어서 컴포넌트간의 공유가 되도록 하기.
        
        - 아래 그림처럼 공통의 부모 영역에 state를 만들고, 각각 state를 내려받아서 활용.
            
            ![](https://user.oc-static.com/upload/2021/05/06/16202866148021_P3C3-2.png)  
            Image: [https://user.oc-static.com/upload/2021/05/06/16202866148021_P3C3-2.png](https://user.oc-static.com/upload/2021/05/06/16202866148021_P3C3-2.png)
            
        - props 를 통해서 계속 전달해줘야 하는 단점 존재 (props drilling)
            

## Props drilling 문제 해결: Context API 사용

- 왼쪽은 Props drilling, 오른쪽은 **Context API 사용**
    
- Provider 와 Consumer 개념으로 제공/소비 하는 개념
    
- props 를 계속 전달해줄 필요가 없음.
    
- React 가 컴포넌트 계층을 분석해서 props로 전달시킴
    

![](https://miro.medium.com/max/2000/1*Ha2vNB0ILaYKPXk6oyTZSQ.png)

> image: [https://miro.medium.com/max/2000/1*Ha2vNB0ILaYKPXk6oyTZSQ.png](https://miro.medium.com/max/2000/1*Ha2vNB0ILaYKPXk6oyTZSQ.png)

#### 예시.

[https://milddev.com/global-state-management-with-react-usestate-usecontext-hooks-and-context-api](https://milddev.com/global-state-management-with-react-usestate-usecontext-hooks-and-context-api)

  

#### 참고. React-Redux 에서도 Context API를 사용한 방식

```
import { createStore} from 'redux';
import { Provider } from 'react-redux';

//Provider
const store = createStore(rootReducer)
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)


//Consumer
import React from 'react'
import { useSelector } from 'react-redux'

export const CounterComponent = () => {
  const counter = useSelector((state) => state.counter)
  return <div>{counter}</div>
}
```

![](https://css-tricks.com/wp-content/uploads/2016/03/redux-article-3-03.svg?w=640)  
image: [https://css-tricks.com/wp-content/uploads/2016/03/redux-article-3-03.svg?w=640](https://css-tricks.com/wp-content/uploads/2016/03/redux-article-3-03.svg?w=640)

## Props drilling 문제 해결: Component composition

#### Composition ?

[https://reactjs.org/docs/composition-vs-inheritance.html](https://reactjs.org/docs/composition-vs-inheritance.html)

#### Ex) 일반적인 코드

> 참고 : [https://javascript.plainenglish.io/how-to-avoid-prop-drilling-in-react-using-component-composition-c42adfcdde1b](https://javascript.plainenglish.io/how-to-avoid-prop-drilling-in-react-using-component-composition-c42adfcdde1b)

```

export default function App() {
  return (
    <div className="App">
      <FirstComponent content="Who needs me?" />
    </div>
  );
}

function FirstComponent({ content }) {
  return (
    <div>
      <h3>I am the first component</h3>;
      <SecondComponent content={content} />|
    </div>
  );
}

function SecondComponent({ content }) {
  return (
    <div>
      <h3>I am the second component</h3>;
      <ThirdComponent content={content} />
    </div>
  );
}

function ThirdComponent({ content }) {
  return (
    <div>
      <h3>I am the third component</h3>;
      <ComponentNeedingProps content={content} />
    </div>
  );
}

function ComponentNeedingProps({ content }) {
  return <h3>{content}</h3>;
}
```

#### 개선

```
function FirstComponent({ children }) {
  return (
    <div>
      <h3>I am the first component</h3>;
     { children }
    </div>
  );
}

function SecondComponent({ children }) {
  return (
    <div>
      <h3>I am the second component</h3>;
     {children}
    </div>
  );
}

function ThirdComponent({ children }) {
  return (
    <div>
      <h3>I am the third component</h3>
        {children}
    </div>
  );
}

function ComponentNeedingProps({ content }) {
  return <h3>{content}</h3>
}

export default function App() {
  const content = "Who needs me?";
 return (
    <div className="App">
      <FirstComponent>
        <SecondComponent>
          <ThirdComponent>
            <ComponentNeedingProps content={content}  />
          </ThirdComponent>
        </SecondComponent>
      </FirstComponent>
    </div>
  );
}
```