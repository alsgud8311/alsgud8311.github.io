# 문제 첫인상 및 정리

아무래도 챌린지 첫 날인만큼 너무 긴장하지 말라는 식으로 순수 JS만을 이용한 문제를 내준 것이 아닐까 싶다. 하지만 베이직때보다는 보다 복잡한 로직이 예상되어 각 기능별로 함수를 만들어 코드의 가독성을 높여야 할 것 같았다.

## 입력

- 프로그램에서는 표준 입력으로 `"시간대-참석인원-회의시간"` 형태로 반복해서 입력받으며 회의실별로 시간표를 출력하고, 다시 입력받는 것을 반복한다.
	- 이 부분은 반복해서 입력받는 과정에서의 예외처리가 중요하다고 생각한다. 무조건 배열은 다 돌아야 하기 때문에 예약이 안되는 상황같은 예외들이 많아질 수 있기 때문이다.
- 예약 요청은 문자열 배열로 시간대, 회의시간, 참석 인원이 쌍으로 제공된다.
    - 시간대는 오전 `AM` / 오후 `PM` 중에 하나만 가능하다.
    - 회의 시간은 1시간부터 4시간까지 가능하다.
    - 참석 인원은 2명부터 20명까지만 가능하도록 해야한다.
    - 예시) `AM-02-1` : 오전 시간대 2명 1시간 / `PM-15-2` : 오후 시간대 15명 2시간
## 회의실

- **A -> B -> C 순으로 예약**
- 참석 인원이 회의실 인원을 초과하면 예약할 수 없다.
- 오전이나 오후 4칸이 원하는 시간만큼 남지 않으면 더 이상 회의를 넣을 수 없으며 예약은 실패처리

### A회의실
- 참석가능인원 : 5
### B회의실
- 참석가능인원 : 10
### C회의실
- 참석가능인원 : 20

- 함수를 사용하며, 별도 타입을 선언하지 않아도 된다.
- 함수 하나가 10줄 이상 넘어가면 하위 함수로 분리하고, 상위 함수는 하위 함수를 호출한다.
- 함수 선언 이후에 들여쓰기 단계가 3단계를 초과하는 경우는 함수로 분리한다.
- 입력값을 받기 위해서 표준 입력 방식을 사용해도 되고, 소스코드 파일 안에서 함수를 호출하면서 입력값을 넣어도 된다.
- 결과는 VS Code 콘솔에 출력되어야 한다.
- 최종적으로 콘솔에 출력한 결과를 이미지로 캡처한다.
- 요구사항을 분석해서 스스로 할 일 체크리스트를 README.md에 작성한다.
- 체크리스트를 하나씩 완료할 때마다 소스와 실행 결과는 gist에 commit 한다. (Push는 한 번만 해도 무방하다.)

# 체크리스트

- 회의실 데이터 구조 설계
- 회의실 현황 출력 구조 설계
- 함수 분리해서 설계
	- 분리한 함수가 10줄 이상 넘어가면 하위 함수로 바꾸기
	- 들여쓰기 단계가 3단계를 초과하는 경우 함수로 분리
- 코드 합쳐 구현하기


## 회의실 데이터 구조 설계
회의실 데이터의 구조는 `Object`로 설정하면 어떨까 싶었다. 어차피 한 시간이 검정색 사각형 두 칸을 똑같이 차지하고, 만약 예약 대기가 생길 경우 이러한 예약들도 기록해놓은 다음 대기중인 예약을 보여줘야 할 기능이 있어야 하기 때문에 이러한 요소들을 `console.log`할 때는 보다 구조화된 데이터야 출력하기 쉬워질 수 있을 것 같았다. 
```js
function meetingRoom() {
  let reservation = {
    nowAmReservation: [],
    nowPmReservation: [],
    otherReservation: { am: [], pm: [] },
  };
  let A = { person: 5, ...reservation };
  let B = { person: 10, ...reservation };
  let C = { person: 20, ...reservation };
}
```
`spread`연산자를 사용한 이유는 함수 내에 10줄 이상 되지 않아야 한다는 조건이 붙었기 때문에 최대한 코드 수를 줄이고자 이렇게 설계했다.
...
라고 생각하고 나서 회의실 현황 출력 구조를 설계하는데 있어서 이름 속성이 따로 있다면 출력하기 더 편하겠다는 생각이 생겨 이름 속성을 각 미팅룸에 추가하였다.
추가적으로 어차피 출력 구조에서는 예약 현황만 보여주면 되기 때문에 시간만 필요하므로 굳이 오전과 오후 시간을 각각 배열에 넣고 배열을 돌기보다는 시간만 기록하는 것이 더 효율적이겠다 생각했다.

