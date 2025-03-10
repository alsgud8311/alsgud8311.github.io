# 어벤저스 보드게임

## 체크포인트

- [x] 요구조건 분석 ✅ 2024-07-22
- [x] Board 클래스 설계 및 구현 ✅ 2024-07-22
- [x] Game 클래스 설계 및 구현 ✅ 2024-07-22
- [ ] Ultron 클래스 설계 및 구현
- [ ] BlackWidow 클래스 설계 및 구현
- [ ] Hulk  클래스 설계 및 구현
- [ ] CaptainAmerica 클래스 설계 및 구현
- [ ] IronMan 클래스 설계 및 구현
- [ ] HawkEye 슨배님 클래스 설계 및 구현
- [ ] Thor 클래스 설계 및 구현


# 요구조건 분석
### 보드 구성
- 5 \* 6 (row 5, column 6) 
- 행에서 최소 0개에서 3개 캐릭터만 배치 
- 현재 남아있는 캐릭터 확인 후 체력 점수 총합 출력
- 모든 말의 위치를 간접적으로 알 수 있음
- 메소드 display() -> A행부터 E행까지 전체를 행 단위로 리턴
	- 문자열 배열 x 데이터 구조 리턴
	- Board에서 return한 데이터 구조를 바탕으로 출력 형식을 담당하는 객체에서 문자열 배열로 바꾸고 출력
	- 각 캐릭터 2문자

=> 여기에서 주목해야 할 점은 display()함수이다. display 함수의 설명에 A행부터 E행까지 전체를 행 단위로 리턴하라고 했지만, 출력을 위한 문자열 배열이 아니어야 한다. 이말인 즉슨 board에서 2차원 배열로 각 캐릭터의 위치를 관리하게 된다면 display 함수를 호출할 때 출력을 위한 문자열 배열로 리턴할 수밖에 없기 때문에 2차원 배열을 지양하라는 의도로 이해했다.
따라서 나는 각각의 캐릭터 위치를 객체를 통해 알 수 있도록 하는 방식이 보다 적합해 보였다.
```js
this.board = {
	A:{
		1: null,
		2: null,
		3: null,
		4: null,
		5: null,
		6: null
	},
	B:{
		1: null,
		2: null,
		3: null,
		4: null,
		5: null,
		6: null
	}
	... E까지
}
```
이러한 구조로 된 보드를 생각해 보았다. 이렇게 된다면 각 행 단위로 문자열이 아닌 타입을 포함하는 데이터 구조를 리턴할 수 있다.

### 작동 인터페이스
- 사용자와 컴퓨터 반복 입력
- 자신의 차례가 아니면 다시 입력
- 공격하는 나의 캐릭터와 상대편 목표 지점을 차례로 입력받아서 공격
	- 캐릭터 문자(2자리) -> 공격 위치(2자리) 형태
- 공격한 곳에 상대편 캐릭터가 있다면 HIT, 없으면 MISS 출력
	- HIT -> 공격 포인트만큼 HP 감소
	- HP가 0이 되면 해당 캐릭터 사라짐
- 상대편이 자신을 공격해서 5번 HIT마다 나의 특정 캐릭터를 다른 위치로 이동 가능
- 입력값이 ?이면 상대편 보드에서 가장 캐릭터가 많이 배치된 row 출력
	- 1번만 가능(boolean)
### 위치 배치
- 랜덤한 10개 캐릭터 고르고 위치에 배치(중복 가능)
- Ultron은 항상 3개 배치
- BW, CA, TH는 최소한 1개씩 배치
- HK는 최대 1개만 배치가 가능
- BW, IM, HE는 최대 2개까지 배치가 가능
### 함수들
#### 특정 캐릭터 초기 조건 생성하기 함수
- 특정 위치에 특정 캐릭터를 생성하는 함수를 구현한다
    - 이 함수는 초기 위치가 아니면 생성하지 않는다.
    - 이미 해당 위치에 다른 말이 있으면 생성하지 않는다.
    - 캐릭터 종류별로 최대 개수보다 많이 생성할 수는 없다.
    - Ultron 캐릭터는 최대 3개. Avengers는 최대 2개까지 가능하다.
    - 생성하지 않는 경우는 exception 예외처리로 상위에서 어떤 예외상황인지 판단한다.
        

#### 특정 캐릭터 무조건 생성하기 함수
- 특정 위치에 특정 캐릭터를 생성하는 함수를 구현한다.
    - 바로 직접 조건 생성함수와 다르게 어떤 캐릭터든지 어느 위치에 놓아도 상관없다.
    - 이미 해당 위치에 다른 말이 있으면 생성하지 않는다.        
    - 최대 개수도 고려하지 않는다.
        

#### 특정 위치 공격 함수
- 입력받은 특정 위치를 공격할 때는 Board에서 제공하는 함수를 사용한다.
    - 내가 공격하려는 캐릭터를 전달하고,
    - 공격하는 to 위치에 캐릭터가 있을 때만 동작한다.
    - 해당 자리에 캐릭터가 있으면 규칙에 따라 남은 HP를 반환하고, HP가 0이 되거나 위치에 캐릭터가 없으면 0을 반환한다.

