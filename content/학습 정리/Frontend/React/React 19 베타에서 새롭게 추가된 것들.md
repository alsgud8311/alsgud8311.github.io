## React 19 베타에서 새롭게 추가된 것들
React 19가 2024년 4월 25일 베타버전이 나오게 되었다.
여기에 대해서도 조금 더 자세히 알아보고 이를 어떻게 활용하면 좋을지 생각하기 위해 새롭게 추가된 주요 기능들을 정리해 보려고 한다.
### Actions를 관리하기 위한 기능 추가
리액트에서 말하는 `Actions`는 비동기적인 작업의 수행을 의미한다. 그렇다고 일반적인 data를 가져오기 위한 fetching이 아니라, form에 대한 **action**과 같이 사용자의 상호작용에 따라 비동기적으로 http 요청을 보내는 등의 작업을 정의한 것으로 보인다.
React 19는 이러한 `Actions`에 대해 정의하고 이를 기반으로 구축되었다. 따라서 이를 통한 여러가지 기능들이 추가되었다.
#### Pending State 관리하기
이전까지의 비동기적으로 http 요청을 보내고 받아서 응답에 따라 뷰를 렌더링 하는 방식으로 많이 사용했었다.
```jsx
// Before Actions
function UpdateName({}) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    setIsPending(true);
    const error = await updateName(name);
    setIsPending(false);
    if (error) {
      setError(error);
      return;
    } 
    redirect("/path");
  };

  return (
    <div>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button onClick={handleSubmit} disabled={isPending}>
        Update
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
```
따라서 이를 위한 `isPending`, `error`와 같은 state가 필요했다. data fetching하는 로직의 경우에는 사용자 경험을 위해서 로딩 상태와 에러 상태를 기록하는 것은 중요한 관심사였다.

이에 fetching에서는 항상 loading과 error의 상태를 관리하는 로직 자체가 반복이 되다보니 과거에는 `useFetch`라는 커스텀 훅을 만들어 이를 다양한 api fetching에 활용했었다.

```tsx
import { useState, useEffect } from 'react';

type Status = 'initial' | 'pending' | 'fulfilled' | 'rejected';

interface UseFetch<T> {
  data?: T;
  status: Status;
  error?: Error;
}

export const useFetch = <T>(
  fetchFunction: (...args: any[]) => Promise<T>,
  ...args: any[]
): UseFetch<T> => {
  const [state, setState] = useState<UseFetch<T>>({
    status: 'initial',
    data: undefined,
    error: undefined,
  });

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      setState({ ...state, status: 'pending' });

      try {
        const data = await fetchFunction(...args);
        if (!ignore) {
          setState({ status: 'fulfilled', data });
        }
      } catch (error) {
        if (!ignore) {
          setState({ status: 'rejected', error: error as Error });
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [fetchFunction]);

  return state;
};

```
이를 통해서 코드의 재사용성이나 가독성을 더 높일 수 있었다.
React 19에서는 이러한 비동기 처리 코드에 대해서 `useTransition`에서 pending상태를 리액트 내부에서 관리할 수 있도록 해주어 로딩 상태에 대해서 따로 상태로 선언하여 관리할 필요성이 줄어들었다.
```jsx
// Using pending state from Actions
function UpdateName({}) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const error = await updateName(name);
      if (error) {
        setError(error);
        return;
      } 
      redirect("/path");
    })
  };

  return (
    <div>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button onClick={handleSubmit} disabled={isPending}>
        Update
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
```
비동기 함수가 실행되면서 isPending은 즉시 true값으로 바뀌고 비동기 처리가 일어난 후에는 다시 false값으로 바뀐다. 

`startTransition`을 통해 렌더링의 우선순위를 낮추어 `isPending`에 대한 리렌더링을 우선적으로 수행한 후에 비동기 작업을 처리함으로써 보다 상호작용이 가능하고 반응형이 될 수 있는 UI가 될 수 있다.

#### 새로운 훅 추가 - useActionState
이러한 `Actions`에 대해서 보다 범용적이고 쉽게 사용될 수 있도록 React 19에서는 `useActionState`라는 훅을 새롭게 추가했다.
```jsx
const [error, submitAction, isPending] = useActionState(
  async (previousState, newName) => {
    const error = await updateName(newName);
    if (error) {
      // You can return any result of the action.
      // Here, we return only the error.
      return error;
    }

    // handle success
    return null;
  },
  null,
```
위에서 본 `useFetch`와 비슷하게 `useActionState`가 작동하고 있음을 볼 수 있다. 이 actionState는 기존에 `ReactDOM.useFormState`로 사용되었지만 현재는 deprecated되고 `useActionState`로 이름이 바뀌어 나오게 되었다.
인자로 콜백 함수가 들어가며,  래핑된 상태로 action이 반환된다. 이를 통해 사용자의 action에 대해서 로딩, 에러 상태 처리를 위한 코드를 보다 간편하고 가독성 있게 작성할 수 있다.


