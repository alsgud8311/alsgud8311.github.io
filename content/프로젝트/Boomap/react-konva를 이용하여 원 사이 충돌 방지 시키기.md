이번에 마인드맵을 react-konva로 구현하는 과정을 거치면서 마인드맵의 각 노드 간에 충돌을 방지시키지 않으면 여러 요소들이 겹쳐져 있는 상태가 나올 것이기 때문에, 이러한 충돌을 방지하고자 이에 관련되어 로직을 보강하기로 했다.
## 기본적인 Node의 정보
```tsx
type NodeProps = {
  parentNode?: Node;
  node: Node;
  depth: number;
  text: string;
  updateNode: (id: number, updatedNode: Node) => void;
};

function NodeComponent({ parentNode, node, depth, text, updateNode }: NodeProps) {
  return (
    <>
      <Circle
        id={node.id.toString()}
        onDragMove={(e) => {
          updateNode(node.id, {
            ...node,
            location: {
              x: e.target.x(),
              y: e.target.y(),
            },
          });
        }}
        onDragEnd={(e) =>
          updateNode(node.id, {
            ...node,
            location: {
              x: e.target.x(),
              y: e.target.y(),
            },
          })
        }
        draggable
        x={node.location.x}
        y={node.location.y}
        fill={"white"}
        width={100}
        height={100}
        radius={70 - depth * 10}
        stroke="black"
        strokeWidth={3}
      />
      <Text name="text" text={text} x={node.location.x - 20} y={node.location.y - 10} />
      {parentNode && (
        <ConnectedLine
          from={parentNode.location}
          to={node.location}
          fromRadius={70 - (depth - 1) * 10 + 10}
          toRadius={70 - depth * 10 + 10}
        />
      )}
    </>
  );
}
```
기본적인 노드의 정보는 이러하다. 만약 노드 간에 부모-자식 관계가 있다면 이런 식으로 react-konva의 `Line`을 커스텀한 `ConnectedLine`이라는 컴포넌트를 추가적으로 렌더링 하도록 했다.

추가적으로 각 노드에는 `dragmove`와 `dragend` 이벤트를 달아서 해당 요소를 드래그 앤 드롭 시에 계속해서 상태를 바꾸면서 노드의 위치를 갱신할 수 있도록 했다.

```tsx
export type Node = {
  id: number;
  keyword: string;
  depth: number;
  location: Location;
  children: number[] | [];
};


type DrawNodeProps = {
  data: Node[];
  root: Node;
  depth?: number;
  parentNode?: any;
  update?: (id: number, node: Node) => void;
};

export function DrawNodefromData({ data, root, depth = 0, parentNode, update }: DrawNodeProps) {
  return (
    <>
      {/* from */}
      <NodeComponent text={root.keyword} depth={depth} parentNode={parentNode} node={root} updateNode={update} />
      {/* to */}
      {root.children?.map((childNode, index) => (
        <DrawNodefromData
          data={data}
          key={index}
          root={data[childNode - 1]}
          depth={depth + 1}
          parentNode={root}
          update={update}
        />
      ))}
    </>
  );
}
```
노드의 부모-자식을 렌더링하는 방식은 위와 같다. 모든 노드는 직렬화 되어있는 상태이고, children에는 노드의 id만을 가지고 있다.
노드의 id는 index를 1부터 시작하여 만들었기 때문에 계속해서 서브트리의 루트로 가게 될 때에는 `root`를 id값에서 1을 빼어 인덱스로 접근할 수 있도록 하였다.

## 충돌 해결하기
그렇다면 이 노드 사이에서 어떻게 충돌할 때의 문제를 해결할 수 있을까?
내가 생각했을 때 가장 기본적인 해결 방식은 **'충돌이 됐을 때, 충돌당한 노드를 겹치지 않도록 밀어낸다'** 였다. 그렇기 때문에, 나는 충돌한 각도를 어느정도 알고 있고, 밀어낼 때마다 각 원이 가져야 하는 최소 사이의 길이만 정한다면 이를 통해 리렌더링 과정에서 노드들을 피하게 할 수 있을 것 같았다.