해당 함수들은 조건 생성과 무조건 생성, 공격 함수로 Board에 들어가야 할 메소드들이다. 
위치 배치 조건을 보면 각 캐릭터에게 부여된 최소, 최대, 필수 캐릭터 개수가 주어진다.
특히 필수 캐릭터 개수가 주어진 Ultron의 경우 3개, BW, CA, TH를 1개씩 배치해야 하므로 6개가 필수적인 캐릭터 개수이다. 최소, 최대, 필수 캐릭터에 대한 검증, 위치에 대한 검증이 필요하다.
내가 이해한 바로는 두 개의 생성 함수의 역할은
- 특정 캐릭터 초기 조건 생성 함수 -> 개수를 판단하여 조건에 맞는(최소, 최대, 필수 검증) 캐릭터를 선택한 후 특정 캐릭터 무조건 생성 함수로 전달
- 특정 캐릭터 무조건 생성하기 함수 -> 받은 캐릭터에 대해 무작위로 위치를 생성하고 배치. 만약 해당 칸에 캐릭터가 있다면 다른 위치를 재생성
 이다.
 따라서 특정 캐릭터 초기 조건 생성 함수가 특정 캐릭터 무조건 생성하기 함수의 상위 함수가 되어 함수 안에서 함수를 호출하는 형태로 생각하였다.

### 캐릭터 조건
#### 캐릭터 공통조건
- 위치값을 저장할 Position 타입 -> **별도의 데이터 구조**를 만들어야 함. 
	- row의 경우 -> A -> E까지
	- column의 경우 -> 1부터 6까지
	- row와 column 값은 enum으로 선언
```js
// enum의 경우 uppercase로 표기
const POSITION = {
	ROW: {
		A: 0,
		B: 1,
		C: 2,
		D: 3,
		E: 4
	},
	COL: {
		1: 0,
		2: 1,
		3: 2,
		4: 3,
		5: 4,
		6: 5
	}
}
```
- 캐릭터는 확실하게 구분되어야 한다.
	- 상태값으로 지정한다면 생성할 때 결정하고 변경
	- 타입으로 구분한다면 다형성으로 동작
	-> 편을 구분하는 경우 어차피 플레이어와 컴퓨터 두 가지로밖에 구분이 되지 않기 때문에 boolean값을 이용하여 isPlayer Property를 추가하면 될 것 같다.
#### Ultron(UL)
- 이동 : 좌우
- HP: 400
- 공격력: 40
- 한도: 3개(무조건 3개)

#### Black Widow(BW)
- 이동: 전후좌우
- HP: 400
- 공격력: 10
- 한도: 2개(최소 1개 이상)
#### IronMan(IM)
- 이동: 대각선
- HP: 600
- 공격력: 40
- 한도: 2개
#### HULK(HK)
- 이동: 위아래
- HP: 800
- 공격력: 50
- 한도: 1개
#### HawkEye
- 이동: 불가능(호크아이 슨배임,,,,)
- HP: 500
- 공격력: 20
- 한도: 2개
#### Thor
- 이동: 모든 방향 다 가능(퀸)
- HP: 900
- 공격력: 50
- 한도: 2개(최소 1개 이상)
#### CaptainAmerica
- 이동: 전후좌우
- HP: 700
- 공격력: 30
- 한도: 2개(최소 1개 이상)

각 캐릭터는 HP, 공격력, 이동(이 속성은 나중에 공격하는 메소드마다 공격 범위를 정하면 될 것 같아서 계속 생각 중이다.) 속성을 지닌다. 한도의 경우 맨 처음 캐릭터를 생성할 때 따로 테이블을 두고 관리를 하면 될 것 같아서 굳이 추가할 필요는 없을 것 같다.

캐릭터마다 공통적으로 HP, 공격력이라는 property를 가지고 있기 때문에 공통적인 속성을 가진 부분은 Avengers class에 상속시킨 형태로 코드를 보다 가독성있게 할 수 있지 않을까 생각해보았다.
```js
class Avengers {
	constructor(hp,atk){
		this.hp = hp,
		this.atk = atk
	}
}
...
class Thor extends Avengers {
	attack() {
		//각 영웅별 공격하기 함수
	}
}
```

# 설계 및 구현 
## Board 클래스 설계 및 구현
### 기본적인 board 배치 구현
가장 먼저 Board 클래스이다.
```js
this.board = {
	A:{
		1: null,
		2: null,
		3: null,
		4: null,
		5: null,
		6: null
	},
	B:{
		1: null,
		2: null,
		3: null,
		4: null,
		5: null,
		6: null
	}
	... E까지
}
```
Board 클래스에는 이러한 형식으로 된 보드를 미리 만들어 놓으려고 한다.
하지만 클래스에 이렇게 우구장창 때려넣으면 코드가 더러울 것 같아 가독성을 높이고자 따로 init하는 클래스를 만들고 상속시키려 한다.
```js
class initBoard {
  constructor() {
    this.board = {
      A: rowInit(),
      B: rowInit(),
      C: rowInit(),
      D: rowInit(),
      E: rowInit(),
    };
  }
}

const rowInit = () => {
  return {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  };
};

```