#### form에 대한 action 처리
```javascript
<form action={actionFunction}>
```
form에 대한 액션 처리는 이전까지만 해도 쓰기가 어려운 부분이 있었다. form에 대한 action을 처리하는 방법은 onSubmit과 같은 방법을 통해 이벤트를 처리했지만, action이라는 어트리뷰트를 추가하여 여기에 action에 대한 핸들러 함수를 넣게 된다면 `form` 자체 뿐만 아니라 `input`, `button`요소의 action과 formAction 프로퍼티로 넘겨줄 수 있다.

`<form>`은 action이 성공했을 경우에 제어되지 않은 컴포넌트에 대해 form을 재설정한다. action 뿐만이 아니라 따로 수동으로 form을 초기화 할 때는 `requestFormReset`이라는 새로운 React DOM API를 통해서 폼을 초기화시킬 수 있다.

#### 폼의 상태를 관리하는 훅 추가 - useFormStatus
form의 상태를 보고 이에 대한 처리를 하기 위해서는 다른 버튼과 같은 컴포넌트 요소들에게도 따로 props를 내려줘서 이에 대한 상태를 처리해야 했다.
이전까지의 경우 그대로 props로 받아 내려주거나, `useContext`훅을 사용하여 내려주고, 이를 컴포넌트에서 받아 사용할 수 있었다.

이번에 React 19에서는 이러한 부분에 대해 `useFormStatus`라는 새로운 훅을 추가하여 props를 직접 내려받거나 `context api`를 사용할 일 없이 폼 하위의 요소들에서 `useFormStatus` 훅을 실행시키면서 부모 폼에 대해서 `pending state`를 받을 수 있게 되었다.

```jsx
import {useFormStatus} from 'react-dom';

function DesignButton() {
  const {pending} = useFormStatus();
  return <button type="submit" disabled={pending} />
}
```

### 새로운 훅 useOptimistic - 낙관적 업데이트
데이터의 변경이 이루어질 때 UI 패턴에서 많이 이루어지던 방식이 **낙관적 업데이트**이다. 

>낙관적인 업데이트는 서버로 보낸 요청이 정상적일 것이라고 예상하고, 클라이언트의 요청에 대한 응답이 오기 전에 클라이언트의 데이터를 미리 변경시키는 작업을 말한다.

이러한 낙관적 업데이트의 경우는 React에서 없었던 기능이었기에 `React Query`를 이용하여 사용하였다. 하지만 React 19에서 새롭게 `useOptimistic` 훅이 추가되어 이를 사용하여 낙관적 업데이트를 할 수 있다.
```jsx
function ChangeName({currentName, onUpdateName}) {
  const [optimisticName, setOptimisticName] = useOptimistic(currentName);

  const submitAction = async formData => {
    const newName = formData.get("name");
    setOptimisticName(newName);
    const updatedName = await updateName(newName);
    onUpdateName(updatedName);
  };

  return (
    <form action={submitAction}>
      <p>Your name is: {optimisticName}</p>
      <p>
        <label>Change Name:</label>
        <input
          type="text"
          name="name"
          disabled={currentName !== optimisticName}
        />
      </p>
    </form>
  );
}
```
위의 예시를 볼 때, `useOptimistic`을 실행하면 낙관적 업데이트를 시킬 상태와 이 상태를 조작하는 setter 함수를 반환한다. `optimisticName`를 사용하여 action이 일어남과 동시에 `setOptimisticName`을 통해 기존의 데이터를 업데이트가 일어난 후의 데이터로 바꿔주면 그 즉시 렌더링에 반영된 후, action에 대한 비동기 요청이 이루어진다. 만약 이 과정에서 비동기 요청이 실패하거나 끝났을 경우, `optimisticName`는 다시 setter함수를 실행하기 전, 즉 `newName`에서 `currentName`으로 돌아가게 된다.

