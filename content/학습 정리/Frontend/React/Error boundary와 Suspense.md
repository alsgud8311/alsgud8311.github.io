
## Error boundary
클라이언트에서 오류를 받게 되면 UI가 그대로 없어지는 현상을 많이 보았을 것이다.
하지만 이러한 현상은 사용자경험에 있어서는 치명적인 오류가 아닐 수 없다.
그렇기 때문에 Error boundary를 설정함으로써 깨진 컴포넌트 트리 대신 **Fallback UI**, 즉 **대체할 수 있는 UI**를 보여줄 수 있도록 해서 에러를 관리하는 패턴이다.

리액트에서는 버전 16부터 이를 도입하여 **렌더링 도중의 생명주기 / 하위 트리**  에서 에러를 잡아낼 수 있도록 클래스형 컴포넌트에 두 가지 생명주기 메서드를 도입했다.

- static getDerivedStateFromError()
- componentDidCatch()

>하지만 다음과 같은 에러는 잡지 못하니 주의하자.
>- 이벤트 핸들러
>- 비동기적 코드 (예: setTimeout 혹은 requestAnimationFrame 콜백)
>- 서버 사이드 렌더링
> - 자식에서가 아닌 에러 경계 자체에서 발생하는 에러

```js
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }


  static getDerivedStateFromError(error) {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트
    return { hasError: true }
  }


  componentDidCatch(error, errorInfo) {
    // 에러 로그 찍기
    logErrorToMyService(error, errorInfo)
  }


  render() {
    if (this.state.hasError) {
      // 폴백 UI를 커스텀하여 렌더링시키기
      return <h1>Something went wrong.</h1>
    }


    return this.props.children
  }
}
```
이렇게 만들어진 클래스형 컴포넌트는 

```js
<ErrorBoundary>
  <App />
</ErrorBoundary>
```
이런 식으로 프로젝트 자체를 전부 래핑하여 오류를 발견하고, 에러가 보일 시에 다른 텍스트를 통해 UI로 돌아가게끔 할 수 있다.
하지만 위와 같이 제공해준 생명주기 메서드는 훅이 있는 함수형 컴포넌트에서는 사용이 불가능하다.

그래서 클래스형으로 고차 컴포넌트를 만들고, 이를 감싸는 바운더리 컴포넌트를 통해 관리하는 것으로 보인다.
```tsx
import React from "react"


type ErrorHandler = (error: Error, info: React.ErrorInfo) => void
type ErrorHandlingComponent<Props> = (props: Props, error?: Error) => React.ReactNode


type ErrorState = { error?: Error }


export default function withCatch<Props extends {}>(
  component: ErrorHandlingComponent<Props>,
  errorHandler?: ErrorHandler
): React.ComponentType<Props> {
  function Inner(props: { error?: Error, props: Props }) {
    return <React.Fragment>{component(props, error)}</React.Fragment>
  }


  return class extends React.Component<Props, ErrorState> {
    state: ErrorState = {
      error: undefined
    }


    static getDerivedStateFromError(error: Error) {
      return { error }
    }


    componentDidCatch(error: Error, info: React.ErrorInfo) {
      if (errorHandler) {
        errorHandler(error, info)
      }
    }


    render() {
      return <Inner error={this.state.error} props={this.props} />
    }
  }
}
```
해당 컴포넌트는 고차 컴포넌트(Higher-Order Component, HOC)로 만들어 졌으며, 자식 컴포넌트의 에러를 잡아내고 처리하는 기능을 추가한 버전이다. 함수형 컴포넌트처럼 생겼지만서도 내부에서는 클래스형 컴포넌트를 이용해서 구현하였다.
해당 컴포넌트는 children을 받는 것처럼 안쪽의 요소를 받아 그대로 컴포넌트로 에러 상태를 내려준다.


Inner라는 함수형 컴포넌트를 통해 안쪽에 에러 바운더리를 설정하는데, 이를 에러의 상태를 잡아 캐치하게 되면 error에는 해당 에러의 내용이 담기게 되고, 에러가 있을 경우 `getDerivedStateFromError`에 에러가 담기게 되며, state가 업데이트 되고, `componentDidCatch`가 실행되어 해당 에러에 대해 처리를 하게 된다.

따라서 에러 처리를 단계별로 나누어보자면
- 컴포넌트 생성: `Catch` 함수를 통해 에러 바운더리 역할을 하는 클래스형 컴포넌트를 반환
- 렌더링: 컴포넌트가 렌더링될 때, 자식 컴포넌트(`Inner`)가 호출되어 에러 또는 정상적인 `props`로 렌더링됩니다.
- 에러 발생 시: 자식 컴포넌트에서 에러가 발생하면, `getDerivedStateFromError` 메서드가 호출되어 `state.error`가 설정되고 이 상태에 따라 에러가 렌더링됩니다.
- 에러 후처리: 에러가 발생하면 `componentDidCatch`에서 에러 핸들러가 동작할 수 있습니다.

