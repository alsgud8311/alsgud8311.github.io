```tsx
import { Node } from "@/types/Node";
import { useEffect, useState } from "react";
import { Circle, Group, Layer, Line, Stage, Text } from "react-konva";

type NodeProps = {
  x: number;
  y: number;
  depth: number;
  text: string;
  setNodeLocation?: any;
};

function NodeComponent({ x, y, depth, text, setNodeLocation }: NodeProps) {
  return (
    <Group>
      <Circle
        draggable
        x={x}
        y={y}
        fill={"white"}
        radius={50 - depth * 5}
        stroke="black"
        strokeWidth={3}
        onDragMove={(e) => {
          setNodeLocation({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDragEnd={(e) =>
          setNodeLocation({
            x: e.target.x(),
            y: e.target.y(),
          })
        }
      />
      <Text text={text} x={x - 20} y={y - 10} />
    </Group>
  );
}

type DrawNodeProps = {
  root: Node;
  x: number;
  y: number;
  depth?: number;
  parentPosition?: any;
  update?: () => void;
};

export function DrawNodefromData({ root, x, y, depth = 0, parentPosition, update }: DrawNodeProps) {
  const [nodeLocation, setNodeLocation] = useState(root.location);
  const nodeSpacing = 150;
  useEffect(() => {
    console.log(nodeLocation);
  }, [nodeLocation]);
  return (
    <>
      {parentPosition && (
        <Line
          points={[parentPosition.x, parentPosition.y, nodeLocation.x, nodeLocation.y]}
          stroke="gray"
          strokeWidth={2}
        />
      )}
      <NodeComponent
        x={nodeLocation.x}
        y={nodeLocation.y}
        text={root.content}
        depth={depth}
        setNodeLocation={setNodeLocation}
      />
      {root.children?.map((childNode, index) => (
        <DrawNodefromData
          key={childNode.id}
          root={childNode}
          x={nodeLocation.x + (index - root.children!.length / 2) * nodeSpacing}
          y={nodeLocation.y + nodeSpacing}
          depth={depth + 1}
          parentPosition={nodeLocation}
          update={update}
        />
      ))}
    </>
  );
}

```

Line 함수형 컴포넌트는 points에 배열을 인자로 받음

인자에는 `[시작점x,시작점y, 끝점x, 끝점y]` 가 들어감. 그럼 그대로 그 두 요소의 x,y 좌표 사이에 선을 그어줌

state로 관리하고 있는 노드를 해당 인자의 값에 넣어주어 상태가 변할 때, 즉 x,y 좌표가 움직일 때 setter함수가 실행되는데 그 때마다 렌더링이 이루어지기 때문에 선은 이 x,y좌표에 따라 움직이게 됨

### 문제1 : 원 안의 선

