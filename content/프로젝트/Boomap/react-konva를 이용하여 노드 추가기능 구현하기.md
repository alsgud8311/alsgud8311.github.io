### 생성위치 알고리즘 정하기
#### 노드들의 평균 x,y값을 기준으로 계산하여 추가하기
```tsx

function averageLocation(children: number[], data: NodeData, parentNode?: Node) {
  if (!children.length) {
    return parentNode ? { x: parentNode.location.x + 30, y: parentNode.location.y + 30 } : { x: 0, y: 0 };
  }
  const x = children.reduce((acc, curr) => data[curr.toString()].location.x + acc, 0) / children.length;
  const y = children.reduce((acc, curr) => data[curr.toString()].location.y + acc, 0) / children.length;
  return { x, y };
}
```
만약 x,y값을 기준으로 좌표를 평균내어 추가하게 된다면, 처음엔 문제 없이 children들의 평균값을 내거나, 만약 children이 없을 경우에는 자식이 생길 예정인 부모 노드의 x,y좌표에서 30씩 떨어져서 생성될 수 있도록 했다.

하지만 해당 코드의 문제점은 만약 2개의 노드 사이에서 평균 x,y좌표를 구한 노드 1개가 생성된다고 할 때, 위치를 하나도 변경하지 않고 그대로 다시 추가를 누르면 평균값으로 나온 노드와 함께 평균을 다시 구하게 되므로 사실상 똑같은 평균 x,y좌표가 나올 수밖에 없다.

더 큰 문제는 내가 데이터를 상태로 다루고 있는데, 이 상태가 업데이트 될 때마다 데이터를 dependency array에 두고 useEffect로 충돌 방지를 실행시키고 있다는 사실이었다.
```tsx
useEffect(() => {
    checkCollision(layer, updateNode);
  }, [data]);
```
내 충돌 방지의 로직의 허점은 두 노드가 완벽하게 포개질 때, 서로 무한대로 x +축을 향해 움직인다는 점이었다.


#### 마지막 요소에서 수직벡터 구하기

```tsx
//vector.ts
export function verticalVector(a: Location, b: Location) {
  return { x: a.y - b.y, y: b.x - a.x };
}

export function unitVector(a: Location, b: Location) {
  const v = verticalVector(a, b);
  const vectorLength = Math.sqrt(v.x ** 2 + v.y ** 2);
  return { x: v.x / vectorLength, y: v.y / vectorLength };
}

//addNode.ts
function getNewNodePosition(children: number[], data: NodeData, parentNode: Node) {
  if (!children.length) {
    return parentNode ? { x: parentNode.location.x + 30, y: parentNode.location.y + 30 } : { x: 0, y: 0 };
  }
  const lastChildren = data[children[children.length - 1]];
  const uv = unitVector(parentNode.location, lastChildren.location);

  return {
    x: lastChildren.location.x + uv.x * 50,
    y: lastChildren.location.y + uv.y * 50,
  };
}
```
요소에서 수직벡터를 구하는 공식은 기존 벡터를 구하는 공식에서 반대로 해서 x,y좌표를


두 점 $A(x_1, y_1)$와 $B(x_2, y_2)$가 있을 때, 벡터 $\vec{AB}$는 
$\vec{AB} = (x_2 - x_1, y_2 - y_1)$
의 공식으로 구할 수 있다.

하지만 우리가 구하는 것은 벡터에 대해 수작으로 그어지는 수직벡터를 구해 수직벡터 방향에서 내가 원하는 정도만큼 떨어진 거리를 만들어내는 것이므로, 수직벡터의 공식을 활용하여 구해야 한다.

벡터 $\vec{V} = (x, y)$의 수직 벡터는 두 가지 방향으로 구할 수 있는데, **시계방향**으로의 수직벡터와 **반시계방향**으로의 수직벡터이다. 시계 방향의 경우 $\vec{V}_\perp = (-y, x)$로 계산할 수 있으며, 반시계방향의 경우는 $\vec{V}_\perp = (y, -x)$의 공식으로 계산이 가능하다.
하지만 우리 프로젝트의 경우 처음 초기 데이터 생성 과정에서 만약에 ai를 통해 회의록을 업로드하고 여기서 키워드를 뽑아내어 마인드맵을 만든다고 할 때, 생성되는 키워드 노드들은 각각 시계방향으로 돌아가면서 생성되는 규칙을 가지고 있기 때문에 새롭게 만드는 하위 생성 노드의 경우도 시계방향으로 구하기로 했다.



### JavaScript/TypeScript 코드 예시

```typescript

// 두 점 사이의 벡터 구하기
export function vector(a: Location, b: Location) {
  return { x: b.x - a.x, y: b.y - a.y };
}

// 벡터의 수직 벡터 구하기
export function perpendicularVector(v: { x: number; y: number }, clockwise: boolean = true) {
  return clockwise ? { x: -v.y, y: v.x } : { x: v.y, y: -v.x };
}
```

- `vector` 함수는 두 점 `a`와 `b` 사이의 벡터를 반환합니다.
- `perpendicularVector` 함수는 주어진 벡터 `v`에 대해 `clockwise` 파라미터에 따라 시계 방향 또는 반시계 방향으로 회전된 수직 벡터를 반환합니다.