처음 board가 만들어질 때 랜덤한 캐릭터를 10개 가진 채로 board가 나와야 한다. 
그러므로 해당 board에 특정 캐릭터 초기 조건 생성하기 함수와 특정 캐릭터 무조건 생성하기 함수를 적절히 실행하여 board에 넣어주도록 하자.
먼저 필수적으로 넣어줘야 하는 캐릭터들에 대해서 넣어준 뒤에, 나머지 캐릭터들을 무작위로 생성하여 넣어줘야 한다.

```js
export class InitBoard {
  constructor() {
    [this.totalHP, this.board] = initFullBoard();
  }
}
const initFullBoard = () => {
  let board = {
    count: { A: 0, B: 0, C: 0, D: 0, E: 0 },
    A: rowInit(),
    B: rowInit(),
    C: rowInit(),
    D: rowInit(),
    E: rowInit(),
  };
  return initCharactersInBoard(board);
};
const rowInit = () => {
  return {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  };
};
```
가장 먼저 해야할 것은 각각의 row에 대해 인덱스를 만들어 주는 일이다.
이 과정은 그저 객체생성하는 함수를 만들어 배열에 할당하면 되므로 간단하다.

### 특정 캐릭터 무조건 생성하기 함수
```js


// 랜덤으로 위치 정하기
const getRandomLoaction = () => {
  const row = Math.floor(Math.random() * 5);
  const column = Math.floor(Math.random() * 6);
  return [row, column];
};

// 특정 캐릭터 무조건 생성하기 함수
const locateCharacters = (character, board, characterTable) => {
  let row, col;
  while (true) {
    [row, col] = getRandomLoaction();
    row = POSITION.ROW[row];
    col = POSITION.COL[col];
    if (!board[row][col] && board["count"][row] < 3) break;
  }
  board[row][col] = generateCharacterInstance(
    character,
    `${row}${col}`,
    characterTable
  );
  board["count"][row]++;
  return board;
};

const generateCharacterInstance = (character, position, characterTable) => {
  let instance;
  switch (character) {
    case "Ultron":
      instance = new Ultron(position);
      break;
    case "BlackWidow":
      instance = new BlackWidow(position);
      break;
    case "Hulk":
      instance = new Hulk(position);
      break;
    case "IronMan":
      instance = new IronMan(position);
      break;
    case "HawkEye":
      instance = new HawkEye(position);
      break;
    case "Thor":
      instance = new Thor(position);
      break;
    case "CaptainAmerica":
      instance = new CaptainAmerica(position);
      break;
    default:
      throw new Error("없는 어벤저스입니다.");
  }
  characterTable[character].push(instance);
  return instance;
};
```
여기부터는 구현하는데 상당히 까다로웠던 함수들이다.
해당 함수는 생성 함수 중 **'특정 캐릭터 무조건 생성하기 함수'** 이다.
앞서 말했던 것처럼, 무조건 생성 함수의 경우 개수에 고려없이 생성하는 함수이므로 파라미터에 이름만 받아 빈 공간을 찾은 뒤 클래스를 할당하는 방식으로 구현하였다.

자바스크립트에서는 Enum이 없으므로 따로 Enum 객체를 만들어 넘긴 위치에 따라 객체의 property로 갈 수 있도록 교체해 주었다.

### 특정 캐릭터 초기 조건 생성하기 함수

```js
// 필수로 들어가야 하는 어벤저스 넣는 함수
const locateMinCharacters = (board, characterTable) => {
  locateCharacters("Ultron", board, characterTable);
  locateCharacters("Ultron", board, characterTable);
  locateCharacters("Ultron", board, characterTable);
  locateCharacters("CaptainAmerica", board, characterTable);
  locateCharacters("BlackWidow", board, characterTable);
  locateCharacters("Thor", board, characterTable);
};

const getRandomCharacter = () => {
  return Math.floor(Math.random() * 7);
};

// 특정 캐릭터 초기 조건 생성하기 함수
const initCharactersInBoard = (board) => {
  let characterTable = initCharacterTable();
  let characterCount = AVENGERS_COUNT();
  let curr = 6;
  let totalHP = 3200;
  locateMinCharacters(board, characterTable);
  while (curr < 10) {
    let characterIdx = getRandomCharacter();
    let character = AVENGERS_INFO[characterIdx];
    if (characterCount[character.name] + 1 <= character.limit) {
      totalHP += character.hp;
      curr++;
      characterCount[character.name]++;
      locateCharacters(character.name, board, characterTable);
    }
  }
  return [totalHP, board, characterTable];
};

```
특정 캐릭터 초기 조건 생성하기 함수에서는 앞서 말한 대로 위치는 하위 함수인 '특정 캐릭터 무조건 생성하기 함수'에 일관하고 해당 함수에서는 
1. 최소 n개 이상 들어가야 하는 어벤저스 넣기
2. 특정 캐릭터를 랜덤으로 뽑고, 또 그러한 캐릭터가 각 캐릭터의 limit을 넘지 않는지 확인
3. limit를 넘지 않는 캐릭터를 뽑기
4. 뽑은 캐릭터를 '특정 캐릭터 무조건 생성하기 함수'를 통해 할당
5. board에 할당한 뒤 totalhp와 board 업데이트

