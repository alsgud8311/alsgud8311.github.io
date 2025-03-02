# 문제 첫인상

기본적인 스택 구조를 배열로 구현하는 문제이다. 하지만 그저 배열에서 PUSH, POP 등을 구현하는 것이 아닌 계산기의 형태로 계산기에는 레지스터 또한 들어가 있다. 이러한 점을 고려하면서 설계를 하고 구현해보라는 식의 문제인데, 설계와 코딩을 둘 다 신경쓸 수 있도록 만든 문제같다.

# 설계
## 스택 계산기 구조

![](https://i.imgur.com/D6AsLK3.png)
-  8개 높이(또는 길이)를 가지는 Stack 동작 PUSH, POP 구현은 각 언어에서 제공하는 배열Array, 리스트List, 벡터Vector 등 자료구조만 이용해서 별도 타입을 구현하라라고 되어있다. 자바스크립트의 경우는 배열을 사용하면 된다.
- 긴 함수 하나로 구현하지 말고, 각 명령어 처리는 개별 함수나 메소드로 분리해서 작성해야 함. 특히 하나의 명령어는 개별 함수로 분리해서 작성하라는 안내가 되어 있으므로 자바스크립트에서는 클래스를 이용하여 각 기능들을 메소드로 구현하면 될 것 같다.
- 배열 말고도 스택 계산기에는 값을 일시적으로 저장할 수 있는 레지스터 A, B 두 개가 있다.
## 계산기 내부 설계
### 공통사항
- 입력한 명령 중에 처리할 수 없는 명령의 경우는 "UNKNOWN"을 출력하고 다음 명령을 수행
- 입력값 배열에 모든 명령을 처리하면 계산을 멈추고 return
- 입력값은 명령만 포함
- 입력값 배열은 최대 100까지만 포함
### 명령
- POPA - 스택 메모리에서 값 하나를 꺼내 A 레지스터로 복사. 꺼낼 값이 없으면 "EMPTY"출력
	- 명령을 수행할 때 값이 없으면 "EMPTY"를 출력
	- 레지스터 A와 B는 POP 명령으로 스택에서 값을 가져올 수 있음. 실행하고 처음에는 값이 없음
- POPB - 스택 메모리에서 값 하나를 꺼내 B 레지스터로 복사. 꺼낼 값이 없으면 "EMPTY"출력
	- 명령을 수행할 때 값이 없으면 "EMPTY"를 출력
	- 레지스터 A와 B는 POP 명령으로 스택에서 값을 가져올 수 있음. 실행하고 처음에는 값이 없음
- ADD - A와 B 레지스터 값을 더해서 스택에 PUSH
	- 8칸을 모두 채운 이후에는 "OVERFLOW"를 출력
	- 만약 레지스터 A나 B가 초기 상태로 값이 없으면, ADD 연산을 수행할 수 없어서 "ERROR"를 출력
- SUB - A 레지스터 값에서 B 레지스터 값을 빼서 스택에 PUSH
	- 8칸을 모두 채운 이후에는 "OVERFLOW"를 출력
	- 만약 레지스터 A나 B가 초기 상태로 값이 없으면, SUB 연산을 수행할 수 없어서 "ERROR"를 출력
- PUSH0 - 스택에 0 값을 PUSH
	- 8칸을 모두 채운 이후에는 "OVERFLOW"를 출력
- PUSH1 - 스택에 1 값을 PUSH
	- 8칸을 모두 채운 이후에는 "OVERFLOW"를 출력
- PUSH2 - 스택에 2 값을 PUSH
	- 8칸을 모두 채운 이후에는 "OVERFLOW"를 출력
- SWAP - A레지스터 값과 B 레지스터 값을 맞교환
	- 만약 레지스터 A나 B가 초기 상태로 값이 없으면, SWAP 연산을 수행할 수 없어서 "ERROR"를 출력
- PRINT - 스택 마지막 값을 꺼내서 출력. 이 때 스택은 하나 줄어듦. 만약 스택이 비어있으면 "EMPTY"를 출력에 추가.
	- 명령을 수행할 때 값이 없으면 "EMPTY"를 출력

# 코드로 구현하기
## 스택 계산기
```js
class Stack_Cal {
  constructor() {
    this.registerA = "";
    this.registerB = "";
    this.stack = new Array(8).fill("");
  }
}
```
스택 계산기에서는 정수 값을 받기 때문에 0으로 초기값을 설정하게 되면 이 또한 값으로 받아들인다. 그렇기 때문에 일부러 빈 문자열을 초기값으로 만들었다.

## 명령
### POPA, POPB
```js
  popA() {
    if (this.stack.length === 0) return "EMPTY";
    this.registerA = this.stack.pop();
  }
  popB() {
    if (this.stack.length === 0) return "EMPTY";
    this.registerB = this.stack.pop();
  }
```

### ADD
```js
add() {
    if (!this.registerA || !this.registerB) return "ERROR";
    if (this.stack.length === 8) return "OVERFLOW";
    this.stack.push(this.registerA + this.registerB);
  }
```

### SUB
```js
  sub() {
    if (!this.registerA || !this.registerB) return "ERROR";
    if (this.stack.length === 8) return "OVERFLOW";
    this.stack.push(this.registerA - this.registerB);
  }
```

### PUSH0, PUSH1, PUSH2
```js
  push0() {
    if (this.stack.length === 8) return "OVERFLOW";
    this.stack.push(0);
  }
  push1() {
    if (this.stack.length === 8) return "OVERFLOW";
    this.stack.push(1);
  }
  push2() {
    if (this.stack.length === 8) return "OVERFLOW";
    this.stack.push(2);
  }
```

### SWAP
```js
  swap() {
    if (!this.registerA || !this.registerB) return "ERROR";
    let temp = this.registerA;
    this.registerA = this.registerB;
    this.registerB = temp;
  }
```

### PRINT
```js
  print() {
    if (this.stack.length === 0) return "EMPTY";
    return this.stack.pop();
  }
```

## 계산기 클래스 전체 코드

```javascript
class Stack_Cal {
  constructor() {
    this.registerA = "";
    this.registerB = "";
    this.stack = new Array();
  }
  popA() {
    if (this.stack.length === 0) return "EMPTY";
    this.registerA = this.stack.pop();
  }
  popB() {
    if (this.stack.length === 0) return "EMPTY";
    this.registerB = this.stack.pop();
  }
  add() {
    if (!this.registerA || !this.registerB) return "ERROR";
    if (this.stack.length === 8) return "OVERFLOW";
    this.stack.push(this.registerA + this.registerB);
  }
  sub() {
    if (!this.registerA || !this.registerB) return "ERROR";
    if (this.stack.length === 8) return "OVERFLOW";
    this.stack.push(this.registerA - this.registerB);
  }
  push0() {
    if (this.stack.length === 8) return "OVERFLOW";
    this.stack.push(0);
  }
  push1() {
    if (this.stack.length === 8) return "OVERFLOW";
    this.stack.push(1);
  }
  push2() {
    if (this.stack.length === 8) return "OVERFLOW";
    this.stack.push(2);
  }
  swap() {
    if (!this.registerA || !this.registerB) return "ERROR";
    let temp = this.registerA;
    this.registerA = this.registerB;
    this.registerB = temp;
  }
  print() {
    if (this.stack.length === 0) return "EMPTY";
    return this.stack.pop();
  }
}
```

## 명령어 입력기 
```js

function command(commandList) {
  let calculator = new Stack_Cal();
  let stdOut = [];
  commandList.forEach((command) => {
    let result;
    switch (command) {
      case "POPA":
        result = calculator.popA();
        if (typeof result !== "undefined") stdOut.push(result);
        break;
      case "POPB":
        result = calculator.popB();
        if (typeof result !== "undefined") stdOut.push(result);
        break;
      case "ADD":
        result = calculator.add();
        if (typeof result !== "undefined") stdOut.push(result);
        break;
      case "SUB":
        result = calculator.sub();
        if (typeof result !== "undefined") stdOut.push(result);
        break;
      case "PUSH0":
        result = calculator.push0();
        if (typeof result !== "undefined") stdOut.push(result);
        break;
      case "PUSH1":
        result = calculator.push1();
        if (typeof result !== "undefined") stdOut.push(result);
        break;
      case "PUSH2":
        result = calculator.push2();
        if (typeof result !== "undefined") stdOut.push(result);
        break;
      case "SWAP":
        result = calculator.swap();
        if (typeof result !== "undefined") stdOut.push(result);
        break;
      case "PRINT":
        result = calculator.print();
        if (typeof result !== "undefined") stdOut.push(result);
        break;
      default:
        stdOut.push("UNKNOWN");
        break;
    }
  });
  return stdOut;
}
```
명령어 입력기는 switch case문을 사용해서 해당 메소드를 실행하고, 실행 결과가 따로 있는 경우 실행 결과 배열에 넣어주도록 설계했다. 