# 미션 첫인상
## 한줄 요약

적절한 데이터 구조를 선택하여 시각적인 표를 구현하고 탐색할 수 있게 만들 수 있도록 연습하는 과정이다. 
`find()`함수에서 게임을 플레이 하는 시점과 참가인원수를 받은 후 이를 filter를 통해서 조건에 맞는 게임만 뽑아내면 되겠다고 생각했다.
## 핵심
게임 테이블을 구현하는 것 자체는 어렵지 않지만 해당 게임을 검색하는 과정에서 string 형식으로 들어오는 특정 시점과 참여자를 적절히 파싱하고 조건을 검색하는 과정에서 고민을 해보라고 내준 미션같은 느낌이 들었다.
# 문제 해결 과정
## 1. 게임 테이블 제작
```js
// game.js
const games = {
  Kong: {
    discontinued: true,
    genre: "Adventure",
    star: 4.1,
    maxUser: 1,
    open: "1970.1",
    close: "1981.4",
  },
  Ace: {
    discontinued: false,
    genre: "Board",
    star: 3.8,
    maxUser: 4,
    open: "1987.7",
    close: "2024.7",
  },
  Mario: {
    discontinued: true,
    genre: "RPG",
    star: 3.3,
    maxUser: 2,
    open: "2001.9",
    close: "2007.11",
  },
  Prince: {
    discontinued: true,
    genre: "RPG",
    star: 4.8,
    maxUser: 1,
    open: "1983.3",
    close: "2002.5",
  },
  Dragons: {
    discontinued: true,
    genre: "Fight",
    star: 3.4,
    maxUser: 4,
    open: "1990.5",
    close: "1995.12",
  },
  Civil: {
    discontinued: false,
    genre: "Simulation",
    star: 4.2,
    maxUser: 1,
    open: "2002.6",
    close: "2024.7",
  },
  Teken: {
    discontinued: true,
    genre: "Fight",
    star: 4.0,
    maxUser: 2,
    open: "1998.7",
    close: "2009.12",
  },
  GoCart: {
    discontinued: false,
    genre: "Sports",
    star: 4.6,
    maxUser: 8,
    open: "2006.12",
    close: "2024.07",
  },
  Football: {
    discontinued: false,
    genre: "Sports",
    star: 2.9,
    maxUser: 8,
    open: "1994.6",
    close: "2024.7",
  },
  Brave: {
    discontinued: true,
    genre: "RPG",
    star: 4.2,
    maxUser: 1,
    open: "1980.6",
    close: "1985.1",
  },
};

export default games;

```
처음에는 find.js에 모든 게임도 넣은 다음에 바로바로 사용할 수 있도록 하려고 했으나 정보를 기입하는 과정에서 라인이 너무 길어져 보기 힘들었다. 그래서 게임들의 정보를 game.js를 만든 뒤에 import 해와서 사용하는 방식으로 설계했다.

## 2. find() 함수 만들기
### 고려해야 할 것들
#### `find()`에 첫번째로 들어가는 `param0`의 값은 `string`으로 된 YYYYMM 형식이다.
문자열을 YYYY / MM 으로 잘라 따로 비교
```js
function find(date, users) {
  const year = parseInt(date.slice(0, 4));
  const month = parseInt(date.slice(4));
	...
```
#### 검색 결과가 여러 개일 경우 별점의 내림차순 정렬
검색 결과를 `sort()`메서드를 통해 한번 정렬을 시켜주었다.
#### 검색 결과를 위한 검색 조건 설계
판매중인 동안만 참여 가능한 검색 결과의 조건을 거르기 위해 `filter`메서드를 사용했다. `filter`의 콜백함수 안에서 각각의 게임들의 판매시작일, 판매종료일을 .으로 구분하여 기록해 놓았기 때문에 `split`하여 연도와 월을 구분했다
내가 설정한 조건은
- 먼저 maxUser를 통해 플레이할 수 있는 유저의 수보다 참가자 수가 많을 경우 거름
- 오픈년도보다 뒤의 연도를 입력했을 경우
	- 판매종료년도와 같을 경우 월은 작거나 같아야 함
	- 판매종료년도보다 이전일 경우 통과