### Layer에 이벤트 달기
```tsx
//...
const layer = useRef(null);

useEffect(() => {
    layer.current.on("dragmove", (event) => checkCollision(layer, event, updateNodeList));
  }, []);
```
가장 먼저 필요한 것은 layer에 이벤트를 다는 일이다. 

`react-konva`에서는 `useRef`를 layer에 달게 되면 layer 안의 모든 요소들이 jsx와 같은 요소처럼 접근할 수 있기 때문에, children에도 접근할 수 있다. 

가장 처음에 생각한 방식은 무조건 맨 처음에 어떤 요소를 드래그해서 옮기기 시작하면 옮기는 이벤트가 발동될 때마다 layer 안에 있는 children들에 대해 모두 collision을 확인하고, 드래그하고 있는 요소들과 충돌하는 노드가 있는지 확인을 해야 했다.


### 충돌 검사하기
```tsx
export function checkCollision(layer, event, update) {
  const dragTarget = event.target;
  const dragTargetRect = event.target.getClientRect();
  layer.current.children.forEach((child) => {
    if (
      !(child.attrs.name === "text") &&
      !(child.attrs.name === "line") &&
      isCollided(child, dragTarget, dragTargetRect)
    ) {
      const newPosition = moveOnCollision(child, dragTarget);
      update(parseInt(child.attrs.id), { location: newPosition });
    }
  });
}
```
`dragmove` 이벤트가 발동될 때마다 해당 `checkCollision` 함수가 실행된다. 이벤트가 발동되면서 해당 함수에 이벤트 객체를 그대로 넘겨주어 이 함수에서 확인할 수 있도록 해주었다.
`dragTarget`의 경우, 현재 드래그 하고 있는 `Target`의 객체를 넘겨준다. 
`event` 객체의 `target` property에서 `getClientRect` 메서드는 해당 요소가 가지고 있는 크기범위를 직사각형 형태로 나타내준다.

