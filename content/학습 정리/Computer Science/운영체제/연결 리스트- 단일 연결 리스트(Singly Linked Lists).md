# 단일 연결 리스트란?

단일연결리스트는 원하는 데이터를 저장하는 자료구조 중 하나로, 배열처럼 순서에 따라 다수의 데이터를 저장한다. 하지만 배열과의 차이점이 있다.

배열의 경우 각 데이터 Elements는 번호에 의해 인덱스가 부여된다. 새로운 데이터를 추가할 때도 그 위치에 따른 인덱스가 주어진다.

반면 연결 리스트들은 다음 데이터 Element를 가리키는 인덱스 없이 그냥 다수의 데이터 Element들로 구성된다. 마치 객차들이 연속으로 연결되어 있는 기차와 같은 형태로 꼬리에 꼬리를 물면서 계속 옆으로 이어지는 형태이다. 하지만 여기서 데이터에 접근하기 위해 사용할 인덱스는 없다는 점이 특징이다. Head 노드부터 옆으로 계속 이어서 옮겨가면서 값을 찾는다.
## 용어정리

![](https://i.imgur.com/rcJcYfh.png)

| 용어        | 설명                                                            |
| --------- | ------------------------------------------------------------- |
| node      | 연결리스트에서 각각의 element들을 나타내는 말                                  |
| 연결 리스트    | 다수의 node로 구성되며, 각각의 노드는 문자열 혹은 숫자와 같은 하나의 데이터 element를 가지고 있음 |
| Head      | 연결 리스트의 시작 노드 포인터                                             |
| tail      | 연결 리스트의 마지막을 가기키는 포인터                                         |
| 단일 연결 리스트 | 각 노드가 다음 노드로 오직 단일 방향으로만 연결된 형태의 노드                           |

## 구현
```js
class Node {
  constructor(val) {
    // 해당 노드의 값
    this.val = val;
    // 다음 노드를 가리킬 공간
    this.next = null;
  }
}

class SinglyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  //push 메서드 => 새로운 노드 추가
  push(val) {
    var newNode = new Node(val);
    // 헤드에 아무것도 없을 경우 노드가 아무것도 없다는 뜻
    // 새로운 노드를 헤드와 테일 모두에 업데이트
    if (!this.head) {
      this.head = newNode;
      this.tail = this.head;
    } // 연결 리스트에 노드가 있을 경우
    // 끝에서 다음 노드를 새로운 노드로 하고 마지막 노드를 새로운 노드로 업데이트
    else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.length++;
    return this;
  }

  pop() {
    if (!this.head) return undefined;
    // current -> 현재 옆으로 옮기면서 가리키고 있는 노드를 나타냄
    var current = this.head;
    // newTail -> current 이전의 노드를 가리키면서 계속 끌려감
    var newTail = current;
    // 반복문을 통해 노드를 끝까지 옮기기
    while (current.next) {
      newTail = current;
      current = current.next;
    }
    // 테일을 마지막 노드 이전의 노드로 설정
    this.tail = newTail;
    // newTail의 next에 붙어 있던 마지막 노드를 없애기
    newTail.next = null;
    // 연결 리스트의 길이 하나 줄이기
    this.length--;
    // 연결 리스트가 하나도 없을 경우 -> 헤드와 테일을 null로 재설정
    if (this.length === 0) {
      this.head = null;
      this.tail = null;
    }
    return current;
  }

  // shift -> 연결리스트의 앞에서 노드를 제거
  shift() {
    if (!this.head) return undefined;
    var currHead = this.head;
    this.head = currHead.next;
    // 연결 리스트 길이 줄이기
    this.length--;
    // next가 남는 문제 해결
    if (this.length === 0) {
      this.head = null;
      this.tail = null;
    }
    return currHead;
  }
  // unshift => 맨 앞에 부분에 노드를 붙여넣기
  unshift(val) {
    // 새로운 노드 생성
    var newNode = new Node(val);
    // 아무 노드도 없을 경우
    // 헤드를 들어오는 노드로 만들고 테일도 똑같이 만듦
    if (!this.head) {
      this.head = newNode;
      this.tail = this.head;
    }
    // 노드가 있을 경우
    // 현재 헤드를 새로운 노드 다음으로 밀고 헤드를 새로운 노드로 설정
    else {
      newNode.next = this.head;
      this.head = newNode;
    }
    this.length++;
    return this;
  }
  // 받은 인덱스값에 해당하는 연결 리스트의 값을 리턴
  get(idx) {
    // 해당하는 인덱스 값이 없는 경우(범위초과) null 리턴
    if ((idx < 0 && idx) || !this.length) return null;
    var counter = 0;
    var current = this.head;
    // 인덱스만큼 연결리스트를 따라 옮겨감
    while (counter !== idx) {
      current = current.next;
      counter++;
    }
    return current;
  }
  // 인덱스와 값을 받고 해당하는 인덱스의 값을 받은 값으로 업데이트
  set(idx, val) {
    // 만들어둔 get 메서드를 통해 해당하는 인덱스의 노드를 가져옴
    var foundNode = this.get(idx);
    // 해당하는 노드가 있다면
    if (foundNode) {
      // 노드의 값 업데이트
      foundNode.val = val;
      // true 반환
      return true;
    }
    // 없다면 false 반환
    return false;
  }
  //인덱스와 값을 받아들여 해당하는 인덱스 위치에 받은 값을 삽입
  insert(idx, val) {
    // 범위에 벗어나는 인덱스일 경우 false 리턴
    if (idx < 0 || idx > this.length) return false;
    // 연결리스트의 길이와 인덱스가 같으면 맨 오른쪽에 요소 삽입 => push 메서드 사용
    if (idx === this.length) {
      this.push(val);
      return true;
    }
    // 인덱스가 0일 경우 가장 앞에 삽입 => unshift 메서드 + 반환값에 !!를 붙여 불리언으로 바꾸기
    if (idx === 0) !!this.unshift(val);

    // 삽입할 노드 만들기
    var newNode = new Node(val);
    // 해당 인덱스 이전의 노드를 찾아오기 => get 메서드
    var prev = this.get(idx - 1);
    // 노드를 보존하면서 넣기 위해 스왑용 변수 만들기
    var temp = prev.next;
    // 이전 노드의 다음 노드를 새로운 노드를 가리키도록 변경
    prev.next = newNode;
    // 이전 노드의 다음 노드를 새로운 노드의 다음 노드로 변경
    newNode.next = temp;
    // 길이 추가
    this.length++;
    return true;
  }
  remove(idx) {
    // 인덱스가 0보다 작거나 길이보다 클 경우 undefined 리턴
    if (idx < 0 || idx > this.length) return undefined;
    // 인덱스가 길이와 같을 경우 가장 오른쪽에 있으므로 pop 메서드 사용
    if (idx === this.length) this.pop();
    // 인덱스가 0일 경우 가장 왼쪽에 있으므로 shift 메서드 사용
    if (idx === 0) this.shift();

    // 이전 노드의 다음 노드를 설정하기 위해 이전 노드 접근
    var prev = this.get(idx - 1);
    var removed = prev.next;
    // 이전 노드의 다음 노드의 다음 노드를 이전 노드의 다음 노드로 변경해서 바로 다음이었던 노드를 삭제
    prev.next = removed.next;
    // 길이가 하나 줄어들기 떄문에 하나 빼기
    this.length--;
    return prev.mext;
  }

  // 단순 출력하여 연결 리스트 파악용 메서드
  print() {
    var arr = [];
    var current = this.head;
    while (current) {
      arr.push(current.val);
      current = current.next;
    }
    console.log(arr);
  }
  // 연결리스트를 돌면서 처음부터 연결 리스트의 방향을 바꾸는 메서드
  reverse() {
    // 미리 헤드와 테일을 바꿔놓는 작업
    var node = this.head;
    this.head = this.tail;
    this.tail = node;

    var next;
    // prev가 null이 되어야 하는 이유는 tail의 next가 null이기 때문
    var prev = null;
    for (var i = 0; i < this.length; i++) {
      next = node.next;
      node.next = prev;
      // 반대방향으로 가면서 이전 노드는 곧 현재 노드가 됨
      prev = node;
      // 현재의 노드는 next 노드로 재설정
      node = next;
    }
    return this;
  }
}
```

## 시간복잡도

| 연산        | 시간복잡도                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------- |
| Insertion | $O(1)$                                                                                             |
| Removal   | $O(1)$<br>맨 앞의 노드를 제거할 때<br>~<br>$O(n)$<br>맨 뒤의 노드를 제거할  때 -> 처음부터 시작해서 리스트에 존재하는 모든 노드를 전부 확인해야 함 |
| Searching | $O(n)$                                                                                             |
| Access    | $O(n)$                                                                                             |

## 결론

단방향 연결 리스트는 삽입과 삭제에 있어서 $O(1)$의 시간을 가지기 때문에 배열에 비해 우수한 성능을 가지고 있다.  따라서
- 삽입/삭제 작업을 주로 해야 할 때
- 임의 접근 작업이 필요없을 때
- 주어진 순서대로 데이터를 접근/관리할 필요가 있을 때
- 중간의 노드를 접근할 필요가 없을 때
와 같은 상황에서 단방향 연결 리스트가 보다 성능이 좋다. 