해서 만들어진 board와 HP를 리턴한다.
해당 함수에서도 각 영웅의 명수를 셀 수 있는 AVENGERS_COUNT와 해당 어벤저스의 정보를 담은 AVENGERS_INFO Enum을 사용하였다.
추가적으로 나중에 attack할 경우를 대비하여 characterTable에도 참조값을 공유하는 클래스를 넣어뒀다.

```js
export const AVENGERS_COUNT = () => {
  return {
    Ultron: 3,
    BlackWidow: 1,
    CaptainAmerica: 1,
    Thor: 1,
    HawkEye: 0,
    IronMan: 0,
    Hulk: 0,
  };
};

const InitAvengersInfo = (name, limit, hp) => {
  return {
    name: name,
    limit: limit,
    hp: hp,
  };
};

export const AVENGERS_INFO = {
  0: InitAvengersInfo("Ultron", 3, 400),
  1: InitAvengersInfo("BlackWidow", 2, 400),
  2: InitAvengersInfo("Hulk", 1, 800),
  3: InitAvengersInfo("CaptainAmerica", 2, 700),
  4: InitAvengersInfo("IronMan", 2, 600),
  5: InitAvengersInfo("HawkEye", 2, 500),
  6: InitAvengersInfo("Thor", 2, 900),
};
```
Enum은 이러한 형식으로 되어 있어 각각의 limit에 접근해 조건을 검사하고, hp를 뽑아 totalHP를 업데이트한다.

이렇게 initBoard 클래스가 생성되면 이를 상속하는 Board 클래스를 따로 두었다.
```js
import { InitBoard } from "./initboard.mjs";

export class Board extends InitBoard {
  constructor(isPlayer) {
    super();
    this.isPlayer = isPlayer;
    this.hitCount = 0;
  }

// 상태 출력
  display() {
    let data = Object.values(this.board).slice(1);
    console.log(data);
    data = data.map((row) => Object.values(row));
    return data;
  }

// 공격하기
  attack(character, to) {
    this.hitCount++;
    let userCharacter = this.characterTable[character];
    if (userCharacter.length === 0) {
      return "MISS";
    } else {
      for (let char of userCharacter) {
        if (char.attack(to)) {
          return `HIT${this.hitCount}`;
        }
      }
      return "MISS";
    }
  }

  move(from, to) {
    if (this.board[from[0]][from[1]] && !this.board[to[0]][to[1]]) {
      if (this.board[from[0]][from[1]].move(to)) {
        console.log("이동에 성공했습니다.");
        return;
      }
    } else {
      console.log(
        "이동할 위치에 영웅이 있거나 이동시킬 위치에 영웅이 없습니다."
      );
    }
  }
}

```
### 공격하기
공격의 경우 무조건 성공과 실패여부에 상관없이 hitCount가 늘어나기 때문에 가장 앞에 추가해주었다.
공격을 할 때는 기존에 추가해뒀던 characterTable을 활용하였다.
일단 오류가 날 만한 상황들에 대해 조건을 걸었다.
- 해당 영웅이 하나도 없을 때
- 공격에 실패할 때
각 조건을 걸어준 다음 가장 먼저 공격을 해서 성공하는 경우에 return하도록 해주었다.

### 이동하기
이동의 경우에도 조건이 있다.
- 지정한 from 위치에 영웅이 있는지
- 있다면 가려는 to 위치에 영웅이 있는지
이 두가지 조건을 모두 만족해야 영웅이 이동할 수 있고, 영웅의 move 메소드를 실행시켰다.
## Game 클래스 설계 및 구현