### 새로운 API : use
React 19에서는 렌더링에서 리소스를 읽을 수 있는 `use`라는 새로운 API를 도입했다.
`use`중인 Promise를 읽으면 Promise가 resolve 될 때까지 React는 Suspend, 즉 중단 상태로 기다린다. 

```jsx
import {use} from 'react';

function Comments({commentsPromise}) {
  // `use` will suspend until the promise resolves.
  const comments = use(commentsPromise);
  return comments.map(comment => <p key={comment.id}>{comment}</p>);
}

function Page({commentsPromise}) {
  // When `use` suspends in Comments,
  // this Suspense boundary will be shown.
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  )
}
```
따라서 use를 사용하는 컴포넌트는 렌더링을 하지 않고 Promise가 resolve될 때까지 기다린 다음에 resolve가 되면(Promise가 fulfilled된 상태) 그때부터 렌더링을 하기 시작한다.

그렇기 때문에 선언적 프로그래밍이 가능해지고, 이는 곧 가독성과 유지보수성을 높여준다. 

> 선언적 프로그래밍
> 무엇을(WHAT) 나타내야 하는지를 프로그래밍적으로 표현하는 것
> 어떻게(HOW) 나타내야 하는지를 프로그래밍적으로 표현하는 명령형 프로그래밍보다 한 단계 더 추상화된 프로그래밍 방식

무엇보다 이 `use`가 쓸만하다고 느낀 점은 `Suspense`와 합쳐졌을 때이다.
기존의 Suspense의 경우는 데이터를 fetching하는 컴포넌트의 모듈에서 Promise를 throw하고, Suspense가 이를 받아 Promise가 resolve되지 않은 상태면 `fallback` 프로퍼치에 들어가 있는 UI를 렌더링하고, resolve된 이후에는 선언형으로 작성된 코드에 데이터를 넣어 렌더링만 하는 방식으로 활용했었다.
```js
export function fetchData<T>(fn: Promise<T>): { read: () => T } {
  let status = "pending";
  let result: T;

  const suspender = fn.then(
    (r) => {
      status = "success";
      result = r;
    },
    (e) => {
      status = "error";
      result = e;
    },
  );

  function read() {
    switch (status) {
      case "pending":
        throw suspender;
      case "error":
        throw result;
      default:
        return result;
    }
  }
  return { read };
}
```
그래서 이런 식으로 fetchData라는 함수를 따로 만들어 활용하는 방식으로 했었지만 함수형 컴포넌트 안에 들어가게 된다면 무한루프가 돌게 되기 때문에 바깥쪽에서 가져와야만 했다.
```tsx
const response = getHeadlines();
export default function ShortNews() {
  const headlines = response.read();
  return (
	  <div>...</div>
  )
}
```
이런 식으로 바깥쪽에서 함수를 실행하고 read 함수를 통해 데이터를 가져오는 방법도 있고
```jsx
<Suspense fallback={<p>사용자 정보 로딩중...</p>}>
	<User resource={fetchData("1")} />
</Suspense>
...
function User({ resource }) {
  const user = resource.user.read();

  return (
    <div>
      <p>
        {user.name}({user.email}) 님이 작성한 글
      </p>
      <Suspense fallback={<p>글목록 로딩중...</p>}>
        <Posts resource={resource} />
      </Suspense>
    </div>
  );
}

```
이런 식으로 아예 함수를 실행한 결과를 컴포넌트의 props로 넘겨주는 방식도 있다.

나 또한 waterfall 현상과 같은 부분을 해결하고 지긋지긋한 `useEffect-fetchData`의 늪에서 벗어날 수 있다는 점에서 좋은 기능이라고 생각했지만 이런 식으로 데이터를 가져오는 방식이 정말 마음에 들지 않았다. 선언형 프로그래밍으로 가독성은 높아졌지만, 코드의 흐름이 원래 알던 방식과는 달라서 불편했다.

> waterfall 현상
> UI가 마치 폭포처럼 위에서 아래로 순차적으로 나타나는 현상
> 상위 컴포넌트의 렌더링이 끝난 후에 하위 컴포넌트의 렌더링이 시작되기 때문에 발생하는 현상

react Query를 쓸 수도 있겠지만 이제까지 react Query를 쓰지 않은 내 입장에서는 `use`의 기능 추가가 매우 반가웠다!

`use` 안에 Promise, fetching하는 함수를 실행하면 이에 따라 promise가 reosolve 될 때까지 Suspense의 fallback ui가 띄워지기 때문에 보다 코드의 흐름을 명확히 알 수 있다는 점이 좋았다.

