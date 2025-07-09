# 문제 첫인상
## 학습 목표?
학습 목표를 보고 처음에 컬렉션 타입이 정확히 무엇인가를 머릿속으로 설명하지 못했다. 그렇다는 것은 즉 내가 이 용어에 대한 개념을 정확하게 이해하지 못하다는 방증이기도 해서 가장 먼저 Collection에 대해 알아보고 문제를 해결해야겠다고 생각했다.
## 핵심
해당 문제의 핵심은 사다리게임을 구현함에 있어서 각자 사다리 게임의 기능을 세분화해서 함수로 구현하는데 초점이 맞춰져 있는 문제같다. 게임의 기능을 독립적인 함수로 구현해내어 어느 경우에서 사용해도 독립적이기 때문에 게임에 영향을 미치지 않도록 하는 것이 중요할 것 같다고 생각했다.

# 기능 설계
## 사다리 발판 종류
- `---` 1자 발판 : 좌→우, 우→좌 양쪽에서 모두 이동 가능하다.
- \\\\-\\ 우하향 발판 : 좌→우에서만 이동 가능하다.
- `/-/` 좌하향 발판 : 우→좌에서만 이동 가능하다.
## reset()

사다리 데이터를 모두 빈 상태로 초기화 함수를 구현한다
모두 비어있는 상태로 만들어야 한다
사다리의 참가자는 5명 \* 사다리 높이는 5칸 = 25개의 | 파이프 문자를 순서대로 배치하면 될 것 같다.

reset() + display() 한 경우를 보자
```js
|   |   |   |   |\n
|   |   |   |   |\n
|   |   |   |   |\n
|   |   |   |   |\n
|   |   |   |   |\n

```
각 줄마다 \\\n 으로 구분되어 있고, 각 칸 사이에는 발판이 들어갈 3개의 공백이 있다.
각 줄마다 배열로 사다리, 공백을 만들면 될 것 같다. 줄바꿈의 경우에는 `display()` 할 경우에 join메서드에 줄바꿈 문자를 넣으면 될 것 같다.

```js
let ladder;
const reset = () => {
  let row = [];
  for (let i = 1; i < 10; i++) {
    row.push(i % 2 === 0 ? "   " : "|");
  }

  ladder = new Array(5).fill(row);
};
```

`ladder`을 전역적으로 관리하는 이유는 해당 함수 뿐만이 아니라 `randomFill()` 함수 등을 파라미터 없이 실행하는 테스트케이스를 보여줬기 때문에 전역적으로 관리해야겠다고 생각했다.
하지만 여기선 오류가 있었는데, 랜덤으로 만들어 주는 사다리의 모든 열에 있는 사다리의 모양이 똑같이 나왔다.
왜인지 디버깅을 하면서 분석해보니 `Array.fill()`을 하는 과정에서 같은 배열로 fill해서 같은 참조를 공유하고 있었다. 그래서 fill 방법은 어쩔 수 없이 사용하지 않기로 결정했다.
```js
let ladder = new Array(5);
const reset = () => {
  let row;
  for (let i = 0; i < 5; i++) {
    row = [];
    for (let j = 1; j < 10; j++) {
      row.push(j % 2 === 0 ? "   " : "|");
    }
    ladder[i] = row;
  }
};
```
아예 ladder에 5칸을 미리 만들어놓고 거기에 재할당하는 방식으로 변경했다.
## randomFill()

사다리 데이터 구조에 발판을 랜덤하게 생성한다
3가지 발판 종류를 랜덤 선택해야 하고 총 발판 몇 개를 채울지도 랜덤하게 결정한다.
빈칸의 개수는 4개이고 각 빈칸마다 3가지 발판 종류중에 하나를 랜덤으로 선택해야 한다.
이를 좀 더 세분화하여 함수화시킬 수 있지 않을까? 생각해서 기능을 함수별로 나누어 보았다.
### getRandomLadderType() 

