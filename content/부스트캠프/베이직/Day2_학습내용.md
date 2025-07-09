# 학습내용

## 문제 해결을 위한 설계
### Play() 함수

- 매개변수 param0는 참가자 A, B, C, D 순서로 이동할 칸을 의미하는 숫자를 4개씩 포함하는 배열입니다.
    - 예시) `"1,2,3,4"` 는 A 1칸, B 2칸, C 3칸, D 4칸 이동한다는 의미입니다.
    => 즉, play함수는 parameter로 들어오는 A, B, C, D의 이동한 칸 만큼 움직이게 만들고, 게임 종료 조건을 확인할 수 있도록 만드는 함수여야 함
        
### 주사위 값
- A, B, C, D 4명의 참가자가 있다고 가정하고 매 턴마다 주사위 대신에 1-4 사이의 값이 입력으로 제공됩니다.
	=> parameter로 들어가는 A, B, C, D의 입력은 1-4의 값을 랜덤으로 뽑게 해 주는 `dice()` 함수 제작

### 이동
- 모든 참가자는 시작 지점에서 출발하고, 주어진 1-4 값만큼 이동합니다.
	=> `play()`함수를 제작하여 모든 참가자를 이동하게 만듦. 이동한 후에는 이동한 뒤의 참가자 위치를 리턴해야 위치를 기록할 수 있음

### 소유
- 한 번도 방문하지 않은 곳에 누군가 도착하면 그 곳을 소유합니다.
	=> 만약 `play()`함수에서 유저가 움직였을 때 참가자 위치에 소유 표시가 따로 되어 있지 않으면 **소유 표시**
	=> 소유 표시를 어떻게 할 것인가?
	=> 배열로 만들면 인덱스 번호를 통해 편하게 접근가능

### 강탈불가
- 다른 사람이 이미 소유한 곳에 도착하면 뺏을 수 없습니다.
	=> 소유표시가 되어 있으면 그냥 따로 아무것도 없이 지나감

### 무한루프
- 여러 사람들이 모든 장소를 소유할 때까지 계속 입력으로 이동할 수 있습니다.
	=> 모든 장소에 소유 표시가 될 때까지 이동
	=> 소유 표시를 계속해서 확인해야 함
	=> 소유 표시는 계속해서 루프를 돌면서 확인하기보다는 따로 소유한 곳의 수를 세서 15개가 되면 종료하도록 만든다면 시간 복잡도가 줄어들 것

### 게임 종료 조건
- 더 이상 이동할 입력값이 없거나, 더 이상 소유할 장소가 없으면 게임을 종료합니다.
	=> 게임종료 조건은 이동할 입력값이 없거나 소유할 장소가 없을 경우
	=> 처음엔  `A, B, C, D 4명의 참가자가 있다고 가정하고 매 턴마다 주사위 대신에 1-4 사이의 값이 입력으로 제공됩니다.`라는 말을 보고 내가 직접 함수를 만드는 것으로 생각했지만 해당 조건을 보니 아마 입력으로 제공되는 것으로 생각됨.
	=> 하지만 테스트케이스를 하나하나 제작하기에는 게임당 설계 소요의 시간이 커 따로 `dice()` 함수를 만들기로 결정

### 리턴
- 종료 시점에는 각 참가자별로 소유한 장소 개수를 리턴하세요.
	=> `play()` 함수의 리턴값
	예시) `[ "A" : 4 , "B" : 3 , "C" : 5, "D" : 3 ]`
    

## 설계를 위한 학습 과정에서 기록한 것들
### 객체 초기값 설정
```js
// Map(4) { 'A' => 0, 'B' => 0, 'C' => 0, 'D' => 0 }
let userInfo = new Map([
  ["A", 0],
  ["B", 0],
  ["C", 0],
  ["D", 0],
]);
```
### 객체와 맵의 차이