```js
function meetingRoom() {
  let reservation = {
    nowAmReservation: 0,
    nowPmReservation: 0,
    otherReservation: { am: 0, pm: 0 },
  };
  let A = { name: "A", person: 5, ...reservation };
  let B = { name: "B", person: 10, ...reservation };
  let C = { name: "C", person: 20, ...reservation };
}
```

## 회의실 현황 출력 구조 설계

구상한 데이터 구조를 통해 회의실 현황 구조를 함수 내부의 함수 실행을 통해 출력하려고 한다. 
### 출력 예시 분석
```
        |오|전|시|간||오|후|시|간|
----------------------------------
회의실 A|🁢🁢|🁢🁢|🁢🁢|  ||🁢🁢|  |  |  |
예약대기|🁢🁢|🁢🁢|  |  ||  |  |  |  |
----------------------------------
회의실 B|🁢🁢|🁢🁢|  |  ||🁢🁢|🁢🁢|  |  |
예약대기|  |  |  |  ||🁢🁢|🁢🁢|🁢🁢|  |
----------------------------------
회의실 C|  |  |  |  ||🁢🁢|  |  |  |
예약대기|  |  |  |  ||  |  |  |  |
----------------------------------

```
1. 보면 가장 위의 오전시간과 오후시간 앞 공간은 공백 8칸으로, \\t 을 통해 따로 공백을 들이지 않아도 간격을 똑같이 벌릴 수 있다.
2. 오전시간과 오후시간의 경우 `|오|전|시|간|`과 `|오|후|시|간`이 각각 붙어있는 것과 같은 형태로 보인다. 그렇기에 나중에 회의실 현황을 입력할 때도 오전시간과 오후 시간을 따로 처리하여 문자열로 붙이는 것이 괜찮을 것이라 판단된다.
3. 각 예약 현황을 보여주는 박스의 경우  배열에 시간의 수 만큼 블록을 만들었다.`join`하여 사이에 벽을 세워준 후 양쪽에도 |를 붙여 하나의 문자열로 만들고 출력하는 것이 보다 편해보였다.
4. 예약대기의 경우도 똑같이 설계하여 보여주되, 예약 대기의 경우 여러개가 있으면 무슨 웨이팅 대기줄마냥 너무 많아질 수 있기 때문에  예약 대기는 바로 다음에 이용 가능한 시간정도만 받고 이후의 예약 건에 대해서는 **예외처리**를 해주는 것이 낫다고 판단했다.
### 출력 관련 함수 설계
#### print()
```js
const print = () => {
    console.log("\t|오|전|시|간||오|후|시|간|");
    console.log("----------------------------------");
    printReservation(A);
    console.log("----------------------------------");
    printReservation(B);
    console.log("----------------------------------");
    printReservation(C);
  };
  print();
```
print 함수 자체는 `meetingRoom()`함수 내에서 출력해야 해당 객체를 안에서 넘길 수 있으므로 내부함수로 구현하였다. 오전시간과 오후시간 구분같은 경우 위에서 말한 대로 \\t만큼의 공백만 앞에 가져가고 구분을 직접 넣어주었다.
#### 현재 회의실 현황 출력함수 printReservation()
```js
const printReservation = (room) => {
  console.log(
    printPresentReservation(
      room.name,
      room.nowAmReservation,
      room.nowPmReservation
    )
  );
  printOtherReservation(room.otherReservation.am || room.otherReservation.pm) &&
console.log(printOtherReservation(room.otherReservation));
};
```
printReservation은 각 회의실의 객체를 받아 오전시간, 오후시간에 대한 예약 현황을 예약 대기와 현재 현황 모두 출력시켜주는 함수이다. 
예약대기의 경우에는 예약이 없을 경우 출력시킬 필요가 없으므로 논리연산자를 통해 조건부로 출렧킬 수 있도록 하였다.