![](https://i.imgur.com/6luPbOC.png)
요런 식으로 각도가 있는 요소들도 전부 직사각형의 범위로 측정한 값을 보내준다. 대부분 충돌 감지를 할 때는 위와 같이 충돌이라고 할 수 있는 범위를 직사각형 형태로 측정하여 감지하는 것으로 보았기 때문에 나 또한 이를 기준으로 측정했다. `getClientRect()`를 실행한 값을 `dragTargetRect`에 할당하였다.

```tsx
layer.current.children.forEach((child) => {
    if (
      !(child.attrs.name === "text") &&
      !(child.attrs.name === "line") &&
      isCollided(child, dragTarget, dragTargetRect)
```
다음으로는 layer의 children에 접근하여 각각의 요소에 대해서 모두 해당 요소가 현재 드래그하고 있는 요소와 충돌되는지를 검사하도록 했다.

여기서 `!(child.attrs.name === "text") && !(child.attrs.name === "line")`가 들어간 이유는 layer의 children 안에는 비단 Circle 객체만 있는 것이 아닌, 같은 depth에 text와 line을 두었기 때문이다. 그렇게 되면 text와 line에 대해서도 충돌 감지를 하기 때문에 예상치 못한 부수효과를 가져올 수 있어 원에 대해서만 충돌 감지를 할 수 있도록 했다.

```tsx
export function isCollided(node, target, targetRect) {
  if (node === target) return false;
  return haveIntersection(node.getClientRect(), targetRect);
}

function haveIntersection(r1, r2) {
  return !(r2.x > r1.x + r1.width || r2.x + r2.width < r1.x || r2.y > r1.y + r1.height || r2.y + r2.height < r1.y);
}
```
충돌을 감지하는 로직은 생각보다 어렵지 않다. 드래그 하고 있는 요소를 제외시키기만 하고, 나머지는 x,y 좌표가 서로 겹치는지만 검사하면 된다.
두 개의 원 `r1`,`r2`가 있다고 할 때, 각각의 요소에 대해서 x,y 좌표를 모두 충돌되어 있는지 검사하는 조건문을 넣었다.

### 충돌된 노드 이동시키기
만약 충돌 검사 조건문에서 충돌이 되었다고 판단이 되면, 조건문 블록으로 넘어가 노드를 이동시키는 로직을 실행한다.
```tsx
 const newPosition = moveOnCollision(child, dragTarget);
      update(parseInt(child.attrs.id), { location: newPosition });
```
`moveOnCollision`은 충돌된 요소가 가야 할 x,y좌표를 계산하는 함수이다. 이 함수의 결과를 `newPosition`에 할당하고 해당 좌표를 상태 업데이트 시켜주어 리렌더링이 바로 일어나면서 위치가 업데이트된다.

```tsx
function moveOnCollision(targetNode, draggedNode) {
  const dx = targetNode.attrs.x - draggedNode.attrs.x;
  const dy = targetNode.attrs.y - draggedNode.attrs.y;
  const angle = Math.atan2(dy, dx);

  const minDistance = 5;

  const moveX = Math.cos(angle) * minDistance;
  const moveY = Math.sin(angle) * minDistance;

  return {
    x: targetNode.attrs.x + moveX,
    y: targetNode.attrs.y + moveY,
  };
}
```
`moveOnCollision`은 충돌이 된`targetNode`와 충돌을 시킨`draggedNode`를 인자로 받는다. 각 객체에는 내가 `attribute`로 넘겼던 x,y,radius 등의 정보가 `attrs`에 담겨 있으므로 여기에 접근하여 값을 계산한다.

`dx,dy`는 두 점 사이의 거리를 x,y좌표로 계산한 값이다. 먼저 두 점을 잇는 선을 빗변으로 직각삼각형을 그린 뒤, 역탄젠트를 통해서 각도를 구해야 하기 때문이다.

 `Math.atan2`는 아크탄젠트, 즉 역탄젠트를 구하는 Math 모듈의 함수이다.
 [역탄젠트 알아보기](https://ko.khanacademy.org/math/geometry/hs-geo-trig/hs-geo-solve-for-an-angle/a/inverse-trig-functions-intro)
 
 아크탄젠트를 구했다면 해당 각도가 곧 충돌했을 때의 방향을 나타내는 각도이며, 라디안 값으로 나타난다. 
 이 각도에 x축의 경우 `Math.cos`, y축의 경우 `Math.sin`을 이용하여 각도 값을 x,y축 성분으로 변환하여 해당 방향으로 `minDistance`만큼 가도록 했다.
 
 이 부분의 계산은 `sin(angle) = a/c, cos(angle) = b/c` 인 것을 생각했을 때, minDistance가 c로 간다고 생각했더니 이해가 나름 편했다(사실 아직도 잘 모름)
 
 아무튼 여기서 `minDistance`는 두 원 사이에 어느 정도의 거리가 있어야 하는지를 나타내는 변수이며, 이를 각 사인(아크탄젠트값), 코사인(아크탄젠트값)에 곱해주면 x,y 축을 어느정도 옮겨야 하는지 알 수 있다.
마지막에는 기존 요소의 x,y 좌표에 이동해야 할 x,y의 값만큼을 더해주었다.

그렇게 `moveOnCollistion`은 충돌이 일어난 요소들에 대해서 피할 수 있는 좌표 값을 주고, 이를 `update(parseInt(child.attrs.id), { location: newPosition });`를 통해서 업데이트 함으로서 노드의 상태를 다시금 업데이트하고 리렌더링이 일어나면서 캔버스에 반영된다.

## 문제
### 타겟과 충돌한 노드에만 충돌방지 적용
내가 생각했던 로직의 경우 이벤트가 일어난 타겟, 즉 해당 노드에서 다른 모든 노드들을 검색하고 현재 드래그 하고 있는 노드 객체와 충돌되는 다른 노드들에 대해서 충돌을 방지할 수 있도록 했다.
하지만 그럴 경우, 해당 노드와 충돌하는 경우만을 검색하기 때문에 사실상 충돌로 인해 움직인 노드가 움직이게 된다면, 사실상 움직인 노드가 다른 요소들과 충돌할 경우에 대해서는 고려하지 않았기 때문에 이 경우 움직인 노드가 다른 노드와 충돌하는 예외가 생기게 된다.
![[화면 기록 2024-11-10 오후 11.20.13.mov]]
이런 식으로 충돌된 요소들끼리의 충돌은 적용하지 않는다.
