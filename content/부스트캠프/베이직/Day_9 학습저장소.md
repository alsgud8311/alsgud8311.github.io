# 문제 첫인상

시스템 로그 파일을 분석해서 원하는 데이터 구조를 설계하고 구현하는 프로그램을 작성해야 하는 이번 문제의 핵심은 데이터 구조 내용을 어떻게 탐색하고 분석하는 방법을 선택하는지일 것이다. 해당 데이터 구조에 따라서 성능이 달라질 가능성이 있기 때문에 최적의 구조로 필터링이나 정렬 등을 할 수 있어야 할 것 같다. 

# 설계
## 예시와 기능요구사항 분석

```
error 14:22:30.608355+0900 airportd [corewifi] END REQ [GET BSSID] (pid=5617 proc=iStat Menus Status service=com.apple.corewlan-xpc intf=en1 uuid=92833 err=1) 

default 14:22:33.784903+0900 Airmail [C264.1 Hostname#9e7acbfe:993 initial path ((null))] event: path:start @0.000s 

info 14:23:16.765320+0900 bluetoothd canScanNow session:<private>(Unspecified) allowed:1 deviceLocked:0 deviceFirstUnlocked:1 allowedInBKG:1 sessionState:daemon <private>
```
로그은 \\n으로 나뉘어지고, 각 요소는 \\t로 구분된다.

```
로그 레벨\t기록 시각\t프로세스\t기록
```
아래와 같은 형식으로 기록된다. 그렇다면 이 로그파일을 `readline` 모듈을 통해서 한줄한줄 읽어가는 방식도 가능하고, `fs` 모듈을 사용해서 파일 자체를 통으로 읽는 것도 가능하다.

하지만 아래 `프로그래밍 요구사항`에서 나와있는 다른 요구사항중에 필터링, 정렬 등의 키워드가 있는 것을 보아 한 배열에 모든 정보들을 객체에 넣은 후에, 정렬이라 필터링 등의 고차함수를 이용하여 결과를 출력하면 되겠다고 생각했다. 이러한 객체들을 만들기 위해서는 한 줄로 읽든, \\n으로 split한 다음에 forEach를 돌려 처리하는 방법 중에 골라야 할 것 같다.


## 필요기능

### 텍스트 파일 읽기
```js
function inspectFile(filename) {
  return new Promise((resolve, reject) => {
    var instream = fs.createReadStream(filename);
    var reader = readline.createInterface({ input: instream });

    var logs = [];
    var logsInfo = {
      processName: {},
      logLevel: {},
    };
    reader.on("line", (line) => {
      inspect(line, logs, logsInfo);
    });
    reader.on("close", () => {
      resolve([logs, logsInfo]);
    });
    reader.on("error", (error) => {
      reject(error);
    });
  });
}

let logs, logsInfo;
const main = async (filePath) => {
  try {
    [logs, logsInfo] = await inspectFile(filePath);
    filtering("processName", "bluetoothd");
    count("processName");
    sort("processName");
  } catch (error) {
    console.error("Error:", error);
  }
};

main("./1701410305471system.log");
```
텍스트 파일을 먼저 읽은 후에 이후의 데이터를 가지고 처리해야해서 Promise를 사용해서 해당 파일을 읽으면서 모두 데이터들에 대한 처리를 완성한 후에 기능들을 실행할 수 있도록 async/await문을 사용했다.

### 한 줄로 읽어가면서 데이터 분석 처리

```js
function inspect(line, logs, logsInfo) {
  [logLevel, recordTime, processName, record] = line.split("\t");
  if ((processName && processName.length > 30) || logLevel.length > 15) return;
  logs.push({
    logLevel: logLevel,
    recordTime: recordTime,
    processName: processName,
    record: record,
  });
  logsInfo.processName[processName]
    ? logsInfo.processName[processName]++
    : (logsInfo.processName[processName] = 1);
  logsInfo.logLevel[logLevel]
    ? logsInfo.logLevel[logLevel]++
    : (logsInfo.logLevel[logLevel] = 1);
}
```
`reader.on("line")`에 두번째로 들어가는 parameter의 콜백함수는 각 line은 tab으로 split하여 객체로 만들어 준 다음에 배열에 푸시하였다. 여기서 한번 모든 로그를 push했을 때 \\t으로 개행되지 않은 예외 케이스가 존재했기 때문에 비정상적으로 긴 프로세스 이름과 로그의 이름이 있을 경우 통과하도록 만들었다.