3가지 발판 종류 중에 하나를 랜덤으로 뽑아서 리턴한다.
```js
const ladderType = {
  0: "---",
  1: "/-/",
  2: "\\-\\",
  3: "    ",
};
const getRandomLadderType = () => {
  return ladderType[Math.floor(Math.random() * 4)];
};
```
0~3까지의 순서에 각각 사다리를 값으로 주었으며 이 사이 값만 랜덤하게 뽑아서 해당하는 사다리 타입을 리턴하도록 했다.
빈칸까지 랜덤하게 넣으면 알아서 랜덤한 수로 빈칸까지 만들어지니 총 발판을 몇 개를 채울지 랜덤 선택하는 것까지 일석이조!

### rowRandomFill()
각 열의 빈 칸에 랜덤한 사다리 타입을 넣어준다.
randomFill하게 되면 이중 루프문을 사용해줘야 할 것 같은데 그게 보기 싫어서 함수로 따로 나누어보았다!
```js
const rowRandomFill = (row) => {
  for (let i = 0; i < row.length; i++) {
    if (i % 2 === 1) row[i] = getRandomLadderType();
  }
};
```

최종적으로 나온 randomFill() 함수 안에 들어가는 코드는 아래와 같다.
```js
const randomFill = () => {
  for (let i = 0; i < ladder.length; i++) {
    rowRandomFill(ladder[i]);
  }
};
```
randomFill 함수 전체가 가독성이 좋아져서 기분이 좋다 우하하
수료생분 접근법을 조금 차용해서 활용해봤는데 훨씬 코드가 깨끗해진 느낌..?

## analyze()
사다리 데이터 구조를 분석한다
- 좌우에 1자 발판이 연속으로 나오면 false
- 좌측에 우하향 발판 + 우측에 좌하향 발판이 연속으로 나오면 false
- 좌측에 좌하향 발판 + 우측에 우하향 발판이 연속으로 나오면 false
- 위에 해당하는 경우가 없으면 true를 return

```js
const rowAnalyze = (row) => {
  for (let i = 1; i < row.length; i += 2) {
    if (row[i] === row[i + 2] && row[i] == "---") return false;
    if (row[i] === "\\-\\" && row[i + 2] == "/-/") return false;
    if (row[i] === "/-/" && row[i + 2] == "\\-\\") return false;
  }
  return true;
};
```

`analyze()`는 간단하게 열마다 루프문을 돌면서 좌우를 확인하는 함수를 분리해서 만들고, 이걸 전체 배열에서 돌면서 모두 검사하도록 했다.

```js
const analyze = () => {
  for (let i = 0; i < ladder.length; i++) {
    if (!rowAnalyze(ladder[i])) return false;
  }
  return true;
};
```

## display()
사다리 데이터 구조를 문자열로 출력하는 함수를 구현한다
- 사다리 세로는 `|` 파이프 문자로 출력한다.
- 발판 종류별로 출력하는 형식은 다음과 같다.
    - `---` 1자 발판
    - `\-\` 우하향 발판
    - `/-/` 좌하향 발판
    - 빈 발판
- 한 줄 마지막 끝에는 줄바꿈 문자 `\n`을 붙여서 출력한다.
- 출력은 analyze() 동작과 상관없이 동작한다.

```js
const display = () => {
  let output = "";
  for (let i = 0; i < ladder.length; i++) {
    output = output + ladder[i].join("") + "\n";
  }
  return output;
};
```
display는 따로 어려운 거 없이 만들어놓은 배열의 열을 하나씩 돌면서 합쳐주었다.

## 전체 코드
```js
const ladderType = {
  0: "---",
  1: "/-/",
  2: "\\-\\",
  3: "   ",
};
const getRandomLadderType = () => {
  return ladderType[Math.floor(Math.random() * 4)];
};

let ladder = new Array(5);
const reset = () => {
  let row;
  for (let i = 0; i < 5; i++) {
    row = [];
    for (let j = 1; j < 10; j++) {
      row.push(j % 2 === 0 ? "   " : "|");
    }
    ladder[i] = row;
  }
};

