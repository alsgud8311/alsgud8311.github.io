## React Fiber란? 

리액트 파이버는 리액트 버전 16버전부터 새롭게 등장한 재조정 알고리즘이다.
해당 알고리즘은 기존의 스택 형식으로 되어있던 리액트의 리렌더링 자체를 바꾼 알고리즘으로, 리액트를 동작하는 근간 자체를 바꾸었다고 보아도 과언이 아니다. 

## 새로운 렌더링 재조정 알고리즘의 필요성
리액트 팀은 16버전까지 사용하던 스택 기반의 재조정 알고리즘을 사용했다.
하지만 이러한 스택 기반 재조정 알고리즘의 경우 치명적인 문제점이 존재했다.

![](https://blog.kakaocdn.net/dn/bnWwD4/btqGexjfADe/GWh2KY6PKrn3QPr7dXWlk1/img.gif)
해당 gif를 보자.
해당 방식은 리액트의 스택 기반의 재조정 알고리즘을 사용해 reconciliation(재조정)을 거치며 애니메이션을 렌더링한 것이다.

![](https://blog.kakaocdn.net/dn/rJmXg/btqGdLWNC9q/tJ0w8uPOaztVyqyIkck80k/img.gif)
반면 새로운 재조정 알고리즘은 꽤나 깔끔하게 움직이는 모습을 보인다.
둘 사이에 왜 이런 차이가 났느냐고 하면 우리의 모니터를 생각해보면 된다.
현대 일반적인 모니터는 보통 초당 60회 화면 갱신을 한다. 화면을 한번 갱신하고 다음 화면을 갱신하기까지동안 1/60초, 즉 16ms 정도가 걸린다는 얘기다.
하지만 만약에 렌더링을 하는 시간이 16ms보다 더 걸린다면 어떻게 될까?
렌더링을 하는 시간이 16ms보다 더 걸리게 된다면 ui가 업데이트되는 속도는 모니터의 주사율을 따라갈 수 없어 모니터가 원하는 만큼의 속도로 빠르게 갱신되지 못하고 끊기게 된다. 그렇기 때문에 위처럼 끊기는 듯한 애니메이션이 연출된다.

하지만 스택 알고리즘의 문제는, 이러한 작업들에 대해서 **중단하거나 중요한 작업에 대해 먼저 수행할 수 없다**는 점이었다. 렌더링에 필요한 작업들이 스택에 들어가서 쌓이면 내부적으로 해당 스택을 전부 비울 때까지 동기적으로 작업이 이루어졌는데, 싱글 스레드로 작동하는 자바스크립트로는 이러한 동기 작업을 중단할 수 없었다. 그렇기에 중요한 렌더링 작업들이 후에 비효율적으로 렌더링 작업을 진행하면서 렌더링 문제가 발생하게 되었다.

이러한 이유 때문에 메타의 리액트 팀에게 있어서 16ms는 중요 고려사항으로 자리잡은데 비해, 스택 기반의 알고리즘은 이를 따라갈 수 없기 때문에 결국 새롭게 내놓은 것이 **파이버 아키텍처**를 기반으로 한 재조정 알고리즘이다.

그럼 이제 이러한 파이버 아키텍처에 대해 알아보자.

## React의 동작 단계
React의 내부 동작은 크게 네 가지의 단계로 구분된다.
- Render : JSX 트랜스파일러를 통해 React.createElement를 실행하여 React Element 생성
- Reconcile(재조정) : 이전에 렌더링된 실제 DOM트리와 새로 렌더링할 React 엘리먼트를 비교하여 변경점 적용
- Commit : 재조정 후 새롭게 만들어진 DOM Element를 브라우저 뷰에 보이게 함
- Update : props, state등이 변경 시에 해당 컴포넌트와 하위 컴포넌트에 대해 업데이트 반복
리액트는 이처럼 Render 후 Update(Reconcile & Commit) 단계를 반복하면서 렌더링을 수행한다. 이 과정에서 활용되는 개념이 가상 DOM(Virtual DOM), 정확히 말하면 **Fiber Node**이다.

## Fiber Node
리액트의 렌더링 과정은 Fiber Node를 제외하고 설명할 수 없다. 렌더링 과정에서 근본적으로 활용되는 가상DOM이 곧 Fiber Node이기 때문이다. 그러니 먼저 Fiber Node에 대해 알아보도록 하자.

리액트 파이버는 리액트에서 관리하는 자바스크립트 객체이다. 파이버는 파이버 재조정자(Fiber Reconciler)가 관리하는데, 이 재조정자가 가상 DOM과 실제 DOM을 비교해 변동사항을 수집 및 반영하는 역할을 한다.

### 왜 도입하게 되었을까?
이 리액트 파이버를 도입하게 된 이유, 즉 리액트 파이버의 목표는 크게 두가지로 볼 수 있다.
- 반응성 문제 해결(애니메이션, 레이아웃, 사용자 인터랙션 등)
	- 작업을 분할하고 우선순위를 매겨 먼저 필요한 렌더링부터 작업
	- 상대적으로 우선순위가 낮은 작업을 중단 후에 나중에 다시 시작
	- 이전에 했던 작업이 필요없어질 경우 폐기
- 비동기적으로 동작하여 효율 증대
	- 싱글 스레드에서 동작하는 자바스크립트에서 동기적인 작업을 통해 가지는 비효율성을 해소
이러한 문제를 해결하기 위해 리액트 팀은 파이버를 도입했다. 사실상 점점 애플리케이션 자체가 고도화되면서 하나의 인터랙션에도 많은 이벤트와 애니메이션들이 이루어지는 상황에 위와 같은 문제를 해결하는 것은 필수불가결한 일이기도 했다.

### Fiber Node의 구성요소
그렇다면 Fiber Node의 구성요소에 대해 알아보자.
```js
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  // Instance
  this.tag = tag; 
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // Fiber
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;
  this.refCleanup = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  // Effects
  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;
  this.deletions = null;

  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  this.alternate = null;
  ...
}
```

#### Instance
- tag
	- 리액트 파이버는 1:1관계를 가진다. DOM이든 컴포넌트든 무조건 1:1의 관계를 지니며, 이 유형은 태그 속성 내의 `this.tag`에 저장된다. 이 type에서는 fuctional component, class component 등 우리가 아는 여러 유형들의 노드들에 대해서 번호로 관리한다.
- type
- elementType
	- 어떤 요소인지 타입 구분
- key
	- 컴포넌트를 식별하는데 사용되는 고유값이다. 한 배열 안에서 같은 tag를 가진 여러 개의 요소들이 있다면 재조정자는 순서와 일부 요소의 변경에 대해서 같은 태그를 가지고 있기 때문에 비교하기가 어렵다. 따라서 key를 통해 각 컴포넌트를 구별할 수 있도록 하여 불필요한 렌더링을 방지한다.
- StateNode
	- 해당 객체에 대한 참조를 가지고 있으며 이 속성을 사용하여 파이버와 관련된 상태들에 접근할 수 있다. 

#### Fiber
- child, sibling, return
	- Fiber를 기반으로 트리를 만드는 과정에서 필요한 관계가 이 세 가지 속성에 의해 결정된다. 
	- 특히 child가 children(여러개)이 아닌 하나의 자식만을 가지고 있다는 점이 특이한데, 그 child는 자식의 첫 번째 요소를 가리킨다. 자식이 첫 번째 요소만 가리키기 때문에, 만약 하나의 부모에 여러 개의 요소가 들어 있다면, 첫 번째 요소만 자식 요소가 되고 마너지는 해당 **자식 요소의 형제 요소들이 된다.**
	- return의 경우 상위 항목, 즉 부모 항목에 대한 참조를 나타낸다.
- index
	- 같은 태그로 된 여러 개의 형제가 있을 경우 이러한 요소들의 순서를 구별하기 위해 숫자로 관리한다
- ref, refCleanup
	- 특정 컴포넌트나 DOM요소에 접근할 수 있도록 DOM요소나 인스턴스에 대한 참조
	- 컴포넌트가 언마운트 될 떄 메모리 누수를 방지하기 위해 refCleanup을 통해 불필요한 참조를 제거함
- mode
	- FiberNode가 렌더링되는 방식 정의
	- Concurrent Mode나 StrictMode와 같은 동작 결정

- pendingprops
	- 아직 작업에 대해서 처리하지 못한 props를 저장
- memoizedProps
	- pendingprops이 렌더링이 완료되면 memoizedProps로 옮겨가며 현재 가지고 있는 props를 표현한다
- updateQueue
	- 상태 업데이트, 콜백함수, DOM 업데이트 등 필요한 작업을 담아두는 큐이다.
- memoizedState
	- 함수 컴포넌트의 훅 목록으로, useState를 비롯한 모든 훅 리스트와 최신 상태 값
- Alternate
	- 뒤에서 더 설명할 것으로, 리액트에 존재하는 두 가지 트리 중에서 자신을 포함하지 않은 반대편 트리를 의미함

#### flags
- flags
	- 노드에서 수행하는 작업을 나타내는 비트 플래그
	- placement(새로운 DOM 노드 삽입), Update(기존 DOM 노드 업데이트), Deletion(DOM 노드 삭제) 등의 플래그를 통해 리렌더링 여부를 결정
- subtreeflags
	- 하위 트리 내에서 발생해야 하는 작업을 나타냄
- deletions
	- 삭제해야 하는 자식 노드들의 목록 관리
	- 삭제해야 하는 노드들을 미리 배열에 추가해놓고, 일괄로 처리함
- lanes
	- Concurrent Mode에서 작업의 우선순위를 투적
- childLanes
	- 하위 트리에서 실행할 작업들의 우선순위를 추적

## 가상 DOM(fiber)을 이용한 리액트 렌더링
리액트의 virtual DOM 개념은 렌더링 되어 있는 상태의 DOM 요소에 가지고 있는 rootFiber의 정보와 더불어 추가적으로 하나의 rootfiber를 따로 구성한다.  
여기서 root의 경우 **fiberRoot**와 **rootFiber**로 두 가지의 root가 있다. 

fiberRoot의 경우 createRoot를 통해 만드는 가장 기본적인 html 템플릿의 루트로, 계속해서 안쪽 요소의 렌더링이 이루어지는 SPA의 특성상 고정적인 head와 body를 가진 root를 두고 안쪽 요소들만 갈아끼우기 위해 rootFiber를 따로 두어 실질적인 렌더링이 반복적으로 이루어지는 root를 따로 구분했다.

 이 root에 대한 fiber를 구성하는 과정에서 **root fiber를 하나 더 구성**하는 것이 react virtual DOM의 핵심이다. 리액트는 **기존 렌더링 되어 있는 상태의 DOM의 정보를 가진 fiber**와 **새롭게 변동사항이 있을 경우에 이를 반영한 버전의 fiber**를 따로 가지고 있는 것이다.

상태가 변경됐을 경우에, 리액트는 재조정 과정을 통해 현재 렌더링된 DOM 상태를 가진 fiber와 상태 변경이 이루어진 fiber를 비교하여 변경이 이루어져 업데이트가 이루어져야 하는 부분을 찾고 반영한다. 이 일련의 과정은 fiber를 비교하는 과정에서 볼 수 있다.
![](https://i.imgur.com/WX5Ji1T.png)
위 사진과 같이 rootFiber에서부터 재조정 과정을 시작한다. 파이버는 재조정 과정에서 **performUnitOfWork**라는 함수를 실행시키는데, `beginwork`와 `completework` 함수가 포함되어 있다. 따라서 안쪽의 파이버로 계속해서 들어가면서 beginwork가 실행되고, 끝까지 들어갔다가 돌아오는 과정에서 return받으면 completework를 실행하며 해당 파이버에 대한 작업을 종료한다. 
![](https://i.imgur.com/bMKqP19.png)
아까 말했던 말을 다시금 생각해보자.

> 상태가 변경됐을 경우에, 리액트는 재조정 과정을 통해 현재 렌더링된 DOM 상태를 가진 fiber와 상태 변경이 이루어진 fiber를 비교하여 변경이 이루어져 업데이트가 이루어져야 하는 부분을 찾고 반영한다

그렇다면 이 상태변경이 이루어진 fiber는 어디에 할당되어 있는가? 바로 현재 렌더링 되어 있는 DOM 트리, 즉 **fiberRootNode의 current 가리키고 있는 rootFiber의 alternate 프로퍼티**이다.

rootFiber는 current가 가리키고 있는 rootFiber와는 별개로 현재 렌더링된 rootFiber의 alternate props로 다른 rootFiber를 가지고 있다. alternate에 할당된 rootFiber는 변동사항이 반영된 rootFiber이다.
이 두 fiber는 alternate를 통해 서로에 대해 접근하며 변동사항을 반영하고 업데이트된 DOM tree를 만들어낸다. 이렇게 만들어지는 DOM tree는 **workInProgress 트리**라고 한다. 다시금 강조하지만 **workInProgress 트리는 current가 가리키고 있지 않은 alternate의 rootFiber에서 만들어진다.**

```js
export function createWorkInProgress(current: Fiber, pendingProps: any): Fiber {
  let workInProgress = current.alternate;
  if (workInProgress === null) { 
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode,
    );
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    if (__DEV__) {
      workInProgress._debugID = current._debugID;
      workInProgress._debugSource = current._debugSource;
      workInProgress._debugOwner = current._debugOwner;
      workInProgress._debugHookTypes = current._debugHookTypes;
    }

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;

    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;

    if (enableProfilerTimer) {
      workInProgress.actualDuration = 0;
      workInProgress.actualStartTime = -1;
    }
  }

  workInProgress.flags = current.flags & StaticMask;
  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  const currentDependencies = current.dependencies;
  workInProgress.dependencies =
    currentDependencies === null
      ? null
      : {
          lanes: currentDependencies.lanes,
          firstContext: currentDependencies.firstContext,
        };

  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;

  if (enableProfilerTimer) {
    workInProgress.selfBaseDuration = current.selfBaseDuration;
    workInProgress.treeBaseDuration = current.treeBaseDuration;
  }

  if (__DEV__) {
    workInProgress._debugNeedsRemount = current._debugNeedsRemount;
    switch (workInProgress.tag) {
      case IndeterminateComponent:
      case FunctionComponent:
      case SimpleMemoComponent:
        workInProgress.type = resolveFunctionForHotReloading(current.type);
        break;
      case ClassComponent:
        workInProgress.type = resolveClassForHotReloading(current.type);
        break;
      case ForwardRef:
        workInProgress.type = resolveForwardRefForHotReloading(current.type);
        break;
      default:
        break;
    }
  }

  return workInProgress;
}
```

dfs(깊이우선탐색) 방식을 활용하여 새롭게 변동사항이 반영된 fiber와 기존의 fiber를 비교한 뒤, 바뀐 부분을 찾고 반영하고, 마지막에 root의 DOM 요소를 리턴하게 되면 새롭게 바꾸어야 할 부분을 반영한 DOM element를 가지게 된다.

변경사항이 모두 반영된 rootFiber의 DOM Element가 모두 만들어지고 나면, fiberRoot, 즉 createRoot로 만든 root 컨테이너 파이버의 current가 alternate의 rootFiber를 가리키게 한다. 해당 파이버는 새롭게 반영 및 DOM element 생성이 완료된 fiber이다. current의 포인터만을 alternate를 통해 반대편의 만들어진 rootFiber를 가리키도록 하면서 대기 없이 바로 업데이트가 반영된 DOM 트리를 갈아끼우는 것이다.

![](https://d2.naver.com/content/images/2023/07/14.gif)

이처럼 상태의 변경이나 다른 렌더링에 영향을 끼치는 상태가 변경이 됐을 경우에 재조정을 통해서 fiber를 업데이트하고 이를 DOM 요소에 반영하는 과정을 계속해서 반복하는 과정에서 rootFiber는 기존의 root container인 fiberRoot를 알아야 할 필요성이 있다. 자신이 해당 fiberRoot 안에서 렌더링 되어야 할 요소들의 정보를 담고 있기 때문이다.

전체적인 두 트리가 공존하면서 비교되고 만들어진 workInProgressfiber를 한 그림에 표현하면 아래와 같이 나오게 된다.
![](https://i.imgur.com/1EfuMA3.png)

## 첫 브라우저 렌더링까지의 과정 훑어보기
위에서 알아본 Fiber Node와 렌더링 방식에 대한 정보는 알았지만 막상 이 객체가 어떤 로직으로 렌더링을 수행하는 지는 아직도 감이 잡히지 않을 것이다.
따라서 우리는 소스 코드를 따라서 대략적인 첫 렌더링 과정을 알아볼 필요가 있다.

> 리액트의 렌더링은 브라우저가 렌더링에 필요한 DOM 트리를 만드는 과정을 의미한다

가장 처음 엔트리 포인트를 만드는 과정부터 첫 페이지가 만들어지기까지의 과정을 알아보자.

### 엔트리 포인트 만들기
```js
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```
react-dom의 공식문서에서는 createRoot라는 api를 통해 React에 의해 관리되는 UI의 root, 즉 React 컴포넌트를 표시하는 루트를 생성할 수 있다고 한다. 

코드를 보면 root라는 id를 가지는 element 자체를 루트로 삼고 여기에 React 컴포넌트들을 렌더링시키기 위해 지정하는 것으로 보인다.
React는 SPA(Single-Page-Application)이기 때문에 여러 페이지를 전환하는 것이 아닌, 하나의 페이지에서 모든 서비스 로직이 이루어지는 형태이며, 페이지 또한 새롭게 페이지 전환을 하는 방식이 아니다 보니까 하나의 `Index.html`만 두고 안쪽 요소만 바꾸어 가면서 렌더링을 하는 방식을 사용한다.

 따라서 React가 렌더링할 공간을 createRoot를 통해 만들고,  `createFiberRoot()`를 호출하여 고유한 `FiberRootNode`를 생성한다. 
```js
// Cyclic construction. This cheats the type system right now because
// stateNode is any.
const root = (new FiberRootNode(containerInfo, tag, hydrate): any); 

if (enableSuspenseCallback) {
	root.hydrationCallbacks = hydrationCallbacks; 
}

const uninitializedFiber = createHostRootFiber(  
  tag,
  isStrictMode,
  concurrentUpdatesByDefaultOverride,
);
root.current = uninitializedFiber;  
uninitializedFiber.stateNode = root;  
```

FiberRootNode 생성자로 만들어진 `FiberRootNode`는 컨테이너와 태그, 하이드레이션에 대한 정보를 가지고 있다.

하지만 `FiberRootNode`가 만들어지고 `createHostRootFiber()`를 통해 추가적으로 **HostRootFiber** 객체를 만들어  root(FiberRoot)의 current에 해당 fiber node를 할당하고, 추가적으로  `uninitializedFiber.stateNode` 라는 곳에 root를 다시 참조하도록 하면서 순환 참조 구조를 이루게 하는 모습을 볼 수 있다.

![](https://i.imgur.com/t5Nqgnq.png)


```js
root.render(<SimpleComp />);  
```

만들어지는 root에 대해서 render 메서드를 실행시키는 과정에서 JSX로 쓰여진 커스텀 컴포넌트는 babel의 트랜스파일러를 통해서 함수로 바뀌게 된다.

```js
root.render(React.createElement(SimpleComp, null)); 
```
트랜스파일된 js에서는 pragma로 createElement가 설정되어 있기 때문에createElement를 호출시켜 React Element라는 일반 객체를 만들어 반환하는 함수를 render함수에 콜백으로 넣는 듯한 형태를 띈다. 

>Pragma
>트랜스파일러나 컴파일러가 특정 코드를 해석하거나 처리할 때 특별한 지시를 내리기 위해 사용하는 주석 형식의 지시문

```jsx
// Transpiled <SimpleComp />
export function SimpleComp() {  
  const [name, setName] = React.useState("Alice");
  return React.createElement(
    "div",
    null,
    React.createElement("h1", null, "Hello react!"),
    React.createElement(
      "section",
      null,
      React.createElement("p", null, `Name : ${name}`),
      React.createElement(
        "button",
        { onClick: (e) => setName(name === "Samuel" ? "Alice" : "Samuel") },
        "Click me"
      )
    )
  );
}
```
참고로 pragma는 jsx에서 모든 dom 요소들에 대해 호출하는 형식으로 되어있기 때문에 계층 구조를 알 수 있다.
아무튼 함수형 커스텀 컴포넌트를 render함수가 콜백으로 가지고 있는 형태이다. 이 createElement를 통해 만들어지는 객체를 render함수를 통해 root에 넣어주는 작업이 수행된다.
```js
export function createElement(type, config, children) {
  let propName;
  // .....
  

  props[propName] = config[propName];
  // props 세팅
  
  key = '' + config.key;
  // key 세팅
  
  props.children = children;
  // childrent 세팅
  
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props,
  );
}
```
createElement는 이런 형식으로 되어 있는데, ReactElement를 반환하는 함수이다. 
일반 html element의 경우에는 jsx 트랜스파일링 과정에서
- type: html element 이름
- key : element의 key
- children: 하위 요소
를 가지게 되는데 , SingleComp와 같은 커스텀 컴포넌트와 같은 경우에는 위에서 봤다시피 함수형으로 되어있기 때문에 createElement 안에 SingleComp라는 함수를 반환하는 함수가 type에 들어가게 되고, render api를 통해 root에 SingleComp의 Element를 가지게 된다.

### 재조정(Reconcile)
앞에서 말했다시피 첫 렌더링 단계에서는 `root.render(<SingleComp/>)`를 실행하면 `SimpleComp` 라는 React Element만 생성하도록 한 뒤에 재조정 단계로 넘어간다.

Reconcilation 단계에서는 아까 만들었던 FiberRootNode에 대해서 `performUnitOfWork`함수를 실행시킨다.

> 위의 코드에서도 볼 수 있다시피 현재 FiberRoot는 uninitialized된 상태이다


```tsx
// [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1836-L1862)
function performUnitOfWork(unitOfWork: Fiber): void {  
  // The current, flushed, state of this fiber is the alternate. Ideally
  // nothing should rely on this, but relying on it here means that we don't
  // need an additional field on the work in progress.
  const current = unitOfWork.alternate;
  setCurrentDebugFiberInDEV(unitOfWork);

  let next;
  if (enableProfilerTimer && (unitOfWork.mode & ProfileMode) !== NoMode) {
    startProfilerTimer(unitOfWork);
    next = beginWork(current, unitOfWork, subtreeRenderLanes);
    stopProfilerTimerIfRunningAndRecordDelta(unitOfWork, true);
  } else {
    next = beginWork(current, unitOfWork, subtreeRenderLanes);
  }

  resetCurrentDebugFiberInDEV();
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    // If this doesn't spawn new work, complete the current work.
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }

  ReactCurrentOwner.current = null;
}
```
하지만 가장 먼저 나오는 것은 `current` 변수에 `unitOfWork.alternate` 에 할당하는 일인데, 아까 Fiber node의 alternate는 순환참조하고 있는 fiber에서 반대편의 DOM을 가리킨다고 이야기 했던 것을 기억할 것이다.

따라서 current 변수에 UnitOfWork(변경사항이 들어가있는 Fiber)의 alternate를 할당한 이유는 내가 현재 렌더링된 DOM이 아닌 반대편의 변경 사항을 반영한 DOM을 만든 다음에 이를 current로 교체하여 새로운 current로 만들기 위해 현재 작업할 Fiber 노드의 이전 작업 상태를 가져오는 것임을 알 수 있다.

다음 코드를 보면 해당 함수에서 `beginWork`와 `completeUnitOfWork` 함수가 반복적으로 실행되고 있는 구조임을 알 수 있다.
```js
// [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L3828-L3829)
function beginWork(  
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
...
    switch (workInProgress.tag) {
    ...
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderLanes);
...
}
```
beginWork는 fiber와 workInProgress라는 다른 fiber를 받는데, 
```js
    next = beginWork(current, unitOfWork, subtreeRenderLanes);
```
여기서 보면 인자로 받았던 current와 unitOfWork를 넣어주어 두 Fiber를 비교한 후에 변경사항을 반영한 DOM Element를 받는다

여기서
- current - 현재 렌더링된 DOM의 반대 DOM 트리의 파이버(곧 현재가 될 것이기 때문에 current에 할당)
- unitOfWork - 변경사항이 적용된 파이버
라는 점은 계속 기억해두자! 아니면 헷갈려서 나처럼 계속 헤맨다.

앞에서 말했듯이 react는 current라는 파이버 트리 workInProgress라는 파이버 트리, 두 가지 트리를 두고 계속해서 스위칭해가며 한쪽에서는 새롭게 변동사항이 반영된 workInProgress 트리를 만들고, 그 동안엔 current 트리를 보여주다가 workInProgress의 DOM이 모두 완성되면 이를 **current로 바꿔주기 때문**에 workInProgress Tree와 current Tree에 대해서 계속해서 인지하는 것이 중요하다.

아무튼 beginWork에서 해당 파이버가 HostRoot, 즉 렌더링 되어야 하는 요소들의 루트라면 update를 진행한다.
```js
// [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L1278-L1287)
function updateHostRoot(current, workInProgress, renderLanes) {  
  pushHostRootContext(workInProgress);

  if (current === null) {
    throw new Error('Should have a current fiber. This is a bug in React.');
  }

  const nextProps = workInProgress.pendingProps;
  const prevState = workInProgress.memoizedState;
  const prevChildren = prevState.element;
  cloneUpdateQueue(current, workInProgress);
  processUpdateQueue(workInProgress, nextProps, null, renderLanes);
...
}
```
update과정에서 변동사항을 가진 workInProgress 트리에서 필요한 pendingprops와 memoizedState를 가져오고, 업데이트를 진행한다.
여기서 updateQueue가 일어나는 이유는 여러 개의 상태가 업데이트 될 경우에 이러한 작업들을 계속 하나씩 처리하는 것보다 배치 처리하는 것이 효율적이기 때문에 queue를 활용하여 처리한다.

`beginwork`에서 이렇게 분기처리를 해서 각각 요소들에 대해서 알맞은 처리를 해주는 과정을 거치고, 기존 fiber 또한 계층 구조로 이루어져 있기 때문에 자식이 있다면 자식으로, 형제가 있다면 형제 fiber node로 옮겨가면서 똑같이 beginwork를 실행해준다. 이 과정에서 재귀적으로 호출이 일어나며, return 받는 시기는 해당 fiber node가 작업을 마치고 completeUnitOfWork를 실행했을 때이다.

- `beginWork`는 Fiber 트리의 **하위로 내려가면서** 자식 노드부터 작업을 처리
- 자식 노드의 작업이 끝나면 그 Fiber에서 다시 `completeUnitOfWork`가 실행되어, 작업이 상위로 완료되며 반환
- 이 과정에서 **재귀적 호출**이나 **순환적 처리**를 통해, 트리의 모든 노드에 대한 작업이 차례차례 처리

```tsx
function updateHostRoot(){  
...
    // [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L1306-L1307)
  const nextChildren = nextState.element;
  if (supportsHydration && prevState.isDehydrated) {
        ...
    } else {
        // [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L1397)
    // Root is not dehydrated. Either this is a client-only root, or it
    // already hydrated.
    resetHydrationState();
    if (nextChildren === prevChildren) {
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    }
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  }
```
시작의 beginWork에서 HostRoot를 발견하게 되면 fiber는 기존의 fiber tree를 가지고 와서 새롭게 반영될 사항들의 정보를 가지고 있는 fiber node 객체와 기존 객체를 함께 비교하여 변동된 사항을 반영하고, 조정하는 과정을 `reconcileChildren`이라는 함수를 통해 반영한다. 만약 바꿀 변동사항이 없다면 그대로 둔다. 

```js
// [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L288)
export function reconcileChildren(  
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes,
) {
  if (current === null) {
    // If this is a fresh new component that hasn't been rendered yet, we
    // won't update its child set by applying minimal side-effects. Instead,
    // we will add them all to the child before it gets rendered. That means
    // we can optimize this reconciliation pass by not tracking side-effects.
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes,
    );
  } else {
    // If the current child is the same as the work in progress, it means that
    // we haven't yet started any work on these children. Therefore, we use
    // the clone algorithm to create a copy of all the current children.

    // If we had any progressed work already, that is invalid at this point so
    // let's throw it out.
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes,
    );
  }
}

--> 

// [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactChildFiber.new.js#L1245-L1279)
// This API will tag the children with the side-effect of the reconciliation
// itself. They will be added to the side-effect list as we pass through the
// children and the parent.
function reconcileChildFibers(  
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any,
  lanes: Lanes,
): Fiber | null {
....
    // [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactChildFiber.new.js#L1269)
  // Handle object types
  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        return placeSingleChild(
          reconcileSingleElement(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes,
          ),
        );
...
}


-->


// [Link](https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactChildFiber.new.js#L1129)
function reconcileSingleElement(  
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: ReactElement,
    lanes: Lanes,
  ): Fiber {
    const key = element.key;
    let child = currentFirstChild;
    while (child !== null) {
            ...
    }

    if (element.type === REACT_FRAGMENT_TYPE) {
      const created = createFiberFromFragment(
        element.props.children,
        returnFiber.mode,
        lanes,
        element.key,
      );
      created.return = returnFiber;
      return created;
    } else {
            // [[Link]](https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactChildFiber.new.js#L1199)
      const created = createFiberFromElement(element, returnFiber.mode, lanes);
      created.ref = coerceRef(returnFiber, currentFirstChild, element);
      created.return = returnFiber;
      return created;
    }
  }

```
재조정 과정은 `reconcileChildren` -> `reconcileChildFibers` -> `reconcileSingleElement`이라는 일련의 과정을 통해 모든 Fiber에 대해 비교하고 재조정하는 과정을 거친다.

`reconcileChildren`의 경우는 기존 노드와 비교하여 변경 사항을 감지하고, 새롭게 Fiber 트리를 만들거나 갱신하는 등의 작업을 수행한다. 이 과정에서 내부에서 호출하는 `reconcileChildFibers`를 통해 자식 Fiber들을 비교하여 어떤 노드를 갱신, 추가 등의 작업을 할지 결정하고, reconcileSingleElement를 통해 단일 자식 요소를 비교하여 갱신이 됐을 경우 **새로운 fiber를 생성하거나 갱신이 필요없는 경우 기존의 fiber를 재활용한다**. 이 기존 업데이트가 없는 노드의 fiber에 대해서 재활용하는 과정을 통해 리액트는 작업을 효율적으로 관리할 수 있었다.


```js
// [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L849)
function completeWork(  
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
    ...
  switch (workInProgress.tag) {
        ...
      // [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L959)
    case HostComponent: {
            ...
            // 렌더링된 FiberNode가 있거나 `stateNode`에 DOM 인스턴스가 생성되었다면
      if (current !== null && workInProgress.stateNode != null) {
                // Update 로직
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps,
          rootContainerInstance,
        );
                ...
      } else {
                // 없다면 DOM 인스턴스 생성
                    ...
          const instance = createInstance(
            type,
            newProps,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          );

          appendAllChildren(instance, workInProgress, false, false);

          workInProgress.stateNode = instance;
                    ...
      return null;
    }
```
작업이 계속해서 깊이 우선 탐색으로 진행되면서 끝에 다다를 때면 다시 `completeWork`를 실행시키고 return시킨다. 예시로 든 최초 렌더링의 경우에는 `createInstance()`를 호출하여 DOM 인스턴스를 생성한다.

`createInstance()` 내부에서는 `react-dom` 렌더러에서 `document.createElement` web api를 이용하여 html element 인스턴스를 생성한다. 그리고 `appendAllChildren()`에서 child, 즉 `FiberNode.stateNode`를 생성된 DOM 인스턴스에 부착한다. 다시 말해 `completeWork`는 FiberNode로부터 DOM 인스턴스를 완성시키는 과정이다. 마지막에 모든 reconcile 작업이 완료되었을 때는 결국 갱신된 root fiber를 기반으로 재조정되는 하나의 루트 element가 만들어진다.

### Commit 단계
Reconcile 단계가 끝나면 DOM을 교체하기 위한 모든 준비는 끝이 났다. DOM element들도 모두 만들어진 상태이며, 해당 요소들은 갱신된 정보들을 기준으로 만들어진 요소들이다.
이 떄, RootComplete status가 되며 Commit 단계로 돌입하여 브라우저에 변경된 사항들이 보이도록 그리는 것이다.
```js
function finishConcurrentRender(root, exitStatus, lanes) {  
  switch (exitStatus) {
    ...
    case RootCompleted: {
      // The work completed. Ready to commit.
      commitRoot(
        root,
        workInProgressRootRecoverableErrors,
        workInProgressTransitions,
      );
      break;
    }
    default: {
      throw new Error('Unknown root exit status.');
    }
  }
}

function commitRoot(  
  root: FiberRoot,
  recoverableErrors: null | Array<CapturedValue<mixed>>,
  transitions: Array<Transition> | null,
) {
    ...
        // [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1976)
    commitRootImpl(
      root,
      recoverableErrors,
      transitions,
      previousUpdateLanePriority,
    );
    ...
}

function commitRootImpl(  
  root: FiberRoot,
  recoverableErrors: null | Array<CapturedValue<mixed>>,
  transitions: Array<Transition> | null,
  renderPriorityLevel: EventPriority,
) {
    ...
    // [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L2163)
    commitMutationEffects(root, finishedWork, lanes);
}

export function commitMutationEffects(  
  root: FiberRoot,
  finishedWork: Fiber,
  committedLanes: Lanes,
) {
    ...
    // [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberCommitWork.new.js#L2045)
  commitMutationEffectsOnFiber(finishedWork, root, committedLanes);
    ...
}
```
`finishConcurrentRender` -> `CommitRoot` -> `commitRootImpl` -> `commitMutationEffects` -> `commitMutationEffectsOnFiber`의 순서대로 안쪽으로 들어가면서 함수가 호출되고, 본격적으로 변경 내용을 커밋하기 시작한다.
```js
function commitMutationEffectsOnFiber(  
  finishedWork: Fiber,
  root: FiberRoot,
  lanes: Lanes,
) {
    ...
  // The effect flag should be checked *after* we refine the type of fiber,
  // because the fiber tag is more specific. An exception is any flag related
  // to reconcilation, because those can be set on all fiber types.
  switch (finishedWork.tag) {
        ...
        // [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberCommitWork.new.js#L2254-L2286)
    case HostRoot: {
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork);
    ...
}
```
`commitMutationEffectsOnFiber`에서는 가장 먼저 들어가는 요소가 fiberRoot가 될 것이므로 `recursivelyTraverseMutationEffects`를 통해 재귀적으로`commitMutationEffectsOnFiber`를 DFS 방식으로 호출하여 요소들을 만들어낸다
```js
function recursivelyTraverseMutationEffects(  
  root: FiberRoot,
  parentFiber: Fiber,
  lanes: Lanes,
) {
    ...
    // [[Link]](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberCommitWork.new.js#L2071-L2079)
  const prevDebugFiber = getCurrentDebugFiberInDEV();
  if (parentFiber.subtreeFlags & MutationMask) {
    let child = parentFiber.child;
    while (child !== null) {
      setCurrentDebugFiberInDEV(child);
      commitMutationEffectsOnFiber(child, root, lanes);
      child = child.sibling;
    }
  }
  setCurrentDebugFiberInDEV(prevDebugFiber);
}
```
더이상 child와 sibling을 돌고 난 후 child가 없어 탐색할 것들이 없어졌을 경우에는 다음으로 넘어가 `commitReconciliationEffects()`를 실행한다

```tsx
function commitReconciliationEffects(finishedWork: Fiber) {  
    ...
      commitPlacement(finishedWork);
    ...
}

function commitPlacement(finishedWork: Fiber): void {  
    ...
  // Recursively insert all host nodes into the parent.
  const parentFiber = getHostParentFiber(finishedWork);

  // Note: these two variables *must* always be updated together.
  switch (parentFiber.tag) {
        ...
    case HostRoot:
    case HostPortal: {
      const parent: Container = parentFiber.stateNode.containerInfo;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
      break;
    }
    ...
}
```
finishedWork 인자에는 작업이 끝난 Fiber가 들어오며, 이를 `commitPlacement()`를 통해서 tag의 분기문 중 HostRoot로 가게 되고`insertOrAppendPlacementNodeIntoContainer()`를 실행시킨다.

```js
function insertOrAppendPlacementNodeIntoContainer(  
  node: Fiber,
  before: ?Instance,
  parent: Container,
): void {
  const {tag} = node;
  const isHost = tag === HostComponent || tag === HostText;
  if (isHost) {
    const stateNode = node.stateNode;
    if (before) {
      insertInContainerBefore(parent, stateNode, before);
    } else {
      appendChildToContainer(parent, stateNode);
    }
  } else if (tag === HostPortal) {
    // If the insertion itself is a portal, then we don't want to traverse
    // down its children. Instead, we'll get insertions from each child in
    // the portal directly.
  } else {
    const child = node.child;
    if (child !== null) {
      insertOrAppendPlacementNodeIntoContainer(child, before, parent);
      let sibling = child.sibling;
      while (sibling !== null) {
        insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}
```
`insertOrAppendPlacementNodeIntoContainer`를 통해 만들어진 element가 fiber 정보를 가지고 알맞은 위치에 들어갈 수 있도록 DOM을 구성한다. 
완성된 DOM 트리의 경우에는 한번에 커밋되면서 실제 브라우저 상에서 변경 사항이 반영된 DOM 구성요소들이 그려져 볼 수 있는 상태가 비로소 된다.

```js
function commitRootImpl(  
  root: FiberRoot,
  recoverableErrors: null | Array<CapturedValue<mixed>>,
  transitions: Array<Transition> | null,
  renderPriorityLevel: EventPriority,
) {
    ...
    // The work-in-progress tree is now the current tree. This must come after
  // the mutation phase, so that the previous tree is still current during
  // componentWillUnmount, but before the layout phase, so that the finished
  // work is current during componentDidMount/Update.
  root.current = finishedWork;
}
```
commit이 모두 끝나면 root의 current를 finishedWork로 갱신하여 최신 변경사항을 반영한 rootFiber를 재할당시키면서 최신화시킨다.

update와 다른 hook과 같은 경우는 너무 길어져서 다음 화에 계속..
![](https://i.imgur.com/MtyQSoN.png)


---
react fiber의 존재는 알고 있었지만, 이번에 이렇게 소스코드를 뜯어가면서 딥다이브하고 어떤 식으로 동작하는지 알게 되면서 정말 많은 것들을 알게된 것 같다. 지피지기면 백전백승이라고, 리액트의 원리를 알게 되니 보다 hook과 같은 요소들을 보다 더 잘 쓸 수 있는 용기마저 생긴다..! 아무튼 이런 dfs와 방식으로 학습하는 것을 좋아하는 편이긴 한데, 이거 하나 쓰는데 지금 이해하고 쓰고 고치고를 반복하느라 하루 이상 쓴 것 같다. 적당히 밸런스를 맞춰 학습해야 할 필요성 또한 깨닫게 된 좋은 시간이었을지도...


### 참조
https://www.cnblogs.com/huayang1995/p/15910753.html
https://d2.naver.com/helloworld/2690975
https://m.blog.naver.com/dlaxodud2388/223195103660
https://www.youtube.com/watch?v=ZCuYPiUIONs&t=1463s
https://www.youtube.com/watch?v=0ympFIwQFJw