#### 금일 예약된 회의실 출력함수 printPresentReservation()
```js
const printPresentReservation = (name, am, pm) => {
  return `회의실${name} ${makeBlockString(am)}${makeBlockString(pm)}`;
};
```
금일 예약된 회의실을 출력하는 함수의 경우 name,am,pm의 parameter를 받아 문자열을 받도록 하여 상위함수에서 출력하도록 하였다.
여기서 `makeBlockString()`은 각 시간대의 블록만큼 채워서 문자열로 리턴해주는 함수이다.

#### 시간 -> 블록이 찬 문자열로 바꿔주는 함수 makeBlockString()
```js
const makeBlockString = (rooms) => {
  const blank = "|  |  |  |  |";
  const filledRoom = "🁢🁢";
  const blankRoom = "  ";
  if (!rooms || rooms < 0 || rooms > 4) return blank; // Added bounds checking for `rooms`
  let result = "|";
  for (let i = 0; i < 4; i++) {
    result += (i < rooms ? filledRoom : blankRoom) + "|";
  }
  return result;
};
```
각 4시간의 블록들을 각각 시간에 따라 블록을 채운 문자열을 반환하는 함수이다. 
처음에 해당 함수를 만들 때 여러가지 방법을 생각했다.
- 배열의 활용
	-  블록으로 배열을 채운 후 join하는 방식을 생각했었지만 공백의 처리가 보다 길어질 것 같아 다른 방식을 물색했다.
- 문자열의 슬라이싱
	- `blank`와 `filled`변수에 각각 모두 빈, 찬 타임테이블을 할당하고 각각의 변수를 일정 인덱스만큼 슬라이싱 하여 붙이는 방법을 생각했다. 하지만 여기서 인덱스로 접근을 했을 때 다중 바이트 문자열인 블록때문에 인덱스에 맞는 문자열이 나오지 않았다.
- 직접 하나씩 문자열을 더하는 방법
	- 사실 가장 정석적으로 무난한 방법이라고 생각된다^^,,,

다른 방법을 사용했을 때보다 직접 하나씩 문자열을 더하는 방법이 가장 안전하고 출력 결과를 직관적으로 예상할 수 있어 문자열을 더하는 방식을 선택하였다. 


#### 예약 대기 현황 출력함수 printOtherReservation()
```js
const printOtherReservation = (reservation) => {
  if (reservation.am || reservation.pm) {
    return `예약대기${makeBlockString(reservation.am)}${makeBlockString(
      reservation.pm
    )}`;
  }
};
```
예약 대기 현황 출력해주는 함수의 경우도 똑같이 시간만큼 찬 블록을 문자열로 리턴해주는 함수를 사용하여 전체 문자열을 합친 문자열을 리턴시켰다.
특별한 점이라고 한다면 예약 대기가 오전, 오후 둘 다 없을 경우 따로 출력시켜야 하지 않아야 하기에 조건에 맞는 경우만 리턴시켜 리턴값이 undefined인 경우엔 출력시키지 않도록 하였다.

## 기타 함수 분리해서 설계
### 예외 케이스 검출하는 checkException()
```js
const checkException = (item) => {
  let [timeZone, person, time] = item.split("-");
  person = parseInt(person);
  time = parseInt(time);
  if (timeZone.toLowerCase() !== "am" && timeZone.toLowerCase() !== "pm")
    return false;
  if (person < 2 || person > 20) return false;
  if (time < 1 || time > 4) return false;
  return true;
};
```

checkException 함수는 각 예외 케이스에 대해 검출하는 로직을 가지고 있다. 생길 수 있는 예외는
- 시간대(am&pm)을 잘못 썼을 때
- 인원 수가 어떤 회의실에서도 받아줄 수 없을 때
- 시간이 1 미만 또는 5 이상으로 넣을 수 없는 시간일 때
가 있다.