const randomFill = () => {
  for (let i = 0; i < ladder.length; i++) {
    rowRandomFill(ladder[i]);
  }
};
const rowRandomFill = (row) => {
  for (let i = 0; i < row.length; i++) {
    if (i % 2 === 1) row[i] = getRandomLadderType();
  }
};

const analyze = () => {
  for (let i = 0; i < ladder.length; i++) {
    if (!rowAnalyze(ladder[i])) return false;
  }
  return true;
};

const rowAnalyze = (row) => {
  for (let i = 1; i < row.length; i += 2) {
    if (row[i] === row[i + 2] && row[i] == "---") return false;
    if (row[i] === "\\-\\" && row[i + 2] == "/-/") return false;
    if (row[i] === "/-/" && row[i + 2] == "\\-\\") return false;
  }
  return true;
};

const display = () => {
  let output = "";
  for (let i = 0; i < ladder.length; i++) {
    output = output + ladder[i].join("") + "\n";
  }
  return output;
};

reset();
randomFill();
console.log(analyze());
console.log(display());

```

# 학습한 것들
## JavaScript Collection Type
### Collection이란?

> 구조 또는 비구조화된 형태로 프로그래밍 언어가 제공하는 값을 담을 수 있는 공간

Collection은 아래와 같은 기능을 사용할 수 있다.
- for - of 루프
- 스프레드 연산자(`...`)
- 분해 할당(destructuring assignment)
- 기타 iterable을 인수로 받는 함수

Collection에는 **인덱스 기반 컬렉션(Indexed Collection)** 과 **키 기반 컬렉션(Keyed Collection)** 이 있다.

### Index 기반 컬렉션

인덱스 값에 의해 정렬이 되는 데이터 컬렉션으로 **Array**와 **TypedArray** 객체가 이에 해당한다.
배열은 이름과 인덱스를 사용하여 참조하는 값들의 순서가 있는 목록이다.
#### Array

```js
// new 연산자를 이용해서 생성한다.
let arr = new Array();

// 위 코드는 아래와 동일하다.
let arr = [];
```
#### TypedArray

TypedArray는 이진 데이터 버퍼에 기초해 배열과 같은 보기를 만들어낸다.
이 객체는 직접 인스턴스화할 수 없고 특정 유형의 배열 인스턴스를 지정하여 만들 수 있다.

```js
// 불가능
new TypedArray()
```


```js
// 가능
const typedArray1 = new Int8Array(8);
typedArray1[0] = 32;

const typedArray2 = new Int8Array(typedArray1);
typedArray2[1] = 42;

console.log(typedArray1);
// Int8Array [32, 0, 0, 0, 0, 0, 0, 0]

console.log(typedArray2);
// Int8Array [32, 42, 0, 0, 0, 0, 0, 0]

