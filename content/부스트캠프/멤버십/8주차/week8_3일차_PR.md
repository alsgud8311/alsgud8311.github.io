## 주요 작업
- Error Boundary를 통한 컴포넌트 오류 처리
- Suspense를 통한 컴포넌트의 로딩 상태 관리
- fetchData를 통해 Suspense에서 catch할 수 있는 상태를 throw 하는 로직 작성
## 학습 키워드
- Error boundary
- Concurrent Mode
- Suspense
## 고민 및 해결과정
### Suspense를 통한 로딩 로직 관리
```tsx
import ShortNews from "@entities/autoRollingNews/ui/shortNews";
import Header from "@/shared/ui/header";
import { Contents } from "@/widgets/contents";
import AsyncBoundary from "@/shared/lib/asyncBoundary";

function App() {
  return (
    <div className="flex w-[930px] flex-col gap-9">
      <Header />
      <AsyncBoundary>
        <ShortNews />
      </AsyncBoundary>
      <Contents />
    </div>
  );
}

export default App;

```
나는 이런 식으로 AsyncBoundary라는 컴포넌트를 따로 만들어 Error boundary & Suspense 컴포넌트를 놓고 안의 children 요소들의 로딩 상태와 오류를 catch할 수 있도록 해주었다.

하지만 그 과정에서 기존의 useEffect로 data를 fetching하는 로직의 경우, useEffect는 컴포넌트가 렌더링 후 마운트 되었을 때 나타나는 상태지만, Suspense로 로딩 상태를 처리하는 경우 컴포넌트가 선언적으로 되어있기 때문에 데이터를 만약 받아오지 않은 상태라면 렌더링을 하지 않고 그동안 suspense의 fallback ui만 보여준 후 데이터가 받아졌을 경우에 렌더링을 한다.

그렇기 때문에 사실상 useEffect로 하는 로직이 제대로 먹히지 않았다. 이러한 문제를 해결하기 위해 useEffect를 제거함과 동시에 state 또한 hook으로써 작동하기 때문에 제대로 렌더링 과정에서 관리되지 못할 것 같다고 판단했다.
이에 데이터를 일반 변수로 선언해둔 다음에 온메모리에서 이를 관리하면 되지 않을까? 하는 생각이 들었고, 이에 대해서 fetching하는 로직을 따로 만들어보았다.



```ts
let dataCache: any | null = null;
let suspenderCache: Promise<void> | null = null;
let error: Error | null = null;

export function fetchData<T>(fn: Promise<T>) {
  if (dataCache) {
    return {
      read() {
        return dataCache;
      },
    };
  }

  if (!suspenderCache) {
    suspenderCache = fn
      .then((data) => {
        dataCache = data;
      })
      .catch((err) => {
        error = err;
      });
  }

  return {
    read(): T {
      if (error) throw error;
      if (dataCache === null) {
        throw suspenderCache;
      } else {
        return dataCache;
      }
    },
  };
}

```
이를 통해 비동기적으로 fetching하는 로직이 작동하면서 로딩중인 상태, 에러 상태, 정상 데이터 반환 상태를 분기처리하여 던져주어 에러에 대해서는 Errorboundary가 처리를 하고, 로딩 중 상태의 경우 data를 fetching중인 상태를 던져 리액트에서 이를 감지하여 Suspense fallback ui를 렌더링할 수 있도록 해주었다.
데이터가 정상적으로 받아졌을 때는 read함수를 통해서 데이터를 받아와 선언적으로 구성했던 컴포넌트에 대해서 렌더링할 수 있도록 해줬다.