```js
import { Board } from "./board.mjs";
import { AVENGERS_SHORTNAME, POSITION } from "./constants.mjs";
import { displayProcessing } from "./utils.mjs";

// gameState = {
//   0: "DEFAULT(attack)",
//   1: "MOVE",
//   2: "END",
// };

export class Game {
  constructor() {
    this.player = new Board(true);
    this.computer = new Board(false);
    this.state = 0;
    this.showComputerBoard = false;
  }
  // 플레이어 상태 display
  display(user) {
    let data = user.display();
    data = displayProcessing(data);
    console.log(`HP = ${user.totalHP}\n`);
    console.log(`받은 데미지 = ${user.damage}\n`);
    console.log(` |01|02|03|04|05|06|\n`);
    data.forEach((row, index) => {
      console.log(`${POSITION.ROW[index]}|${row.join("|")}|\n`);
    });
    console.log(` |01|02|03|04|05|06|\n`);
  }

  // attack할 경우
  attack(character, to) {
    this.player.attack(character, to, this.computer);
    if (
      this.computer.board[to[0]][to[1]] &&
      this.computer.board[to[0]][to[1]].hp <= 0
    ) {
      this.computer.dead.push(this.computer.board[to[0]][to[1]]);
      this.computer.board[to[0]][to[1]] = null;
    }
    this.computer.computedAttack(this.player);
    if (this.player.hitCount % 5 === 0 && this.player.hitCount > 0)
      this.state = 1;
    if (this.player.dead.length > 1 || this.computer.dead.length > 1)
      this.state = 2;
  }
  result() {
    if (this.player.dead.length >= 2) {
      this.player.dead.forEach((char) => {
        console.log(AVENGERS_SHORTNAME[char.name]);
      });
      console.log("컴퓨터가 승리했습니다.");
    } else {
      this.computer.dead.forEach((char) => {
        console.log(AVENGERS_SHORTNAME[char.name]);
      });
      console.log("플레이어가 승리했습니다");
    }
  }

  // 이동 기회가 주어졌을 경우
  move(from, to) {
    this.player.move(from, to);
    this.state = 0;
  }
}

```
### attack함수
Game 클래스같은 경우에 player와 computer를 놓고 각 명령어마다 둘 다 처리될 수 있도록 설계했다. computer의 경우에는 자동으로 위치를 선정하고, 그 위치에 대해 attack 처리를 해야 하기 때문이다. 
실행하는 board의 attack함수는 아래와 같다.
```js
  attack(character, to, user) {
    let success = false;
    character = AVENGERS_SHORTNAME[character];
    let userCharacter = this.characterTable[character];
    if (userCharacter.length === 0) {
      console.log("MISS");
      return;
    } else {
      for (let char of userCharacter) {
        if (char.attack(to, user)) {
          success = true;
        }
      }
    }
    if (success) {
      user.hitCount++;
      console.log(`HIT(${user.hitCount})`);
    } else console.log("MISS");
  }

  //컴퓨터가 공격할 때 -> 무조건 맞게끔
  computedAttack(user) {
    let success = false;
    let characterIdx = getRandomCharacter();
    let character = AVENGERS_INFO[characterIdx].name;
    let to = getRandomPosition();
    console.log(
      `컴퓨터가 입력합니다> ${AVENGERS_INFO[characterIdx].shortname}->${to}`
    );

    if (this.characterTable[character].length === 0) {
      console.log("MISS");
      return;
    } else {
      for (let char of this.characterTable[character]) {
        if (char.attack(to, user)) {
          success = true;
        }
      }
    }
    if (success) {
      user.hitCount++;
      console.log(`HIT(${user.hitCount})`);
    } else console.log("MISS");
  }
```
나같은 경우는 **영웅이 여러명일 경우에 어떤 영웅을 선택해야 할까?** 에 대한 기준이 모호했다. 따라서 그냥 존재하는 영웅들을 영웅별로 관리하고, 해당 이름의 영웅들이 전부 다 공격하게 했다.


### result 함수
```js
  result() {
    if (this.player.dead.length >= 2) {
      this.player.dead.forEach((char) => {
        console.log(AVENGERS_SHORTNAME[char.name]);
      });
      console.log("컴퓨터가 승리했습니다.");
    } else {
      this.computer.dead.forEach((char) => {
        console.log(AVENGERS_SHORTNAME[char.name]);
      });
      console.log("플레이어가 승리했습니다");
    }
  }
```
result 함수의 경우 종료 조건을 정해야 했는데, 나같은 경우는 울트론 3마리까지 잡기 귀찮아서 가장 먼저 캐릭터 2명을 잡는 플레이어가 이기는 것으로 선정했다.
이를 위해 각 Board에서 property로 배열을 선언하여 캐릭터가 죽을 때마다 해당 영웅의 정보를 push해서 나중에 꺼낸 다음 이름만 출력하는 식으로 설계했다.

이 메소드는 상태가 2값, 즉 끝나는 상태로 바뀔 때 실행되도록 해놨는데, 이를 판단하여 상태값을 바꾸는 때는 Game 클래스에서 attack이 실행될 때마다 판단하여 상태값을 바꿔주었다.

```js
  // Game 클래스의 attack 메소드
  attack(character, to) {
...
    if (this.player.dead.length > 1 || this.computer.dead.length > 1)
      this.state = 2;
  }
```


해당 클래스에서 가장 중요한 점은 게임의 상태를 숫자로 표현하여 각 숫자마다 gameLoop에서 switch문을 통해 받아들어야 할 값과 질문을 구분한 것이다. 이러한 상태의 구분을 통해 보다 상황에 맞도록 switching하기 용이해졌다.