### 로그 레벨과 프로세스 이름별 필터링
```js
// 필터링
function filtering(div, filterName) {
  let filteredLogs;
  if (div === "logLevel") {
    filteredLogs = logs.filter((item) => item.logLevel !== filterName);
  } else if (div === "processName") {
    filteredLogs = logs.filter((item) => item.processName !== filterName);
  } else {
    console.log("잘못된 구분입니다.");
    return;
  }

  filteredLogs.forEach((item) => {
    console.log(Object.values(item).join("\t"));
  });
}
```
필터링의 경우 필터링할 구분(로그 레벨, 프로세스 이름)과 걸러낼 이름을 받아 배열에 filter 처리를 해주고, 다시 이를 원래의 로그 형태로 출력될 수 있도록 문자열로 `console.log`해 주었다.

### 로그 시각과 프로세스 이름 정렬
```js
function sort(div, reverse = false) {
  if (div === "recordTime") {
    if (reverse === true) {
      logs.reverse().forEach((log) => {
        console.log(Object.values(log).join("\t"));
      });
    } else {
      logs.forEach((log) => {
        console.log(Object.values(log).join("\t"));
      });
    }
  } else if (div === "processName") {
    if ((reverse = true)) {
      console.log(
        logs.sort((a, b) => {
          b.processName - a.processName;
        })
      );
    } else {
      console.log(
        logs.sort((a, b) => {
          a.processName - b.processName;
        })
      );
    }
  } else {
    console.log("잘못된 구분입니다.");
  }
}
```
sort의 경우도 어떤 구분(기록 시간, 프로세스 이름)을 기준으로 정렬해야하는지를 받고, 오름차순 혹은 내림차순으로 받을지 말하는 `reverse`파라미터를 추가해주었다.
근데 생각해보니 로그의 의미 자체가 '이제까지 활동한 것들을 기록'해주는 것이다.
그러므로 오름차순의 경우에는 따로 시간별로 정렬을 해줄 필요가 없다.
![](https://i.imgur.com/kc59lfZ.png)
그게.. 로그니까
아무튼 역순으로 할 때는 배열을 뒤집어주고 출력해주기만 하면 된다.
프로세스 이름의 경우에는 sort 고차함수를 이용해서 정렳시켜주었다.
### 로그 레벨과 프로세스 별 카운트 값 가져오기
```js
function count(div) {
  if (div === "logLevel" || div === "processName") {
    console.log(logsInfo[div]);
  } else {
    console.log("올바른 구분명이 아닙니다.");
  }
}
```
아까 입력을 받으면서 로그들을 모두 객체화시키고 배열에 넣는 과정에서 `logsInfo`라는 별도의 객체를 두었다.
```js
function inspect(line, logs, logsInfo) {
  [logLevel, recordTime, processName, record] = line.split("\t");
  if ((processName && processName.length > 30) || logLevel.length > 15) return;
  logs.push({
    logLevel: logLevel,
    recordTime: recordTime,
    processName: processName,
    record: record,
  });
  logsInfo.processName[processName]
    ? logsInfo.processName[processName]++
    : (logsInfo.processName[processName] = 1);
  logsInfo.logLevel[logLevel]
    ? logsInfo.logLevel[logLevel]++
    : (logsInfo.logLevel[logLevel] = 1);
}
```
한 줄씩 로그를 받아가면서 카운트를 동시에 세 주어 나중에 따로 구할 필요가 없도록 설계했다.
따라서 올바른 구분명(로그레벨이나 프로세스 이름)만 입력하면 해당 구분의 카운터를 출력할 수 있도록 설계했다.