# 스택(Stack)
## 스택(Stack)이란?

![](https://i.imgur.com/OrNBkYQ.png)

후입선출(LIFO, Last In First Out)의 구조를 가진 자료구조이다.
스택 자료구조는
1. 함수 호출(call stack)을 다루는 상황에서 사용
2. Undo(되돌리기)/Redo(다시실행)
3. 인터넷의 방문기록(히스토리 관리)
등에서 주로 활용된다.

## 배열을 이용한 스택 구현
```js
// 배열을 이용한 방식 1
var stack = [];
stack.push("stack1");
stack.push("stack2");
stack.push("stack3");
stack.pop();
stack.pop();
stack.pop();

// 배열을 이용한 방식 2 => 방향만 바뀜.
// 앞에서 제거 및 추가하는 경우 인덱스를 계속 밀고 당겨야 하기 때문에 효율적이지 않음
stack.unshift("stack1");
stack.unshift("stack2");
stack.unshift("stack3");
stack.shift();
stack.shift();
stack.shift();
```
구현이라고 하기도 민망하네
그냥 빌트인 메서드 쓰면 된다
배열을 이용한 스택 말고도 단일 연결 리스트를 이용해서도 구현할 수 있다. 물론 양방향도 가능하지만 살짝 투머치
```js
//연결 리스트를 이용한 방식
class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

class Stack {
  constructor() {
    this.first = null;
    this.last = null;
    this.size = 0;
  }
  // 앞에서 값을 넣는 push 메서드
  push(val) {
    var newNode = new Node(val);
    if (!this.first) {
      this.first = newNode;
      this.last = newNode;
    } else {
      var temp = this.first;
      this.first = newNode;
      this.first.next = temp;
    }
    return ++this.size;
  }
  // 앞에서 값을 하나씩 빼는 pop 메서드
  pop() {
    if (!this.head) return null;
    var temp = this.first;
    if (this.first === this.last) this.last = null;
    this.first = this.first.next;
    this.size--;
    return temp.value;
  }
}

```
여기서 push와 pop 메서드를 앞에서 추가하고 삭제하는 메서드로 만든 이유는 단일 연결리스트의 경우 pop이 상수시간이 나오지 않기 때문이다.

단일연결리스트로 pop을 구현하려면 마지막 노드를 그 전 노드로 만들어야 하는데, 그 전 노드를 구하는 과정의 시간복잡도가 $O(n)$이 걸리기 때문이다. 따라서 앞에서 추가하고 빼내는 것이 보다 효율적이다.

또한 단일 연결 리스트를 이용해서 만들게 되면 데이터의 양이 매우 많아졌을 때 그냥 배열을 이용했을 때보다 낫다. 

## 시간복잡도
| 연산  | 시간 복잡도 |
| --- | ------ |
| 삽입  | $O(1)$ |
| 삭제  | $O(1)$ |
| 탐색  | $O(n)$ |
| 접근  | $O(n)$ |
중요한 것은 삽입과 삭제가 상수시간이 걸리는 자료구조라는 것이다.  탐색이나 접근이 필요한 것들이 필요한 작업이라면 다른 자료구조를 이용하는 것이 낫다.

하지만 삽입과 삭제는 전체를 순회할 이유가 없기 때문에 상수시간이 걸려 삽입과 삭제만 필요한 부분에서는 효율적인 자료구조이다.

# 큐(Queue)
## 큐(Queue)란?

![](https://i.imgur.com/8HCpTOI.png)

큐는 스택과 비슷한 데이터 구조로 데이터의 추가와 삭제를 위한 자료구조이다.
스택과의 차이점이라고 한다면 순서인데, 큐는 선입선출(FIFO, First In First Out) 구조를 가지고 있다.

큐와 같은 선입선출 구조는 많은 곳에서 사용되는 구조이다. 줄을 서서 기다리는 것도 그렇고 프로그래밍 측면에서는
- 게임 대기열
- 백그라운드 작업
- 어떤 파일을 업로드할 때
- 프린트 대기열
등이 있다.

큐 또한 스택처럼 배열을 이용하여 구현할 수도 있고, 연결 리스트를 이용한 클래스를 만들어 사용할 수도 있다.

## 구현

```js
// 배열을 이용한 방식 1
var queue = [];
queue.push("first");
queue.push("second");
queue.push("third");
queue.shift(); //first
queue.shift(); //second
queue.shift(); //third

// 배열을 이용한 방식 2
queue.unshift("first");
queue.unshift("second");
queue.unshift("third");
queue.pop();
queue.pop();
queue.pop();
```
배열을 사용할 때는 어떤 방향에서든지 삽입이나 삭제에서 $O(n)$의 시간이 걸리는 작업이 있을 수밖에 없으므로 직접 클래스를 구현하는 것이 보다 효율적이다.

```js
//단일 연결 리스트를 이용한 구현
class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}
class Queue {
  constructor(val) {
    this.first = null;
    this.last = null;
    this.size = 0;
  }
  // 뒤에 값을 추가하는 enqueue 메서드
  enqueue(val) {
    var newNode = new Node(val);
    if (!this.first) {
      // 아무것도 없을 경우 새로 헤드와 테일 설정
      this.first = newNode;
      this.last = newNode;
    } else {
      // 포인터 옮기기
      this.last.next = newNode;
      this.last = newNode;
    }
  }
  // 앞의 값들을 하나씩 빼는 dequeue 메서드
  dequeue() {
    if (!this.first) return null;
    var temp = this.first;
    if (this.first === this.last) {
      this.last = null;
    }
    this.first = this.first.next;
    this.size--;
    return temp.val;
  }
}
```
## 시간복잡도
| 연산  | 시간복잡도  |
| --- | ------ |
| 삽입  | $O(1)$ |
| 삭제  | $O(1)$ |
| 탐색  | $O(n)$ |
| 접근  | $O(n)$ |
배열을 사용했을 때는 $O(n)$이 한 방향에서 발생했으나 연결리스트를 이용하여 구현했을 때에는 상수시간이 걸리는 것을 알 수 있다. 이를 통해 큐 또한 삽입과 삭제에 효율적인 자료구조임을 알 수 있다.