이러한 방식은 라이브러리인 `react-error-boundary`에서도 비슷한 방식으로 활용한다.
```tsx
import { isDevelopment } from "#is-development";
import { Component, createElement, ErrorInfo, isValidElement } from "react";
import { ErrorBoundaryContext } from "./ErrorBoundaryContext";
import { ErrorBoundaryProps, FallbackProps } from "./types";

type ErrorBoundaryState =
  | {
      didCatch: true;
      error: any;
    }
  | {
      didCatch: false;
      error: null;
    };

const initialState: ErrorBoundaryState = {
  didCatch: false,
  error: null,
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
    this.state = initialState;
  }

  static getDerivedStateFromError(error: Error) {
    return { didCatch: true, error };
  }

  resetErrorBoundary(...args: any[]) {
    const { error } = this.state;

    if (error !== null) {
      this.props.onReset?.({
        args,
        reason: "imperative-api",
      });

      this.setState(initialState);
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(
    prevProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState
  ) {
    const { didCatch } = this.state;
    const { resetKeys } = this.props;

    // There's an edge case where if the thing that triggered the error happens to *also* be in the resetKeys array,
    // we'd end up resetting the error boundary immediately.
    // This would likely trigger a second error to be thrown.
    // So we make sure that we don't check the resetKeys on the first call of cDU after the error is set.

    if (
      didCatch &&
      prevState.error !== null &&
      hasArrayChanged(prevProps.resetKeys, resetKeys)
    ) {
      this.props.onReset?.({
        next: resetKeys,
        prev: prevProps.resetKeys,
        reason: "keys",
      });

      this.setState(initialState);
    }
  }

  render() {
    const { children, fallbackRender, FallbackComponent, fallback } =
      this.props;
    const { didCatch, error } = this.state;

    let childToRender = children;

    if (didCatch) {
      const props: FallbackProps = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      };

      if (typeof fallbackRender === "function") {
        childToRender = fallbackRender(props);
      } else if (FallbackComponent) {
        childToRender = createElement(FallbackComponent, props);
      } else if (fallback === null || isValidElement(fallback)) {
        childToRender = fallback;
      } else {
        if (isDevelopment) {
          console.error(
            "react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop"
          );
        }

        throw error;
      }
    }

    return createElement(
      ErrorBoundaryContext.Provider,
      {
        value: {
          didCatch,
          error,
          resetErrorBoundary: this.resetErrorBoundary,
        },
      },
      childToRender
    );
  }
}

function hasArrayChanged(a: any[] = [], b: any[] = []) {
  return (
    a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]))
  );
}
```
보다 리액트의 안쪽까지 들어가서 createElement를 통해 컴포넌트를 생성하고, Context를 이용해서 내려주는 방식을 사용하고 있다.

아무튼 다시 위의 보다 간소화된 코드로 돌아가서,,

```js
import { Fragment } from "react/jsx-runtime";
import withCatch from "./withCatch";

type Props = {
  children: React.ReactNode;
};

const ErrorBoundary = withCatch(function ErrorBoundary(
  props: Props,
  error?: Error,
) {
  if (error) {
    return (
      <div>
        <h1>{error.message}</h1>
      </div>
    );
  } else {
    return <Fragment>{props.children}</Fragment>;
  }
});

export default ErrorBoundary;

```
고차컴포넌트를 활용한 방식이다. 아까 만들어진 withCatch을 사용한다.

해당 에러 바운더리 컴포넌트는 현재 withCatch 고차 컴포넌트 안에 컴포넌트가 들어가 있는 방식이다. 

```jsx
function App() {
  return (
    <ErrorBoundary>
      <div className="flex w-[930px] flex-col gap-9">
        <Header />
        <ComponentA />
        <ComponentB />
      </div>
    </ErrorBoundary>
  );
}
```
이런 식으로 Error Boundary 안에 children으로 안쪽 요소를 채워넣게 되는 형태가 되는데, 이 함수들의 흐름을 따라가면서 보다 자세하게 이해해보자.