### Display 함수
display 함수의 경우 기존 가지고 있던 Board 클래스의 board 데이터를 가지고 처리한다.
```js
  display() {
    let data = Object.values(this.board).slice(1);
    data = data.map((row) => Object.values(row));
    return data;
  }
```
Display 함수에서 첫번째 카운터를 제외하고 잘라 데이터를 displayProcessing으로 보낸다.
```js
//utils.js
export function displayProcessing(rows) {
  rows = rows.map(rowProcessing);
  return rows;
}

function rowProcessing(row) {
  return row.map((elem) => {
    if (!elem) return "..";
    else return elem.name;
  });
}

```
utils.js라는 파일을 만들어 여기에서 각종 데이터 처리에 필요한 함수들을 담아두었다.
이렇게 받은 객체 데이터를 다시금 바꾸어 출력형식을 위한 배열로 바꾼 후에 출력시켜 주었다.

### Game 인터페이스
```js
import { Game } from "./game.mjs";
import readline from "readline";
import { handleAttack, handleMove } from "./utils.mjs";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function playGame() {
  console.log("어벤저스 보드를 초기화했습니다.\n");
  let game = new Game();
  game.display(game.player);
  gameLoop(game);
}

function gameLoop(game) {
  switch (game.state) {
    case 0:
      rl.question("명령을 입력하세요: ", (line) => {
        handleAttack(line, game);
        game.display(game.player);
        gameLoop(game);
      });
      break;
    case 1:
      rl.question(
        "이동할 기회가 있습니다. 이동 위치를 입력하세요: ",
        (line) => {
          handleMove(line, game);
          game.display(game.player);
          gameLoop(game);
        }
      );
      break;
    case 2:
      console.log("캐릭터 둘이 죽어 게임이 종료되었습니다.");
      console.log("죽은 캐릭터");
      game.result();
      rl.close();
      break;
    default:
      console.log("알 수 없는 게임 상태입니다.");
      rl.close();
      break;
  }
}

playGame();


```
게임 인터페이스의 경우 내가 명령을 받고, 명령을 또 실행한 뒤에 다시 종료 조건까지 실행시켜야 한다. 그래서 gameLoop 함수를 만들어 계속해서 실행할 수 있도록 해주었다.
handleAttack과 handleMove의 경우 각 게임에 대해서 직접적인 attack, move 함수를 실행시키기 전에 파싱한 다음 실행시켜줄 수 있도록 하였다.

```js
export function handleAttack(line, game) {
  const regex = /^[A-Z]{2}->[A-Z][0-9]$/;
  if (line === "?") {
    if (game.showComputerBoard) {
      console.log("게임에서는 한 번만 컴퓨터의 상태를 볼 수 있습니다.");
      return;
    }
    console.log("컴퓨터 상태 보기");
    game.display(game.computer);
    console.log("--------------------\n");
    game.showComputerBoard = true;
    return;
  }
  if (regex.test(line)) {
    let [character, to] = line.split("->");
    game.attack(character, to);
  } else {
    console.log("형식이 올바르지 않습니다.");
  }
}

export function handleMove(line, game) {
  const regex = /^[A-E][1-6]->[A-E][1-6]$/;
  if (line === "?") {
    if (game.showComputerBoard) {
      console.log("게임에서는 한 번만 컴퓨터의 상태를 볼 수 있습니다.");
      return;
    }
    game.display(game.computer);
    game.showComputerBoard = true;
    return;
  }
  if (regex.test(line)) {
    let [from, to] = line.split("->");
    game.move(from, to);
  } else {
    console.log("형식이 올바르지 않습니다.");
  }
}
```

명령어를 처리하는 과정에서 ?를 통해 상대의 상태를 볼 수 있는 한번의 기회를 사용할 수 있도록 해주었다. 이 기회는 불리언값으로 관리하여 한 번 이후에는 다시 조회할 수 없다.
명령어가 아닌 경우에는 정규표현식으로 검사한 뒤에 split하여 각각의 함수를 실행시켜 주었다.

## Avengers 클래스 설계 및 구현
사실 요구조건 분석과 설계까지만 해도 영웅들에게 공통적인 요소가 체력과 공격력밖에 없다고 생각했다. 하지만 설계를 해나가면서 영웅들이 공격할 때 해당 값에 공격력을 빼주고 board 클래스를 업데이트하는 로직이 같아 이를 같이 묶어주고, 파라미터로 객체를 받아 실행할 수 있게 해주었다.
```js
export class Avengers {
  constructor(hp, atk) {
    this.hp = hp;
    this.atk = atk;
  }
  attack(to, user) {
    if (user.board[to[0]][to[1]]) {
      user.board[to[0]][to[1]].hp -= this.atk;
      user.totalHP -= this.atk;
      user.damage += this.atk;
      return true;
    } else return false;
  }
}

```
## Ultron 클래스 설계 및 구현