### 해당하는 방을 배정하는 distributeRoom()
```js

const distributeRoom = (people) => {
  if (people <= 5) {
    return 0;
  } else if (people <= 10) {
    return 1;
  } else if (people <= 20) {
    return 2;
  }
};
```
사람 수가 들어갈 수 있는 조건만 맞다면 A->B->C 순으로 들어가라고 나와있었기 때문에 A,B,C 회의실을 배열에 넣고 돌려 처음으로 조건에 맞는 곳에 넣으려고 했지만 마스터 JK님이 A: 0~5, B: 5~ 10, C: 11~20 명으로 생각하라고 하셨다. 사실 현실적으로 보면 대부분 공간이 너무 많이 남는 곳은 빌려주지 않으니 보다 현실주의적인 로직이라고 생각한다.
아무튼 그래서 각 회의실이 어떤 인덱스를 가지는지 알기 때문에 배열로 들어간 회의실 안에 접근할 수 있도록 인덱스 번호를 리턴하였다.
이 외의 경우는 어차피 범위를 넘어가므로 그 전에 예외처리에서 걸러졌기 때문에 상관이 없다.

### 배정한 방 예약 처리하는 putPeopleInRoom()
```js
const putPeopleInRoom = (roomArr, timeZone, time, people) => {
  let roomName = distributeRoom(people);
  if (roomArr[roomName][timeZone] + time < 5) {
    roomArr[roomName][timeZone] += time;
  } else if (roomArr[roomName].otherReservation[timeZone] + time < 5) {
    roomArr[roomName].otherReservation[timeZone] += time;
  }
};
```
지금 보았는데 변수명이 오해의 소지가 있다. 사람의 수는 조건만 검증하는데 쓰이고 그냥 예약 시간을 추가하는 함수이다.

## 구현하는 과정에서 추가 및 변경된 것들
### 얇은 복사에 의한 에러 개선
```js
function meetingRoom() {
  let reservation = {
    nowAmReservation: 0,
    nowPmReservation: 0,
    otherReservation: { am: 0, pm: 0 },
  };
  let A = { name: "A", person: 5, ...reservation };
  let B = { name: "B", person: 10, ...reservation };
  let C = { name: "C", person: 20, ...reservation };
}
```
이전에 스프레드 연산자를 사용하여 다른 예약대기 객체를 함께 복사했었는데, 여기서 문제는 복사가 얇은 복사가 되어 참조값이 공유된다는 점이었다. 이 때문에 예약대기가 모두 같게 나오는 오류가 있었다.
이 때문에 서로 참조값을 공유하지 않은 객체들을 가질 수 있도록 만들어야 했는데, 나같은 경우는 따로 복사를 하기보단 새롭게 객체를 만드는 함수를 썼다.
```js
function makeRoom(name) {
  return {
    name: name,
    am: 0,
    pm: 0,
    otherReservation: { am: 0, pm: 0 },
  };
}

function meetingRoom() {
  let A = makeRoom("A");
  let B = makeRoom("B");
  let C = makeRoom("C");
  let roomArr = [A, B, C];
  ...이하생략
  }
```
이를 통해 함수의 라인을 조금 줄일 수 있었고, 보다 가독성이 좋아졌다고 생각한다.

### readline 모듈을 통한 input 받기
```js
  function inputInterface() {
    const regex = /^([AP]M)-(0[1-9]|1[0-9]|2[0-9])-([1-5])$/;
    const inputs = [];
    const question = () => {
      rl.question(
        "[AM/PM]-00(인원)-0(시간, 5시간 미만)의 순서대로 시간대-참석인원-회의시간을 적어주세요. \n끝내시려면 q를 입력하세요.",
        (line) => {
          if (line === "q") input(inputs);
          else if (regex.test(line)) {
            inputs.push(line);
            question();
          } else {
            console.log(
              "입력 형식에 맞지 않습니다.다시 입력해주세요. \n 끝내시려면 q를 입력하세요."
            );
            question();
          }
        }
      );
    };
    question();
  }
```
원래는 일반 배열을 함수의 parameter에 넣는 방식으로만 구현했었는데, 후에 체크포인트를 확인하고 입력을 따로 받을 인터페이스가 체크포인트에 들어있어 추가해야 할 필요성을 느꼈다.
이에 `inputInterface()`함수를 만들어 readline 모듈을 사용한 질문 입력 로직을 구상했다.
질문 입력의 경우
- 질문을 출력하면서 입력 받기
- 정규표현식을 통해 받은 입력을 테스트
	- 테스트 통과 시 나중에 함수에 파라미터로 넣을 배열에 `push`
	- 테스트를 통과하지 못했을 시 다시금 입력 형식에 맞게 입력하도록 출력
