# 문제 첫인상
처음세 소수점 나오는 시간들을 보고 흠칫했다. 이러한 복잡한 시간들을 기반으로 긴 요구사항을 논리적인 수식으로 계산하고 원하는 형식으로 출력할 수 있도록 설계 및 구현하는 능력을 기르기 위해 내준 문제인 것 같다고 생각했다.

# 예시 분석
지구의 그레고리안 달력을 기준으로 특정 날짜를 입력
-> 그 날짜에 해당하는 화성일을 포함하는 화성월을 표시
```
> 지구날짜는? 2024-01-01
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 화성까지 여행 100% 
지구날은 738,901 => 1105 화성년 8월 11일

     1105년 8월
Su Lu Ma Me Jo Ve Sa
 1  2  3  4  5  6  7
 8  9 10 11 12 13 14
15 16 17 18 19 20 21
22 23 24 25 26 27 28

```
## 지구일 계산
- 지구날짜 : 2024-01-01
- 지구날 계산
	- 2023을 4로 나누기 -> 505개의 윤년 + 1518개의 일반년
	- 505 \* 366 + 1518 \* 365 일
	- 184,830 + 554,070 = 738900일
	- 1월 1일의 1일을 더해서 738901일
## 화성일 계산
- 화성일 계산
	- 738901(지구일) / (668+669)(화성년 + 화성윤년) = 552
	- 552 \* 2 = 1104년 - 1년(0년부터 시작한다고 생각) = 1103년
	- 738901(지구일) % (668+669) = 877일
	- 887일은 1년보다 기니까 887-668(1103년은 윤년x) = 207일
	- 207 / 28 = 7, 207 % 28 = 11 
		=> 1105(1104+1)년 8월 11일
예시 분석부터 복잡하다.. 처음에는 0년부터 시작하지 않는다는 가정 하에 계산했더니 8월13일이 나와서 0년부터 시작한다고 가정했더니 8월 11일이 나왔기 때문에 0년까지 세야하는 것 같다.
# 설계 
## 필요조건 - 화성 달력
### 년월일 계산 단위

- 1 화성년 = 686.98 지구일 = 668.5907 화성일
- 1 화성일 : 1 솔(sol) = 24.65979 지구시간 (지구 하루와 화성 하루가 같다고 가정합니다.)
### 화성 달력 기준

- 1화성년 = 668 화성일, 2년마다 669 화성일
- 1주일 = 7화성일
- 1화성월 = 28화성일(=4주일)
- 1화성년 =24화성월
- 6화성월마다 하루씩 빠짐
	- 1년 = 24\*28 - 4 = 668 화성일
	- 윤년마다 하루 추가(669 화성일)
- 6화성월마다 하루 빠진 마지막 요일은 당겨서 계산 X
	- 다음 달의 솔 솔리스(일요일)부터 다시 시작

### 화성 요일

1. 솔 솔리스 (Sol Solis: 태양의 날) - 일
2. 솔 루나에 (Sol Lunae: 달의 날) - 월
3. 솔 마르티우스 (Sol Martius: 화성의 날) - 화
4. 솔 메르쿠리 (Sol Mercurii: 수성의 날) - 수
5. 솔 요비스 (Sol Jovis: 목성의 날) - 목
6. 솔 베네리스 (Sol Veneris: 금성의 날) - 금
7. 솔 사투르니 (Sol Saturni: 토성의 날) - 토

## 필요조건 - 지구 달력
- 1년 = 365일
- 4년(윤년)마다 2월 말에 29일을 붙여 366일

## 필요 기능
기능은 화성과 지구를 클래스나 개별함수로 구현하면 좋을 것 같다고 생각했다. 아무래도 여러 기능들을 세분화해서 구현하려고 하다보니 여러개의 함수가 분리되어 있는 것도 가독성이 떨어질 것 같아 클래스가 더 낫다고 판단이 되었다.
### 화성일의 경우
#### 날짜 계산(지구일) => 화성년월일
지구날을 달력대로 받는게 아니라 지구날을 일자로 바꾸고 그 일자를 다시 계산하여 화성 날짜로 바꾸는게 용이할 것 같았다.
해당 메소드는 정적 메소드로 구현하여 생성자에서도 사용할 수 있게끔 하였다.
```js
static convertYear(fullDate) {
    let year = Math.floor(fullDate / (668 + 669)) * 2;
    let restDays = (fullDate % (668 + 669)) - 1;
    if (year % 2 === 0 && restDays > 669) {
      year++;
      restDays -= 669;
    } else if (restDays > 668) {
      year++;
      restDays -= 668;
    }
    return [year, restDays];
  }
```
restDays에서 하루를 뺀 이유는 1년 1월 1일부터 시작하기 때문에 이미 하루가 넘어가 있는 상태로 볼 수 있어 하루를 뺐다.
또한 이를 계산하는 과정에서 년도를 일반년 + 윤년의 경우를 합쳐 계산한 뒤에 1년 이상의 일수가 남으면 다시금 빼는 방식으로 설계했는데, 로직 자체가 남은 일수를 계산할 때도 쓰이는 변수와 로직이 같기 때문에 굳이 분리하기보단 통일한 다음에 리턴값에 배열로 넣어주었다.