```js
import { Avengers } from "./avengers.mjs";

export class Ultron extends Avengers {
  constructor(position) {
    super(400, 40);
    this.name = "UL";
    this.position = position;
  }
  move(to, board) {
    if (!board[to[0]][to[1]]) {
      if (this.position[0] === to[0]) {
        board[to[0]][to[1]] = board[this.position[0]][this.position[1]];
        board[this.position[0]][this.position[1]] = null;
        this.position = to;
        console.log(`영웅이${to}로 이동했습니다.`);
      }
    } else {
      console.log("이동할 곳에 다른 영웅이 있습니다.");
    }
  }
}

```
울트론의 이동 경우, 좌우로만 움직일 수 있기 때문에 row가 같으면 움직일 수 있도록 조건을 걸어주었다.
## HawkEye 클래스 설계 및 구현
```js
import { Avengers } from "./avengers.mjs";

export class HawkEye extends Avengers {
  constructor(position) {
    super(500, 20);
    this.name = "HE";
    this.position = position;
  }
  move(to, board) {
    console.log("호크아이 슨배임은 움직일 수 없습니다.");
  }
}

```
호크아이 슨배임은 여기서도...

![][https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx1CM4Oq87kj-xjUZ01z0Vm6_8oivvufkE3Q&s]

## Hulk 클래스 설계 및 구현
```js
import { Avengers } from "./avengers.mjs";

export class Hulk extends Avengers {
  constructor(position) {
    super(800, 50);
    this.name = "HK";
    this.position = position;
  }
  move(to, board) {
    if (!board[to[0]][to[1]]) {
      if (this.position[1] === to[1] && this.position[0] !== to[0]) {
        board[to[0]][to[1]] = board[this.position[0]][this.position[1]];
        board[this.position[0]][this.position[1]] = null;
        this.position = to;
        console.log(`영웅이${to}로 이동했습니다.`);
      } else {
        console.log("영웅이 이동할 수 있는 범위가 아닙니다.");
      }
    } else {
      console.log("이동할 곳에 다른 영웅이 있습니다.");
    }
  }
}

```
헐크의 경우 위아래로만 움직일 수 있어 col값만 같으면 움직일 수 있도록 해주었다.
## CaptainAmerica 클래스 설계 및 구현
```js
import { Avengers } from "./avengers.mjs";

export class CaptainAmerica extends Avengers {
  constructor(position) {
    super(700, 30);
    this.name = "CA";
    this.position = position;
  }
  move(to, board) {
    if (!board[to[0]][to[1]]) {
      if (
        (to[0] === this.position[0] && to[1] !== this.position[1]) ||
        (to[0] !== this.position[0] && to[1] === this.position[1])
      ) {
        board[to[0]][to[1]] = board[this.position[0]][this.position[1]];
        board[this.position[0]][this.position[1]] = null;
        this.position = to;
        console.log(`영웅이${to}로 이동했습니다.`);
      } else {
        console.log("영웅이 이동할 수 없는 범위가 아닙니다.");
      }
    } else {
      console.log("이동할 곳에 다른 영웅이 있습니다.");
    }
  }
}

```
캡아의 경우 상하좌우로 갈 수 있으므로 상하와 좌우 조건을 따로 걸어주었다.
상하의 경우 col값이 같으면 되고, 좌우의 경우 row값이 같으면 된다.
## BlackWidow 클래스 설계 및 
```js
import { Avengers } from "./avengers.mjs";

export class BlackWidow extends Avengers {
  constructor(position) {
    super(400, 10);
    this.name = "BW";
    this.position = position;
  }
  move(to, board) {
    if (!board[to[0]][to[1]]) {
      let rowDiff = Math.abs(this.position.charCodeAt(0) - to.charCodeAt(0));
      let colDiff = Math.abs(parseInt(this.position[1]) - parseInt(to[1]));
      if (
        (rowDiff === 0 && colDiff === 1) ||
        (rowDiff === 1 && colDiff === 0)
      ) {
        board[to[0]][to[1]] = board[this.position[0]][this.position[1]];
        board[this.position[0]][this.position[1]] = null;
        this.position = to;
        console.log(`영웅이${to}로 이동했습니다.`);
      } else {
        console.log("영웅이 이동할 수 있는 범위가 아닙니다.");
      }
    } else {
      console.log("이동할 곳에 다른 영웅이 있습니다.");
    }
  }
}

```
블랙위도우가 상당히 까다롭다. 
전후좌우 한 칸씩만 움직일 수 있기 떄문에 한쪽 방향으로 길이가 1 이상 차이가 나면 안되기 때문에 조건으로 걸었다. row값의 경우에는 유니코드 값으로 계산했다.
## IronMan 클래스 설계 및 구현
```js
import { Avengers } from "./avengers.mjs";

export class IronMan extends Avengers {
  constructor(position) {
    super(600, 40);
    this.name = "IM";
    this.position = position;
  }
  move(to, board) {
    if (!board[to[0]][to[1]]) {
      let rowDiff = Math.abs(this.position.charCodeAt(0) - to.charCodeAt(0));
      let colDiff = Math.abs(parseInt(this.position[1]) - parseInt(to[1]));
      if (rowDiff === colDiff && rowDiff > 0) {
        board[to[0]][to[1]] = board[this.position[0]][this.position[1]];
        board[this.position[0]][this.position[1]] = null;
        this.position = to;
        console.log(`영웅이${to}로 이동했습니다.`);
      } else {
        console.log("영웅이 이동할 수 있는 범위가 아닙니다.");
      }
    } else {
      console.log("이동할 곳에 다른 영웅이 있습니다.");
    }
  }
}

```
아이언맨의 경우 대각선으로 갈 수 있다.
대각선의 경우에는 row,col이 움직인 거리가 같아야 한다.
## Thor 클래스 설계 및 구현
```js
import { Avengers } from "./avengers.mjs";

export class Thor extends Avengers {
  constructor(position) {
    super(900, 50);
    this.name = "TH";
    this.position = position;
  }
  move(to, board) {
    if (!board[to[0]][to[1]]) {
      let rowDiff = Math.abs(this.position.charCodeAt(0) - to.charCodeAt(0));
      let colDiff = Math.abs(parseInt(this.position[1]) - parseInt(to[1]));
      if (
        rowDiff === colDiff ||
        (to[0] === this.position[0] && to[1] !== this.position[1]) ||
        (to[0] !== this.position[0] && to[1] === this.position[1])
      ) {
        board[to[0]][to[1]] = board[this.position[0]][this.position[1]];
        board[this.position[0]][this.position[1]] = null;
        this.position = to;
        console.log(`영웅이${to}로 이동했습니다.`);
      } else {
        console.log("해당 영웅이 이동할 수 없는 곳입니다.");
      }
    } else {
      console.log("이동할 곳에 다른 영웅이 있습니다.");
    }
  }
}

```