|                           | Map                                                                                                                            | Object                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 보안                        | `Map`은 사용자가 제공하는 키와 값에 대해서 안전하게 사용할 수 있음                                                                                       | 사용자가 제공한 키-값 쌍을 `Object`에 설정하면 공격자가 객체의 프로토타입을 재정의하여 객체 주입 공격 을 발생시킬 수 있음<br> 돌발적인 키 문제와 마찬가지로 `null` 프로토타입 객체를 사용하여 이 문제를 해결할 수도 있음                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 키 유형                      | `Map`의 키는 모든 값(함수, 객체 또는 원시값 포함)이 될 수 있음                                                                                       | `Object`의 키는 String 또는 Symbol이여야 함                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 키 순서                      | `Map`에서 키는 단순하고 직관적인 방식으로 정렬<br>`Map` 객체는 항목을 삽입한 순서대로 항목, 키 및 값을 반복                                                           | 일반적인 `Object`의 키는 정렬되어 있지만 항상 그런것은 아니며 순서가 복잡함. 결과적으로 속성 순서에 의존하지 않는 것이 가장 좋음                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 크기                        | `Map`의 아이템의 수는 size 속성에서 쉽게 가져올 수 있음                                                                                           | `Object`의 아이템 수는 수동으로 결정해야 함                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 순회                        | `Map`은 [순회가능(iterable)](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Iteration_protocols)하기 때문에  직접 반복할 수 있음 | `Object`는 [iteration protocol](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol)을 구현하지 않기 때문에  개체는 [for...of](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/for...of)문을 사용하여 직접적으로 반복할 수 없음<br><br>**참고:**<br>- 객체는 iteration protocol을 구현하거나 [`Object.keys`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/keys) 혹은 [`Object.entries`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) 를 사용하여 객체의 반복 가능 항목을 얻을 수 있음<br>- [for...in](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/for...in) 문을 사용하면 객체의 열거 가능한 속성(enumerable)을 반복할 수 있음 |
| 성능                        | 키-값 쌍의 빈번한 추가 및 제거와 관련된 상황에서는 성능이 좀 더 좋음                                                                                       | 키-값 쌍의 빈번한 추가 및 제거에 최적화되지 않음                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Serialization and parsing | 직렬화 또는 구문 분석에 대한 기본 지원이 없음                                                                                                     | [`JSON.stringify()`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)를 사용하여 [`Object`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object)을 JSON으로 직렬화를 기본 지원<br><br>[`JSON.parse()`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)를 사용하여 JSON에서 [`Object`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object)으로의 구문 분석을 기본 지원                                                                                                                                                                                                                                                  |
## 설계한 코드
### 0-1. 주사위 맵
- play 함수에 이동할 칸들의 배열이 parameter로 들어간다면 play 함수에는 a,b,c,d를 움직이게 만들도록 하고 여기서 소유 표시를 해야 함
- 참가자별로 소유한 장소 개수는 맵으로 만들면 되지만, 주사위 놀이 판 같은 경우는 어디에 기록?
	=> 그냥 배열에 해당 칸 수만큼 0으로 채워 넣고 소유표시의 경우 1표시하면 될듯?
```js
let diceMap = new Array(16).fill(0);
```
칸은 5칸이지만 16개로 한 이유는 출발지를 더미로 만들어 놓아 따로 dice에서 -1을 하지 않도록 만듦

### 0-2. 참가자 위치 및 소유 땅
```js
// 각 참가자가 소유한 땅
let userOwn = new Map([
  ["A", 0],
  ["B", 0],
  ["C", 0],
  ["D", 0],
]);
// 참가자 위치
let userLoc = {
  A: 0,
  B: 0,
  C: 0,
  D: 0,
};
// 총 소유 땅
let owned = 0;
```
- 참가자가 소유한 땅은 `Map` 사용
- 참가자 위치의 땅은 `Object` 사용
	- 잦은 업데이트가 발생하는데, 여기서 해당 값에 접근하고 업데이트하는 코드는 Object가 직관적이라 사용해 보았음
- 바닥조건을 위한 총 소유 땅은 숫자를 할당하여 모든 칸(15칸)에 도달하면 더 게임을 진행하게 하지 않기 위해 따로 사용
	- 매번 배열을 돌면서 소유하지 않은 땅을 검사할 필요가 없음