#### 화성 달력 출력(월) => 해당 년월의 달력
이 달력은 윤년을 판단해서 출력해야 한다.
```js
  static convertMonthAndDays(restDays) {
    let month;
    for (month = 1; month < 24; month++) {
      if (month % 6 === 0) {
        if (restDays > 27) restDays -= 27;
        else break;
      } else {
        if (restDays > 28) {
          restDays -= 28;
        } else break;
      }
    }

    return [month, restDays - 1];
  }
```
for문을 통해 조건을 거는게 보다 코드 로직이 편할 것 같아 for문으로 구성해 보았다.
윤년을 신경쓰지 않은 이유는 어차피 마지막 월이기 때문에 마지막 월은 그대로 남겨두어야 다음 년도전까지의 날짜까지 되어 있는 날들이 마지막 월까지 갔을 때 남은 일수를 그대로 넣을 수 있다.
마지막에 resDays에 -1을 한 이유는 1월 1일부터 시작한다는 것을 가정으로 하고 계산했기 때문에 1일이 추가되었으므로 빼주어야 한다.

#### 달력 출력
달력을 출력하는 메소드는 그냥 각 row마다 배열로 구성한 뒤 마지막 28일만 관건이기 때문에 조건문을 넣어주었다.
```js
  printCalendar() {
    let calendar = [
      ["So", "Lu", "Ma", "Me", "Jo", "Ve", "Sa"],
      [" 1", " 2", " 3", " 4", " 5", " 6", " 7"],
      [" 8", " 9", "10", "11", "12", "13", "14"],
      ["15", "16", "17", "18", "19", "20", "21"],
      [
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        this.mon % 6 === 0 ? (this.year % 2 === 0 ? "28" : "") : "28",
      ],
    ];
    let stdOut = `    ${this.year}년 ${this.mon}월\n\n`;
    calendar.forEach((row) => {
      stdOut += row.join(" ") + "\n\n";
    });
    return stdOut;
  }
```
일부러 문자공백수를 맞추기 위해 문자열로 바꾸었고, 이렇게 모든 row를 담은 배열을 forEach문을 통해서 출력 문자열에 넣어주었다.
### 지구일의 경우
#### 날짜계산(지구 날짜) => 지구일
지구일로 변환하는 함수 또한 따로 구현하여 화성의 날짜 계산할 때 필요한 부분을 세분화했다.
나의 경우에는 년월일-> 일의 큰 메소드 안에 `년->일`, `달->일`의 두 가지 메소드를 따로 제작하여 분리했다.
```js
// 총 일수로 바꿔주는 메소드
	getFullDate() {
	    return this.getFullYearDate() + this.getFullMonthDate() + this.day;
  }
  getFullYearDate() {
    return (
      this.countLeapYear() * 366 + (this.year - 1 - this.countLeapYear()) * 365
    );
  }
  // 달 -> 날짜로 바꿔주는 메소드
  getFullMonthDate() {
    const daysInMonths = [
      31, // 1월
      this.year % 4 === 0 ? 29 : 28, // 2월(윤년 계산)
      31, // 3월
      30, // 4월
      31, // 5월
      30, // 6월
      31, // 7월
      31, // 8월
      30, // 9월
      31, // 10월
      30, // 11월
      31, // 12월
    ];
    if (this.mon === 1) return 0;
    return daysInMonths
      .slice(0, this.mon)
      .reduce((total, days) => total + days, 0);
  }
```
#### 윤년계산(지구년) => 윤년 개수
윤년은 총 일수를 알 때 366일인 경우를 알아야 하기 때문에 입력한 연도 전까지 윤년이 몇 개가 있는지 확인하기 위해 메소드를 제작했다.
```js
  // 윤년 세는 메소드
  countLeapYear() {
    return Math.floor((this.year - 1) / 4);
  }
```

## 입력 및 출력
```js
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const clearLastLine = () => {
  process.stdout.moveCursor(0, -1); // up one line
  process.stdout.clearLine(1); // from cursor to end
};

let earth, mars;
rl.question("지구날짜는? ", (date) => {
  earth = new Earth(date.trim());
  mars = new Mars(earth.getFullDate());
  let load = "____________________";
  let ready = "████████████████████";
  let i = 0;
  const loading = setInterval(() => {
    if (i !== 0) clearLastLine();
    console.log(`${ready.slice(0, i)}${load.slice(i)} 화성까지 여행 ${i * 5}%`);
    if (i < 20) i++;
  }, 200);
  setTimeout(() => {
    clearInterval(loading);
    console.log(
      `\n지구날은 ${earth.getFullDate().toLocaleString()} => ${
        mars.year
      } 화성년 ${mars.mon}월 ${mars.days}일\n\n`
    );
    console.log(mars.printCalendar());
    rl.close();
  }, 5000);
});
rl.on("close", () => {
  process.exit();
});

```
입력과 출력은 readline 모듈을 통해 구현했다.
 진행 바 같은 경우에는 진행정도와 미진행 정도를 바 문자열에서 슬라이싱하고, `setInterval`을 통해 계속해서 앞 줄을 지우는 `clearLastLine()`을 통해서 계속해서 상태정도가 올라가는 듯한 효과를 줄 수 있다. 
 문제에서 학습목표로 주어졌던 비동기 API인 `setTimeOut`을 사용하여 5초 후에 진행바가 종료되도록 해주었고, 종료된 이후에는 화성의 달력을 출력하도록 하였다.