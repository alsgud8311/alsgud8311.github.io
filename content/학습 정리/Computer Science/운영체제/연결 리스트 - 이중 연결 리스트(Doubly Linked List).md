# 이중 연결 리스트란?

![](https://i.imgur.com/yBv7gns.png)

저번에는 단방향으로 자신의 노드 다음 노드만 갈 수 있는 단방향의 연결 리스트가 있었다면 이중 연결 리스트는 해당 노드의 뒤로도 갈 수 있는 포인터가 하나 더 추가된 형태의 연결 리스트이다.

작은 차이 같지만 실제 구조에서는 메서드를 작성할 때마다 추가적인 부분이 필요하다. 양쪽의 연결을 계속해서 인지한 채로 노드의 연결을 조정해줘야 한다.

작동 방식도 거의 단일 연결 리스트와 같다. 노드가 많이 있지만 인덱스는 없고 헤드와 테일이 있다. 

## 구현

```js
class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
    this.prev = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  // 맨 뒤에 새로운 노드 추가하고 뒤의 노드와 서로 연결하는 push 메서드
  push(val) {
    var newNode = new Node(val);
    // 연결 리스트에 아무것도 없으면 헤드와 테일 모두 newNode가 됨
    if (this.length === 0) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      // next와 prev를 전부 연결해 주어야 함
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
    this.length++;
    return this;
  }

  // 연결리스트의 마지막 요소 뺴기
  pop() {
    // 바닥조건
    if (!this.head) return undefined;
    // 빼낼 노드를 미리 받아오기
    var poppedNode = this.tail;
    // 연결리스트에 노드가 하나밖에 없었을 떄
    if (this.length === 1) {
      this.head = null;
      this.tail = null;
    }
    // tail을 업데이트하고, 기존의 tail.next값을 nulㅣ로 업데이트
    // 빼낸 노드에 존재하는 연결도 끊음
    else {
      this.tail = poppedNode.prev;
      this.tail.next = null;
      poppedNode.prev = null;
    }
    this.length--;
    return poppedNode;
  }
  // 연결리스트의 맨 앞에서 노드를 제거하는 shift
  shift() {
    if (this.length === 0) return undefined;
    var oldHead = this.head;
    if (this.length === 1) {
      this.head = null;
      this.tail = null;
    } else {
      // 헤드를 oldHead 노드 다음 노드로
      this.head = oldHead.next;
      // oldHead의 연결 끊기
      oldHead.next = null;
      // 새로운 헤드의 앞 노드 연결 끊기
      this.head.prev = null;
    }
    this.length--;
    return oldHead;
  }

  // 연결리스트의 맨 앞에 노드를 추가하는 unshift 메서드
  unshift(val) {
    var newNode = new Node(val);
    //노드가 하나도 없을 경우 헤드와 테일 모두 newNode로 설정
    if (this.length === 0) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      // 헤드의 앞에 새로운 노드 추가
      this.head.prev = newNode;
      // 새로운 노드의 다음 노드를 현재 헤드에 있는 노드에 연결
      newNode.next = this.head;
      // 새로운 노드를 헤드로 설정
      this.head = newNode;
    }
    this.length++;
    return this;
  }

  // 연결리스트에서 해당 인덱스에 있는 노드의 값을 찾는 get메서드
  get(idx) {
    // 인덱스가 0보다 작거나 해당 길이보다 같거나 클 경우 해당하는 값이 없으므로 null 리턴
    if (idx < 0 || idx >= this.length) return null;
    var count, current;
    // 인덱스가 길이의 반보다 같거나 작을 경우 => 헤드에서부터 시작해서 찾아가는게 유리함
    if (idx <= this.length / 2) {
      count = 0;
      current = this.head;
      // 해당 인덱스만큼 옆으로 이동해서 해당 인덱스의 값 찾기
      while (count != idx) {
        current = current.next;
        count++;
      }
      return current;
    }
    // 아닐 경우 => 테일에서부터 하나씩 찾아가는게 유리함
    else {
      count = this.length - 1;
      current = this.tail;
      // 한개씩 연결리스트 뒤로 문워크 하면서 인덱스에 있는 값까지 가기
      while (count !== idx) {
        current = current.prev;
        count--;
      }
      return current;
    }
  }
  // 해당하는 인덱스의 연결 리스트 값을 업데이트하는 set 메서드
  set(idx, val) {
    var foundNode = this.get(idx);
    if (foundNode) {
      foundNode.val = val;
      return true;
    }
    return false;
  }
  // 해당하는 인덱스에 val 값을 가진 노드를 삽입하는 insert 메서드
  insert(idx, val) {
    // 인덱스가 유효하지 않을 경우 false 리턴
    if (idx < 0 || idx > this.length) return false;
    // 인덱스가 0일 경우 unshift 메서드 사용
    if (idx === 0) return !!this.unshift(val);
    // 인덱스가 연결리스트의 길이와 같을 경우 push 메서드 사용
    if (idx === this.length) return !!this.push(val);
    var newNode = new Node(val);
    var prevNode = this.get(idx - 1);
    var afterNode = prevNode.next;

    prevNode.next = newNode;
    newNode.prev = prevNode;
    newNode.next = afterNode;
    afterNode.prev = newNode;
    this.length++;
    return true;
  }
  // 해당 인덱스의 노드를 삭제하는 remove 메서드
  remove(idx) {
    // 유효허지 않은 인덱스일 경우 undefined 리턴
    if (idx < 0 || idx >= this.length) return undefined;
    // 인덱스가 0일 경우 shift 메서드 사용
    if (idx === 0) this.shift();
    // 인덱스가 연결리스트의 길이일 경우 pop 메서드 사용
    if (idx === this.length - 1) this.pop();
    var removedNode = this.get(idx);
    // 연결 업데이트
    removedNode.prev.next = removedNode.next;
    removedNode.next.prev = removedNode.prev;
    // 저장된 연결 지우기
    removedNode.next = null;
    removedNode.prev = null;
    this.length--;
    return removedNode;
  }
}

```

## 시간복잡도
| 연산        | 시간복잡도                                    |
| --------- | ---------------------------------------- |
| Insertion | $O(1)$                                   |
| Removal   | $O(1)$                                   |
| Searching | $O(n)$<br>기술적으로 $O(n/2)$이긴 한데 결국 $O(n)$임 |
| Access    | $O(n)$                                   |

## 기억해야 할 것들

- 이중 연결 리스트의 형태는 거의 단일 연결리스트와 비슷하지만 추가적인 포인터가 있다!(이전의 노드를 가리키는 포인터)
- 이중 연결 리스트는 탐색에서 절반의 시간이 걸리기 때문에 단일 연결 리스트보다 더 나은 성능을 기대할 수 있다.
- 단일 연결 리스트보다 이전의 노드를 가리키는 포인터를 만들면서 메모리를 더 소모하기 때문에 이러한 점을 고려해야 한다.