```

 TypedArray 객체은 아래와 같은 것들이 있다.

| 형식                | 값 범위                                    | 바이트 크기 | 설명                                                       | Web IDL 형식            | 동일한 C 형식                        |
| ----------------- | --------------------------------------- | ------ | -------------------------------------------------------- | --------------------- | ------------------------------- |
| Int8Array         | -128 to 127                             | 1      | 부호 있는 8비트 2의 보수 정수                                       | `byte`                | `int8_t`                        |
| Uint8Array        | 0 to 255                                | 1      | 부호 없는 8비트 정수                                             | `octet`               | `uint8_t`                       |
| Uint8ClampedArray | 0 to 255                                | 1      | 부호 없는 8비트 정수 (고정)                                        | `octet`               | `uint8_t`                       |
| Int16Array        | -32768 to 32767                         | 2      | 부호 있는 16비트 2의 보수 정수                                      | `short`               | `int16_t`                       |
| Uint16Array       | 0 to 65535                              | 2      | 부호 없는 16비트 정수                                            | `unsigned short`      | `uint16_t`                      |
| Int32Array        | -2147483648 to 2147483647               | 4      | 부호 있는 32비트 2의 보수 정수                                      | `long`                | `int32_t`                       |
| Uint32Array       | 0 to 4294967295                         | 4      | 부호 없는 32비트 정수                                            | `unsigned long`       | `uint32_t`                      |
| Float32Array      | `-3.4E38`에서 `3.4E38`. `1.2E-38`은 최초 양수  | 4      | 32비트 IEEE 부동 소수점 숫자 (유효한 7자리 숫자, 예: `1.234567`)          | `unrestricted float`  | `float`                         |
| Float64Array      | `-1.8E308`에서 `1.8E308`. `5E-324`는 최소 양수 | 8      | 64비트 IEEE 부동 소수점 숫자 (유효한 16자리 숫자, 예: `1.23456789012345`) | `unrestricted double` | `double`                        |
| BigInt64Array     | -263에서 263 - 1                          | 8      | 부호 있는 64비트 2의 보수 정수                                      | `bigint`              | `int64_t (signed long long)`    |
| BigUint64Array    | 0 에서 264 - 1                            | 8      | 부호 없는 64비트 정수                                            | `bigint`              | `uint64_t (unsigned long long)` |

### Key 기반 컬렉션

Key 기반 컬렉션은 입려개된 키값을 기준으로 정렬되는 데이터의 집합으로, `Map`, `Set`, `WeakMap`, `WeakSet`이 있다.

#### Map

간단한 키와 값을 서로 매핑시켜 저장하며 저장된 순서대로 각 요소들을 반복적으로 접근할 수 있다. 
```js
// 생성자
var sayings = new Map();
sayings.set("dog", "woof");
sayings.set("cat", "meow");
sayings.set("elephant", "toot");
sayings.size; // 3
sayings.get("fox"); // undefined
sayings.has("bird"); // false
sayings.delete("dog");

for (var [key, value] of sayings) {
  console.log(key + " goes " + value);
}
// "cat goes meow"
// "elephant goes toot"
```

##### Object와 Map의 차이

전통적으로 Object 또한 키-값 쌍으로 이루어져 있어 문자열을 값에 매핑하는데 사용되었다. 하지만 ES6에 들어서 새로 생긴 Map은 몇 가지 Object보다 유용한 장점을 가지고 있다.
- Map의 키는 모든 값이 가능	
- Object는 크기를 수동 추적하지만 Map은 size 속성이 있음
- Map은 삽입된 순서대로 반복
- Object에는 prototype이 있어 Map에 기본 키들이 있다.

이러한 차이들을 가지고 어떤 자료구조를 사용할지에 대해서는 아래와 같은 점을 참고하자
- 실행 시까지 키를 알수 없고, 모든 키가 동일한 type이며 모든 값들이 동일한 type일 경우에는 objects를 대신해서 map을 사용
- 각 개별 요소에 대해 적용해야 하는 로직이 있을 경우에는 objects를 사용

#### Set

Set 객체는 값들의 집합으로 입력된 순서에 따라 저장된 요소를 반복처리할 수 있다.
Set은 중복된 값을 허용하지 않는다는 특징을 가지고 있다.
```js
var mySet = new Set();
mySet.add(1);
mySet.add("some text");
mySet.add("foo");

mySet.has(1); // true
mySet.delete("foo");
mySet.size; // 2

for (let item of mySet) console.log(item);
// 1
// "some text"

```
#### Weakmap과 Weakset

Map, Set이 참조하는 객체들은 강하게 연결되어있어 자바스크립트의 가비지 컬렉터가 메모리 수거를 하지 못한다. 
Map, Set도 크기가 크기 때문에 더이상 쓰지 않을 경우(객체에 대한 참조가 더이상 존재하지 않을 경우)에는 메모리에서 삭제하기 쉽도록 나온 것이 **WeakMap, WeakSet**이다.