하지만 `use`는 맨 처음 렌더링 과정에서 만들어진 Promise에 대해서는 지원하지 않는 특징을 가지고 있다. 따라서 아직은 맨 처음 데이터를 가져올 때만 유용하게 사용될 수 있을 것 같다. 아니면 react-Query와 함께 사용하는 방법도 방법 중 하나가 될 수 있을 것 같다.

또 하나 강력한 기능으로, context 또한 `use`를 통해 읽어오는 것이 가능하다.

```jsx
const ColorContext = createContext("");

function App() {
  return (
    <ColorContext value="blue">
      <Form />
    </ColorContext>
  );
}

function Form() {
  return (
    <div>
      <Button show={true}>True</Button>
      <Button show={false}>False</Button>
    </div>
  );
}

function Button({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  if (show) {
    const theme = use(ColorContext);
    return <button style={{ backgroundColor: theme }}>{children}</button>;
  }
  return false;
}
```
컴포넌트의 최상위 레벨에서만 호출해야 하는 `useContext`의 단점을 보완하고 조건분이나 반복문 내부에서도 사용할 수 있어 보다 유연하게 사용될 수 있으며, 추가적으로 `Provider`를 쓰지 않고도 context를 내려줄 수 있는 기능 또한 추가되어 `use`와의 시너지가 잘 맞을 것 같다.

### React Server Components
React Server Component는 리액트의 새로운 패러다임으로, 기존 클라이언트 사이드 렌더링만 지원하는 React에서 보다 Next.js같이 발전한 방식으로 볼 수 있다.

리액트의 서버 컴포넌트는 기존에 CSR 방식으로 운영되던 리액트가 한 번에 모든 리소스를 다운로드 받고 띄워야 하는 만큼 이에 대한 대기 시간이 점차 길어지자 이를 개선하기 위해 설계된 방식이다.

사용자와의 상호작용 없이 정적 요소만 담은 컴포넌트의 경우, 훨씬 빨리 컴포넌트를 렌더링할 수 있는 환경인 서버에서 직접 렌더링하는 편이 낫다. 이를 통해
- 리렌더링의 필요성을 없애 성능 개선
- 자바스크립트의 번들링 크기 축소
- 초기 페이지 로드 속도 개선
이외에도 많은 성능적, 사용자 환경적 개선을 기대할 수 있기 때문에 React 또한 next.js처럼 서버 컴포넌트에 대한 지원을 계속 업데이트하고 있다.

React는 서버사이드 렌더링을 지원하기 위해 기존 SSR 서버와는 다른 별도의 서버를 사용했다. 별도의 서버에서 미리 서버 컴포넌트를 렌더링 한 다음, 이를 띄워주는 방식이다. 해당 서버 컴포넌트는 빌드 시 CI 서버에서 한번 실행할 수도 있고, 웹 서버를 사용하여 각 요청마다 새롭게 실행할 수도 있다.

```javascript
    import db from './database';
    
    async function Note({id}) {
      const note = await db.notes.get(id);
      return (
        <div>
          <Author id={note.authorId} />
          <p>{note}</p>
        </div>
      );
    }
    
    async function Author({id}) {
      const author = await db.authors.get(id);
      return <span>By: {author.name}</span>;
    }
    ```
이런 식으로 함수형 컴포넌트 자체를 비동기 함수로 만든 다음에, 서버에서 데이터를 가지고 와 렌더링하여 사용자와 상호작용 없는 컴포넌트를 빠르게 보여줄 수 있다.
앱이 로드될 때 클라이언트는 사용된 라이브러리를 보지 못하고 오로지 렌더링된 출력물만 볼 수 있기 때문에 상호작용과 상태 관리는 되지 않지만, 상호작용이 필요한 부분과 필요없는 부분을 나누어 서버 컴포넌트와 클라이언트 컴포넌트를 나누어 개발하면 보다 성능이 올라갈 것이다.