- 오픈년도와 참가년도가 같을 경우
	- 오픈월이거나 그 후의 월에 참여해야 함
	- 오픈년도가 판매종료년도와 같을 경우 참가월이 판매종료월보다 같거나 작아야 함
```js
let search = games.filter((item) => {
    const open = item.open.split(".").map(Number);
    const close = item.close.split(".").map(Number);
    if (item.maxUser < users) {
      return false;
    }
    if (open[0] < year) {
      if (close[0] === year && close[1] >= month) return true;
      else if (close[0] > year) return true;
      return false;
    } else if (open[0] === year) {
      if (open[1] <= month) return true;
      else if (open[0] === close[0] && close[1] >= month) return true;
      return false;
    }
    return false;
  });
  search.sort((a, b) => {
    b.star - a.star;
  });
```
#### 검색 결과가 하나일 때는 따로 별점을 기재하지 않음 + 단종된 게임의 경우 이름 뒤에 \* 붙이기![](https://i.imgur.com/cwjV6tf.png)
삼항연산자를 사용하면 될 것 같아서 넣는 문자열 안에 삼항연산자를 넣어서 시도해 보았다. 정상적으로 작동함을 확인했다.
```js
let result = [];
  search.forEach((game) => {
    result.push(
      `${game.name}${game.discontinued ? "*" : ""}(${game.genre}) ${
        result.length > 1 ? game.star : ""
      }`
    );
  });
```

#### 오류조건 설정
만약 `find()`함수에 제대로 된 값이 들어가지 않았을 경우를 대비하여 이러한 에러조건에 대해 대응하도록 조건을 설정했다.
```js
function find(date, users) {
  if (!date || !users || date.length !== 6 || isNaN(users)) return "";
  ...
  }
```
조건은
- date나 users가 falsy한 값일 경우
- 날짜 형식이 정상이아닐 경우
- users에 숫자가 들어오지 않을 경우
를 생각하여 명시하였다.

# 완성 코드

```js
function find(date, users) {
  if (!date || !users || date.length !== 6 || isNaN(users)) return "";
  const year = parseInt(date.slice(0, 4));
  const month = parseInt(date.slice(4));
  let search = games.filter((item) => {
    const open = item.open.split(".").map(Number);
    const close = item.close.split(".").map(Number);
    if (item.maxUser < users) {
      return false;
    }
    if (open[0] < year) {
      if (close[0] === year && close[1] >= month) return true;
      else if (close[0] > year) return true;
      return false;
    } else if (open[0] === year) {
      if (open[1] <= month) return true;
      else if (open[0] === close[0] && close[1] >= month) return true;
      return false;
    }
    return false;
  });
  search.sort((a, b) => {
    b.star - a.star;
  });
  let result = [];
  search.forEach((game) => {
    result.push(
      `${game.name}${game.discontinued ? "*" : ""}(${game.genre}) ${
        search.length > 1 ? game.star : ""
      }`
    );
  });
  return result.join(", ");
}
```

# 마주친 오류
## 실수 코드 
```
import games from "./gameList";
^^^^^^
SyntaxError: Cannot use import statement outside a module
```
객체를 import 해오는 과정에서 위와 같은 에러를 보았다. 

### 문제 분석 및 해결
`import` 문은 ES6 모듈을 사용하는 환경에서만 지원되지만 Node.js에서는 ES6 모듈을 사용하려면 추가적인 과정이 필요했다. 찾아보기로는 두 가지 방법이 있었다. 

1. 파일 확장자를 `.mjs`로 설정
	- `game.js`를  `game.mjs`로 변경한 뒤 다시 실행했지만 같은 오류가 지속되었다.
2. `package.json` 파일에 `"type": "module"`추가
	- 미션3 폴더를 따로 만들고, 거기에 package.json파일을 만든 뒤에 해당 속성을 추가해줬더니 해결되었다.

### 깨달은 점
이제까지는 항상 리액트만 사용하면서 모듈들을 항상 가져오면서 package.json에 이미 모듈이 디폴트로 명시되어있었기 때문에 알지 못했지만 이번에 새롭게 에러를 발견하면서 package.json의 기능과 모듈에 대한 이해를 보다 높일 수 있었다.