- 이러한 입력은 q버튼을 누를 때까지 q를 입력한 경우를 제외하고 다시금 qustion 함수를 실행시켜 무한반복되도록 설계하였다.


## 코드 합쳐 구현
```js
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function makeRoom(name) {
  return {
    name: name,
    am: 0,
    pm: 0,
    otherReservation: { am: 0, pm: 0 },
  };
}

function meetingRoom() {
  let A = makeRoom("A");
  let B = makeRoom("B");
  let C = makeRoom("C");
  let roomArr = [A, B, C];
  const print = () => {
    let waitingReservation;
    console.log("\t|오|전|시|간||오|후|시|간|");
    console.log("----------------------------------");
    waitingReservation = printReservation(A, waitingReservation);
    console.log("----------------------------------");
    waitingReservation = printReservation(B, waitingReservation);
    console.log("----------------------------------");
    waitingReservation = printReservation(C, waitingReservation);
  };

  const input = (item) => {
    if (checkException(item)) {
      let [timeZone, person, time] = item.split("-");
      person = parseInt(person);
      time = parseInt(time);
      putPeopleInRoom(roomArr, timeZone.toLowerCase(), time, person);
    }
    print();
  };
  function inputInterface() {
    const regex = /^([AP]M)-(0[1-9]|1[0-9]|2[0-9])-([1-5])$/;
    const inputs = [];
    const question = () => {
      rl.question(
        "[AM/PM]-00(인원)-0(시간, 5시간 미만)의 순서대로 시간대-참석인원-회의시간을 적어주세요. \n끝내시려면 q를 입력하세요.",
        (line) => {
          if (line === "q") {
            print();
            process.exit();
          } else if (regex.test(line)) {
            input(line);
            question();
          } else {
            console.log(
              "입력 형식에 맞지 않습니다.다시 입력해주세요. \n 끝내시려면 q를 입력하세요."
            );
            print();
            question();
          }
        }
      );
    };
    question();
  }
  inputInterface();
}

const printReservation = (room, waitingReservation) => {
  console.log(printPresentReservation(room.name, room.am, room.pm));
  if (
    room.otherReservation.am ||
    room.otherReservation.pm ||
    waitingReservation
  ) {
    console.log(printOtherReservation(room.otherReservation));
    return true;
  }
};

const printPresentReservation = (name, am, pm) => {
  return `회의실${name} ${makeBlockString(am)}${makeBlockString(pm)}`;
};

const printOtherReservation = (reservation) => {
  return `예약대기${makeBlockString(reservation.am)}${makeBlockString(
    reservation.pm
  )}`;
};

const makeBlockString = (rooms) => {
  const blank = "|  |  |  |  |";
  const filledRoom = "🁢🁢";
  const blankRoom = "  ";
  if (!rooms || rooms < 0 || rooms > 4) return blank;
  let result = "|";
  for (let i = 0; i < 4; i++) {
    result += (i < rooms ? filledRoom : blankRoom) + "|";
  }
  return result;
};

const checkException = (item) => {
  let [timeZone, person, time] = item.split("-");
  person = parseInt(person);
  time = parseInt(time);
  if (timeZone.toLowerCase() !== "am" && timeZone.toLowerCase() !== "pm")
    return false;
  if (person < 2 || person > 20) return false;
  if (time < 1 || time > 4) return false;
  return true;
};

const putPeopleInRoom = (roomArr, timeZone, time, people) => {
  let roomName = distributeRoom(people);
  if (roomArr[roomName][timeZone] + time < 5) {
    roomArr[roomName][timeZone] += time;
  } else if (roomArr[roomName].otherReservation[timeZone] + time < 5) {
    roomArr[roomName].otherReservation[timeZone] += time;
  }
};

const distributeRoom = (people) => {
  if (people <= 5) {
    return 0;
  } else if (people <= 10) {
    return 1;
  } else if (people <= 20) {
    return 2;
  }
};

meetingRoom();

```
구현된 함수들을 조합하여 완성된 형태가 되었다. 


# 회고
이전에는 하나의 함수에 우겨넣는 코드를 짰었는데, 각 함수가 10줄 미만이라는 제한을 가지고 코드를 짜다보니 훨씬 오랜시간이 걸렸지만, 그만큼 설계를 하면서 설계에 대한 감각이 보다 늘은 것 같아 의미 있는 경험이었다.