토르의 경우 모든 방향 다 갈 수 있기 때문에 대각선과 상하좌우 모두 고려해주었다.
# 구현 결과
```zsh
 node "/Users/miguel/Desktop/naver/challenge/day6/gameInterface.js"
어벤저스 보드를 초기화했습니다.

HP = 5800

받은 데미지 = 0

 |01|02|03|04|05|06|

A|UL|..|..|..|..|CA|

B|BW|..|UL|..|UL|..|

C|TH|..|..|CA|..|TH|

D|IM|..|..|..|..|BW|

E|..|..|..|..|..|..|

 |01|02|03|04|05|06|

이동할 기회가 있습니다. 이동 위치를 입력하세요: A1->A2
영웅이A2로 이동했습니다.
HP = 5800

받은 데미지 = 0

 |01|02|03|04|05|06|

A|..|UL|..|..|..|CA|

B|BW|..|UL|..|UL|..|

C|TH|..|..|CA|..|TH|

D|IM|..|..|..|..|BW|

E|..|..|..|..|..|..|

 |01|02|03|04|05|06|

명령을 입력하세요: %
```

```zsh
명령을 입력하세요: UL->D2
HIT(12)
컴퓨터가 입력합니다> HE->B2
MISS
HP = 5220

받은 데미지 = 280

 |01|02|03|04|05|06|

A|BW|IM|..|..|HK|..|

B|UL|..|..|BW|..|..|

C|..|..|..|..|..|..|

D|TH|..|CA|UL|..|..|

E|..|..|..|UL|..|HE|

 |01|02|03|04|05|06|

명령을 입력하세요: UL->D2
HIT(13)
컴퓨터가 입력합니다> HE->C1
MISS
HP = 5220

받은 데미지 = 280

 |01|02|03|04|05|06|

A|BW|IM|..|..|HK|..|

B|UL|..|..|BW|..|..|

C|..|..|..|..|..|..|

D|TH|..|CA|UL|..|..|

E|..|..|..|UL|..|HE|

 |01|02|03|04|05|06|

캐릭터 둘이 죽어 게임이 종료되었습니다.
죽은 캐릭터
BlackWidow
HawkEye
플레이어가 승리했습니다
```

```zsh
 node "/Users/miguel/Desktop/naver/challenge/day6/gameInterface.js"
어벤저스 보드를 초기화했습니다.

HP = 5500

받은 데미지 = 0

 |01|02|03|04|05|06|

A|BW|IM|..|..|HK|..|

B|UL|..|..|BW|..|..|

C|..|..|..|..|..|..|

D|TH|..|CA|UL|..|..|

E|..|..|..|UL|..|HE|

 |01|02|03|04|05|06|

명령을 입력하세요: ?
컴퓨터 상태 보기
HP = 5200

받은 데미지 = 0

 |01|02|03|04|05|06|

A|..|..|..|..|UL|TH|

B|..|..|..|..|BW|UL|

C|..|..|HE|CA|..|UL|

D|..|HE|..|IM|..|..|

E|..|..|..|..|..|BW|

 |01|02|03|04|05|06|

--------------------

HP = 5500

받은 데미지 = 0

 |01|02|03|04|05|06|

A|BW|IM|..|..|HK|..|

B|UL|..|..|BW|..|..|

C|..|..|..|..|..|..|

D|TH|..|CA|UL|..|..|

E|..|..|..|UL|..|HE|

 |01|02|03|04|05|06|

명령을 입력하세요: HK->B5
HIT(1)
컴퓨터가 입력합니다> HE->B2
```

정상적으로 모든 기능이 작동된다!
![][https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz-vu3EyjHDUyzLVyHqgBfKUjRQrv1n7Cf6Q&s]
