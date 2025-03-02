# 이진 탐색 트리(BST, Binary Search Tree)
# 이진 탐색 트리란?

이진 탐색 트리(Binary Search Tree)는 **이진 트리** 기반의 탐색을 위한 자료구조이다.
이진탐색트리는 
1. 자식 노드가 2개 이하 여야만 함
2. 모든 원소의 키가 유일한 키
3. 왼쪽 서브 트리 키들은 루트 키보다 작음
4. 오른쪽 서브 트리의 키들은 루트의 키보다 큼
5. 왼쪽, 오른쪽 서브 트리의 하위 트리도 이진 탐색 트리이다
의 조건을 지닌다.

작은 것들은 왼쪽에 두고 큰 것들을 항상 오른쪽에 두어 정렬하는 방식의 트리는 선형적이지 않고 탐색이 매우 빠르게 이루어질 수 있다.

## 구현

```js
class Node {
  constructor(val) {
    //해당 노드의 값
    this.val = val;
    // 왼쪽 트리를 가르키는 포인터
    this.left = null;
    // 오른쪽 트리를 가르키는 포인터
    this.right = null;
  }
}
class BinarySearchTree {
  constructor() {
    this.root = null;
  }
  // 루트에서부터 내려가면서 새로운 노드가 들어갈 자리를 찾고 삽입하는 insert 메서드
  insert(val) {
    //새로운 노드 생성
    var newNode = new Node(val);
    //루트가 없을 때(아무 노드도 없을 떄) -> 새로 들어온 값을 루트로 설정
    if (!this.root) {
      this.root = newNode;
      return this;
    }
    // 그렇지 않은 경우 -> 값이 들어갈 적절한 자리를 찾아 탐색
    else {
      // 시작점에서부터 나아가는 방향을 나타내는 current 변수
      var current = this.root;
      while (true) {
        // 무한루프에 빠지지 않기 위해 탈출조건 명시
        if (val === current.val) return undefined;
        // 들어오는 값이 현재 값보다 작을 때 -> 왼쪽으로 이동
        if (val < current.val) {
          // 왼쪽 자식 노드가 더이상 없을 경우 들어갈 자리까지 탐색이 완료된 경우이므로 해당 값을 삽입
          if (current.left === null) {
            current.left = newNode;
            return this;
          }
          // 그렇지 않을 경우(노드가 있을 경우)
          else {
            current = current.left;
          }
          //value값이 현재 가리키고 있는 노드의 val보다 클 경우 -> 오른쪽으로 이동
        } else if (val > current.val) {
          // 오른쪽 자식 노드가 더이상 없을 경우 들어갈 자리까지 탐색이 완료된 경우이므로 해당 값을 삽입
          if (current.right === null) {
            current.right = newNode;
            return this;
          } else {
            current = current.right;
          }
        }
      }
    }
  }
  // val값에 해당하는 노드를 트리에서 찾는 contains 메서드
  contains(val) {
    // 트리에 노드가 아무것도 없을 경우 false 리턴
    if (!this.root) return false;
    // 루트에서부터 노드를 옮겨가면서 탐색할 current 변수를 만들고 루트를 가리키도록 함
    var current = this.root,
      // found 변수의 경우 루프문에서 빠져나오기 위한 조건
      found = false;
    // 더 갈 수 있는 노드가 있고 아직 값을 찾지 못했을 동안 반복
    while (current && !found) {
      // 찾는 값이 현재 값보다 작을 경우 왼쪽 트리로 이동
      if (val < current.val) {
        current = current.left;
      }
      // 찾는 값이 현재 값보다 클 경우 오른쪽 트리로 이동
      else if (val > current.val) {
        current = current.right;
      }
      // 나머지 경우는 val === current.val일 경우기 때문에 찾은 경우라 true를 리턴
      else {
        return true;
      }
    }
    // 못 찾았을 경우 false 리턴
    return false;
  }
}

```

## 시간복잡도
| 연산  | 시간복잡도     |
| --- | --------- |
| 삽입  | $O(logn)$ |
| 탐색  | $O(logn)$ |
최고와 평균적인 경우 모두 $log n$의 시간이 걸린다.
이진 트리의 노드의 개수는 아래의 트리로 내려갈 수록 2배씩 거듭제곱으로 증가한다. 1,2,4,8,16... 이렇게 기하급수적으로 늘어나는 $2^n$ 개의 노드와는 반대로 트리의 높이는 하나씩만 깊어진다.
여기서 탐색 혹은 연산을 할 때 우리는 루트에서부터 밑으로 내려가면서 작을 경우/클 경우 두 경우로만 나뉘어 밑으로 내려가기 때문에 비교가 쉬우면서도 2의 거듭제곱인 노드의 수에 비해서 트리의 높이인 $log n$만큼만 비교하면 되므로 시간복잡도가 매우 빠르다.

하지만 최악의 경우를 다룰 경우에는 반드시 $O(log n)$을 가지지 않을 수도 있다. **어떤 이진 탐색 트리의 구성을 가지냐**에 따라서도 시간이 달라질 수 있기 때문이다.

![](https://i.imgur.com/BI6TOmc.png)

이러한 이진 트리는 이진 트리의 성격을 갖추면서도 일자로 뻗어나가는 형태를 지니고 있기 때문에 탐색/삽입이 선형적인 시간만큼 걸릴 수밖에 없다. 
따라서 이진 탐색 트리라고 하더라도 구성에 따라 시간복잡도가 달라질 수 있으므로 주의해야 한다.