![](https://i.imgur.com/c5Bekmc.png)


하지만 끝점, 만약 대분류-중분류-소분류로 이루어져 있는 마인드 맵에서 선을 이을 때, 끝점이 가르키는 x,y 좌표의 경우에는 원이 위로 가서 선이 보이지 않는 형태가 되지만 시작하는 점의 x,y좌표에서는 앞으로 와서 원의 중심저메에서 뻗어나가는 형태가 되어버림

z-index를 주고 노드가 위로 올라가게 할 수도 있지만, 이는 정상적인 해결 방식이 아닌 임시 방편에 불과하다고 생각한다.

따라서 다른 방식으로 노드를 이어보려고 하는데, 문제는 원 안에 있는 노드를 어떻게 잘라내느냐였다.

현재 내가 알고 있는 정보는 시작점으로 되어 있는 점과 끝점이다. 이 점 사이의 거리를 이용하여 시작점에서 끝점으로 이어지는 선이 그어졌다고 가정했을 때, 이어져 있는 두 노드 간의 선에서 시작점의 선이 노드를 빠져나올 때의 가장자리가 가지는 x,y 값을 알 수 있을 것 같았다.

1. **벡터 구하기**:
    
    시작 점의 좌표가 xc, yc이고, 이를 이어주려는 끝점의 좌표가 xp,yp라고 하자. 먼저, 원의 중심으로 향하는 방향을 나타내는 벡터를 구할 수 있다. 이 벡터는 임의의 점과 원의 중심 사이의 차이로 계산할 수 있다
    
    $$ \text{벡터} = (x_p - x_c, y_p - y_c) $$
    
2. **벡터의 길이 구하기**:
    
    $$ 벡터 길이=(x_p−x_c)2+(y_p−y_c)2 $$
    
    이제 이 벡터의 길이를 구해 방향을 정규화한다. 여기까지는 피타고라스의 정리를 통해 쉽게 구할 수 있다.
    
    $$ \text{벡터 길이} = \sqrt{(x_p - x_c)^2 + (y_p - y_c)^2} $$
    
3. **단위 벡터 구하기**
    
    벡터를 **단위 벡터**로 정규화하여 방향만 남기고 크기를 1로 만듭니다. 단위 벡터를 구하려면 원래 벡터의 각 성분을 벡터의 길이로 나눈다
    
    $$ \text{단위 벡터} = \left(\frac{x_p - x_c}{\text{벡터 길이}}, \frac{y_p - y_c}{\text{벡터 길이}}\right) $$
    
4. **가장자리 좌표 구하기**
    
    단위 벡터 방향으로 반지름만큼 이동하면, 원의 가장자리 좌표를 구할 수 있습니다. 원의 중심점에 단위 벡터의 성분을 각각 반지름 r만큼 곱해서 더하면 된다.
    
    $$ x_{\text{edge}} = x_c + r \times \frac{x_p - x_c}{\text{벡터 길이}} $$
    
    $$ y_{\text{edge}} = y_c + r \times \frac{y_p - y_c}{\text{벡터 길이}} $$
    

### 함수화 하기

```tsx
// from 원의 중점에서 to 원의 중점으로 이어지는 선에서 from 선의 위치를 원의 중점이 아닌 가장자리의 위치 구하는 함수
function getCircleEdgePoint(from: Location, to: Location, r: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  const vector = Math.sqrt(dx * dx + dy * dy);

  const xEdgePoint = Math.ceil(from.x + (r * dx) / vector);
  const yEdgePoint = Math.ceil(from.y + (r * dy) / vector);

  return {
    xEdgePoint,
    yEdgePoint,
  };
}
```

해당 함수를 통해 벡터 길이를 구하고, 반지름에 단위 벡터를 곱하여 가장자리가 어떤 좌표인지 x,y 각각의 좌표에 더해주어 곱했다.

```tsx
// Point의 인자로 만들어주는 함수
// 각각의 원에 대해서 가장자리 쪽으로 갈 수 있게끔 해줌
function getLinePoints(from: Location, to: Location, r: number) {
  const fromCircleEdgePoint = getCircleEdgePoint(from, to, r);
  const toCircleEdgePoint = getCircleEdgePoint(to, from, r);
  return [
    fromCircleEdgePoint.xEdgePoint,
    fromCircleEdgePoint.yEdgePoint,
    toCircleEdgePoint.xEdgePoint,
    toCircleEdgePoint.yEdgePoint,
  ];
}

type ConnectedLineProps = {
  from: Location;
  to: Location;
  radius: number;
};

export function ConnectedLine({ from, to, radius }: ConnectedLineProps) {
  return <Line points={getLinePoints(from, to, radius)} stroke="gray" strokeWidth={2} />;
}
```

기존의 Line을 계속 활용하면서도 여기서 이어지는 선에 대해 원의 중점이 아닌, 각 원에서 뻗어나온 가장자리의 좌표로 선을 잇는 것이 이상적이기 때문에 이를 함수화했다.

points 인자에 들어갈 값은 from과 to의 원 가장자리 좌표를 구해야 하는데, `getCircleEdgePoint`는 단일책임원칙을 지키기 위해 함수를 분리하여 한 원의 가장자리 좌표를 구하는 함수로 만들었다.  따라서 `getLinePoints`라는 함수를 따로 만들어 인자로 그대로 넣을 수 있는 함수로 활용할 수 있도록 하였다.

### 문제2: 선 사이 띄워진 거리가 다르다

![](https://i.imgur.com/Ymf6Gep.png)
어딘가 미묘하게 두 선이 어느정도 띄워져있는지가 다른 것 같다..
```tsx
// from 원의 중점에서 to 원의 중점으로 이어지는 선에서 from 선의 위치를 원의 중점이 아닌 가장자리의 위치 구하는 함수
function getCircleEdgePoint(from: Location, to: Location, r: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  const vector = Math.sqrt(dx * dx + dy * dy);

  const xEdgePoint = Math.ceil(from.x + (r * dx) / vector);
  const yEdgePoint = Math.ceil(from.y + (r * dy) / vector);

  return {
    xEdgePoint,
    yEdgePoint,
  };
}
```
코드를 살펴보며 생각해보니 나는 현재 분류에 따라서 하위 요소의 경우 depth를 조금씩 줄이고 있었는데, 더 작아지거나 커지는 선의 경우에는 사실상 from의 반지름을 가지고 계산했기 때문에 더 커졌던 문제를 가져온 것으로 보인다.
```ts
// Point의 인자로 만들어주는 함수
// 각각의 원에 대해서 가장자리 쪽으로 갈 수 있게끔 해줌
export function getLinePoints(from: Location, to: Location, r: number) {
  const fromCircleEdgePoint = getCircleEdgePoint(from, to, r);
  const toCircleEdgePoint = getCircleEdgePoint(to, from, r);
  return [
    fromCircleEdgePoint.xEdgePoint,
    fromCircleEdgePoint.yEdgePoint,
    toCircleEdgePoint.xEdgePoint,
    toCircleEdgePoint.yEdgePoint,
  ];
}
```
그러므로 고쳐야 할 것은 여기였던 것이다. from의 원이 가지는 원의 반지름과 to 원이 가지는 원의 반지름을 모두 받아야 했다.

```tsx
//depth가 70 - depth * 10 이라고 할 때
<ConnectedLine
          from={parentPosition}
          to={nodeLocation}
          fromRadius={70 - (depth - 1) * 10 + 10}
          toRadius={70 - depth * 10 + 10}
        />
```
그렇게 되면 이런 식으로 두 원의 반지름을 모두 받고
```ts
export function getLinePoints(from: Location, to: Location, fromRadius: number, toRadius: number) {
  const fromCircleEdgePoint = getCircleEdgePoint(from, to, fromRadius);
  const toCircleEdgePoint = getCircleEdgePoint(to, from, toRadius);
  return [
    fromCircleEdgePoint.xEdgePoint,
    fromCircleEdgePoint.yEdgePoint,
    toCircleEdgePoint.xEdgePoint,
    toCircleEdgePoint.yEdgePoint,
  ];
}
```
계산 과정에서 각각의 반지름을 넣어주어 각각의 원에서 가장자리 좌표를 구할 수 있도록 해 주었다.

### 문제3: 사회적 거리두기

![](https://i.imgur.com/aYk7867.png)
어어... 그만..

![](https://i.imgur.com/Y2MWzT2.png)

넘어가버리기~

내가 기대한 것은 선이 서로에게 어느정도 가까이 닿거나 교집합이 생기기 시작하면 둘을 잇는 선이 생기지 않는 것이었다.

하지만 이를 고려하지 않고 둘의 좌표를 무조건 계산하여 선을 그리다 보니 원이 근접했을 대에 원이 안쪽으로 파고드는 문제를 가지게 되었다.
나중에 충돌 방지를 넣는다면 이러한 문제는 어느정도 해소될 수 있지만, 나중에 예상치 못한 오류를 낳을 수도 있기 때문에 이러한 점도 고려하여 선을 그려야겠다 싶었다.

```ts
// from 원의 중점에서 to 원의 중점으로 이어지는 선에서 from 선의 위치를 원의 중점이 아닌 가장자리의 위치 구하는 함수
export function getCircleEdgePoint(from: Location, to: Location, fromRadius: number, toRadius: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  const vector = Math.sqrt(dx * dx + dy * dy);
  if (fromRadius + toRadius - vector > 0) {
    return {
      xEdgePoint: 0,
      yEdgePoint: 0,
    };
  }

  const xEdgePoint = Math.ceil(from.x + (fromRadius * dx) / vector);
  const yEdgePoint = Math.ceil(from.y + (fromRadius * dy) / vector);

  return {
    xEdgePoint,
    yEdgePoint,
  };
}
```
기존에 가장자리 구하는 함수에서도 그냥 `fromRadius`와 `toRadius` 를 둘 다 받은 다음에, 만약 두 원의 반지름을 더한 것이 벡터보다 커지게 된다면 이는 최대한 근접해있다는 사실을 알 수 있기 때문에 이런 경우 x좌표와 y좌표를 모두 0으로 줌으로써 라인이 생성되지 않도록 했다.