### 1. 주사위 값
```js
const dice = () => {
  let diceList = [];
  for (let person = 0; person < 4; person++) {
    const random = Math.floor(Math.random() * 100);
    let moveCnt;
    if (random >= 0 && random < 25) {
      moveCnt = 1;
    } else if (random >= 25 && random < 50) {
      moveCnt = 2;
    } else if (random >= 50 && random < 75) {
      moveCnt = 3;
    } else if (random >= 75 && random < 100) {
      moveCnt = 4;
    }
    diceList.push(moveCnt);
  }
  return diceList;
};
```
- 4명의 참가자가 있다고 가정되어 있으므로 명시
- 4번동안 루프문을 돌면서 랜덤한 수를 뽑고 각자 같은 확률로 1, 2, 3, 4를 나눠 `moveCnt`변수에 할당
- 할당한 수를 배열에 4번 넣어 리스트를 완성한 후 리턴
### 2. Play() 함수
```js
const play = (dice) => {
  console.log(dice);
  for (let i = 0; i < dice.length; i++) {
    let user;
    switch (i) {
      case 0:
        user = "A";
        break;
      case 1:
        user = "B";
        break;
      case 2:
        user = "C";
        break;
      case 3:
        user = "D";
        break;
    }
    let move = (userLoc[user] + dice[i]) % 16;
    userLoc[user] = move;
    if (diceMap[move] === 0 && move !== 0) {
      diceMap[move] = 1;
      userOwn.set(user, userOwn.get(user) + 1);
      owned++;
    }
    if (owned === 15) {
      return userOwn;
    }
  }
  return userOwn;
};
```
- 매개변수 param0는 참가자 A, B, C, D 순서로 이동할 칸을 의미하는 숫자를 4개씩 포함하는 배열입니다.
    - 예시) `"1,2,3,4"` 는 A 1칸, B 2칸, C 3칸, D 4칸 이동한다는 의미입니다.
    => 즉, play함수는 parameter로 들어오는 A, B, C, D의 이동한 칸 만큼 움직이게 만들고, 게임 종료 조건을 확인할 수 있도록 만드는 함수여야 함
- 이동은 항상 해야 하므로 주사위 값과 현재 유저의 위치를 더한 다음 16으로 나눈 나머지로 위치 업데이트
- 소유할 수 있는 조건(해당 조건에 땅에 건물이 없고 시작점(더미)가 아닌 경우)
	- 해당 유저의 건물 수 추가
	- 해당 주사위판의 땅을 소유했다는 것을 1로 표시
	- 총 세운 건물 수를 추가
	- 소유할 수 없는 경우 그냥 지나감
- `play()`함수에서 만약 최대 소유 개수를 넘으면 바로 빠져나오도록 바닥조건 명시

### 3. 게임 시작 및 종료
```js
function game(diceCnt) {
  let diceData = dice(diceCnt);
  while (true) {
    let dice = diceData.pop().split(",").map(Number);
    let result = play(dice);
    if (owned === 15 || diceData.length === 0) {
      return result;
    }
  }
}

console.log(game(1));
```
- 내가 턴수를 입력하면 해당 턴수만큼 진행하도록 만듦
- `while(true)`가 무한루프에 갇힐 위험성이 있지만 바닥조건을 꼼꼼히 명시하여 탈출
	- 바닥조건
		- 주사위가 더 없을 때
		- 더 이상 소유할 땅이 없을 때


## 완성 코드

```js
let diceMap = new Array(16).fill(0);
let userOwn = new Map([
  ["A", 0],
  ["B", 0],
  ["C", 0],
  ["D", 0],
]);
let userLoc = {
  A: 0,
  B: 0,
  C: 0,
  D: 0,
};
let owned = 0;

const play = (dice) => {
  for (let i = 0; i < dice.length; i++) {
    let user;
    switch (i) {
      case 0:
        user = "A";
        break;
      case 1:
        user = "B";
        break;
      case 2:
        user = "C";
        break;
      case 3:
        user = "D";
        break;
    }
    let move = (userLoc[user] + dice[i]) % 16;
    userLoc[user] = move;
    if (diceMap[move] === 0 && move !== 0) {
      diceMap[move] = 1;
      userOwn.set(user, userOwn.get(user) + 1);
      owned++;
    }
    if (owned === 15) {
      return userOwn;
    }
  }
  return userOwn;
};

const dice = (cnt) => {
  let diceData = [];
  for (let i = 0; i < cnt; i++) {
    let diceList = [];
    for (let person = 0; person < 4; person++) {
      const random = Math.floor(Math.random() * 100);
      let moveCnt;
      if (random >= 0 && random < 25) {
        moveCnt = 1;
      } else if (random >= 25 && random < 50) {
        moveCnt = 2;
      } else if (random >= 50 && random < 75) {
        moveCnt = 3;
      } else if (random >= 75 && random < 100) {
        moveCnt = 4;
      }
      diceList.push(moveCnt);
    }
    diceData.push(diceList.join(","));
  }
  return diceData;
};

function game(turns) {
  let diceData = dice(turns);
  while (true) {
    let dice = diceData.pop().split(",").map(Number);
    let result = play(dice);
    if (owned === 15 || diceData.length === 0) {
      return result;
    }
  }
}

console.log(game(1));

```