### 작동 방식 이해하기
ErrorBoundary 컴포넌트의 props로는 children 속성으로 안에 들어가 있는 요소들이 들어가게 된다. container와 비슷한 느낌이라고 볼 수 있다.
```js
type Props = {
  children: React.ReactNode;
};

const ErrorBoundary = withCatch(function ErrorBoundary(
  props: Props,
  error?: Error,
) {
  if (error) {
    return (
      <div>
        <h1>{error.message}</h1>
      </div>
    );
  } else {
    return <Fragment>{props.children}</Fragment>;
  }
});
```
ErroBoundary에는 컴포넌트를 withCatch가 감싸고 있다.
witchCatch로 넘어가보자
```jsx
export default function withCatch<Props extends {}>(
  component: ErrorHandlingComponent<Props>,
  errorHandler?: ErrorHandler
): React.ComponentType<Props>
```
withCatch는 에러를 핸들링하는 컴포넌트와 errorHandler를 가지게 된다.
이 `component`의 타입을 보자
```js
type ErrorHandlingComponent<Props> = (
  props: Props,
  error?: Error,
) => React.ReactNode;
```
필요한 props를 제네릭을 통해 넘겨받고, 여기에 error까지 서비스로 받는다(없을 수도 있음).
그 error를 처리하는 로직을 담은 `ErrorBoundary`가 여기에 들어가는 것이다.
```jsx
type ErrorState = { error?: Error };
...
function Inner({ error, props }: { error?: Error; props: Props }) {
    return <Fragment>{component(props, error)}</Fragment>;
  }
  
return class extends Component<Props, ErrorState> {
    state: ErrorState = {
      error: undefined,
    };

    static getDerivedStateFromError(error: Error) {
      return { error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
      if (errorHandler) {
        errorHandler(error, info);
      }
    }

    render() {
      return <Inner error={this.state.error} props={this.props} />;
    }
  };
```
이렇게 `Errorboundary`를 넣었을 경우에, `withCatch`는 다시금 컴포넌트를 내뱉는다. 하지만 이번엔 ErrorState까지 상태로 가진 컴포넌트이다.

클래스형 컴포넌트에서는 리액트의 생명주기가 있는데, 이 생명주기에서 `getDerivedStateFromError`를 통해 에러를 잡는다. 얘는 하위 컴포넌트에서 오류가 발생하면 호출되면서 해당 오류를 인자로 받는다.
에러가 발생한 뒤에 `fallback UI`를 렌더링 시키기 위해서는`getDerivedStateFromError` 를 통해 에러를 잡아야 한다. 얘는 하위 자식 컴포넌트에서 오류가 발생했을 때 render단계에서 호출된다. 
호출이 되면서 `state`라는 프로퍼티에는 error가 들어가게 되고, 그 다음 Inner 컴포넌트를 리턴한다. 이 컴포넌트에서 받았던 props 속성 + error를 서비스로 받게 되는 것이다.
```tsx
function Inner({ error, props }: { error?: Error; props: Props }) {
    return <Fragment>{component(props, error)}</Fragment>;
  }
```
그렇게 되면 해당 함수형 컴포넌트는 error와 props를 받아 Fragment 사이에 해당 컴포넌트 자체를 실행시켜 렌더링된 요소를 안쪽에 넣게 된다.
```tsx
const ErrorBoundary = withCatch(function ErrorBoundary(
  props: Props,
  error?: Error,
) {
  if (error) {
    return (
      <div>
        <h1>{error.message}</h1>
      </div>
    );
  } else {
    return <Fragment>{props.children}</Fragment>;
  }
});
```
그렇게 안쪽으로 들어간 애가 얘다. 보면 서비스로 받은 error를 달고 있다.
그래서 얘는 하위 컴포넌트에서  에러가 발생했을 경우 error를 서비스로 받고 돌아오니까 이 error에 대해 처리를 해주기 위해 fallback UI를 띄우게 된다.
하지만 error가 없을 경우 정상적으로 실행되었다는 소리니 `ErrorBoundary`로 감쌌던 children들을 그대로 넣어준다.

![](https://i.imgur.com/dhpGn7A.png)
이렇게 해서 만약 처음에 오류가 생기면 이와같이 에러를 받아 ErrorBoundary로 넘겨주고 Errorboundary가 이를 인지하고 해당 오류를 띄워주는 것이다!


###  이게 가능한 이유
리액트에서는 throw에 대해서도 일반적으로 다 오류 취급하지 않는다.
만약 throw한 것이 Promise 객체라면 리액트는 이에 대해서 Pending상태인 Promise구나! 하고 해당 작업에 대해서 비동기적으로 실행시켜놓는다.
Promise는 resolve될 때해당 Promise에 대해서 실행한 결과를 

```js
const response = getHeadlines();
export default function ShortNews() {
...
}
...
//fetch하는 함수
export default function getHeadlines() {
  return fetchData<Article[]>(fetcher.get(HEADLINE_URI));
}

```
중요한 점은 컴포넌트의 밖에다가 선언해야 한다는 점이다
밖에다가 선언해놓지 않을 경우 리액트는 아무것도 모르는 상태에서 컴포넌트를 렌더링하려고 할 것이고, 그 과정에서 함수형 컴포넌트를 실행시키는데 fetch하게 된다면 이 때마다 Promise를 받고 다시금 요청하려고 하는데, 리렌더링이 무한히 되는 루프에 빠져버리고 만다.