```jsx
// Server Component
import db from './database';

async function Page({id}) {
  // Will suspend the Server Component.
  const note = await db.notes.get(id);
  
  // NOTE: not awaited, will start here and await on the client. 
  const commentsPromise = db.comments.get(note.id);
  return (
    <div>
      {note}
      <Suspense fallback={<p>Loading Comments...</p>}>
        <Comments commentsPromise={commentsPromise} />
      </Suspense>
    </div>
  );
}

...

// Client Component
"use client";
import {use} from 'react';

function Comments({commentsPromise}) {
  // NOTE: this will resume the promise from the server.
  // It will suspend until the data is available.
  const comments = use(commentsPromise);
  return comments.map(commment => <p>{comment}</p>);
}
```
서버에서 직접 Suspense에 대한 스트리밍이 지원되기 때문에 보다 Suspense가 활용될만한 곳이 많아진 것 같다고 생각한다.
위에 보이는 예시처럼 서버 컴포넌트는 직접 서버에서 비동기 컴포넌트에 대해 fetching하는 함수를 넘겨주고, `use`를 사용하여 Promise를 인자로 넣음으로써 서버 컴포넌트 안에 클라이언트 컴포넌트가 작동하는 방식으로도 활용이 가능하다.
여기서 suspense 또한 `Comments`의 부모로 있기 때문에 정상적으로 Suspense fallback UI가 렌더링되고, 클라이언트 컴포넌트에서 비동기적으로 데이터가 들어오면 이에 따라 안쪽 요소를 채우도록 할 수 있다.

### 서버 액션 처리
#### 서버 컴포넌트에서의 서버 액션
```jsx
// Server Component
import Button from './Button';

function EmptyNote () {
  async function createNoteAction() {
    // Server Action
    'use server';
    
    await db.notes.create();
  }

  return <Button onClick={createNoteAction}/>;
}
```
`"use server"` 지시어를 사용하여 서버에서 실행하는 비동기 함수를 서버 컴포넌트에서 사용할 수 있도록 할 수 있다.
위와 같이 액션에 대해서 비동기적으로 처리해야 하는 부분에서 `use server`를 쓰고, 서버에서 이 액션에 대해 처리할 수 있다.

리액트가 컴포넌트를 생성하는 과정에서 이렇게 서버에서 사용하는 비동기 함수를 가져오게 되면 함수에 대한 참조를 Button의 onClick 인자에 넘겨준다. 

#### 클라이언트 컴포넌트에서의 서버 액션
```js
"use server";

export async function createNoteAction() {
  await db.notes.create();
}
```
클라이언트 컴포넌트의 경우에는 `"use server"` 지시어를 사용하는 파일에서 서버 액션을 가져올 수 있다.
```jsx
"use client";
import {createNoteAction} from './actions';

function EmptyNote() {
  console.log(createNoteAction);
  // {$$typeof: Symbol.for("react.server.reference"), $$id: 'createNoteAction'}
  return <button onClick={createNoteAction} />
}
```
그러면 클라이언트 컴포넌트가 빌드되는 과정에서 함수에 대한 참조를 생성하여 넘겨줌으로써 서버 액션을 사용할 수 있도록 할 수 있다.

#### 액션으로 서버 액션 구성하기
액션으로 서버 액션을 구성한다는 것이 무슨 뜻일까?
이는 아래의 예시를 보면 어느정도 이해가 가능하다.
```jsx
"use server";

export async function updateName(name) {
  if (!name) {
    return {error: 'Name is required'};
  }
  await db.users.updateName(name);
}
...
"use client";

import {updateName} from './actions';

function UpdateName() {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const [isPending, startTransition] = useTransition();

  const submitAction = async () => {
    startTransition(async () => {
      const {error} = await updateName(name);
      if (!error) {
        setError(error);
      } else {
        setName('');
      }
    })
    return (
    <form action={submitAction}>
      <input type="text" name="name" disabled={isPending}/>
      {state.error && <span>Failed: {state.error}</span>}
    </form>
  )
  }
```
예시에서는 `"use server"` 지시어를 사용하여 `updateName`이라는 서버 액션을 만들었다. 이 서버 액션의 경우 직접적으로 db에 접근하여 이름을 수정하는 로직이 담겨있다.
아래 `"use client"`를 사용한 코드에서는 안에서 `submitAction`이라는 액션을 하나 더 만들었다. 이 액션은 클라이언트에서 서버와의 데이터 통신에 한 겹 더 래핑한 구조를 가지고 있다. 추가적으로 비동기적으로 동작하는 서버 액션에 대해 에러 상태와 `pending` 상태를 추가하기 위해서 `error`라는 `state`와 `useTransition`을 통해 pending 상태를 관리하고 있다. 이를 통해 서버 액션에 대해 pending 상태에 접근할 수 있기 때문에 이런 식으로도 액션을 둘 다 활용하여 로직을 더 보완할 수 있다.

https://www.jeong-min.com/64-react-19-use/