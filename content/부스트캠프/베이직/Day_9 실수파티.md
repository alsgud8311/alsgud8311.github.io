# 에러 메시지

```js
[logs, logsInfo] = inspectFile(filePath);
TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))
```

# 코드 조각
```js
const main = (filePath) => {
  [logs, logsInfo] = inspectFile(filePath);
  filtering("processName", "bluetoothd");
  count("processName");
  sort("processName");
};
```

# 에러 이유
처음엔 파일을 검사할 때 그저 함수로 readline 모듈을 사용해서 받고, 알아서 자연스럽게 다음 코드로 옮겨갈 것이라 생각했지만 에러가 떴다. 이유를 살펴보니 readline 모듈이 비동기적으로 작동하기 때문에 내가 만든 다른 함수들이 먼저 실행되고, 이 때문에 없는 배열을 참조하려 하면서 나온 에러였다.

# 보완하기
```js
function inspectFile(filename) {
  return new Promise((resolve, reject) => {
    ...
    reader.on("line", (line) => {
      inspect(line, logs, logsInfo);
    });
    reader.on("close", () => {
      resolve([logs, logsInfo]);
    });
    
  });
}
```
readline 모듈을 사용한 함수를 Promise 객체화시켜 데이터 분석 작업이 모두 끝날 때까지 await을 걸어주어 동기적으로 실행되게끔 설계했다.
```js
const main = async (filePath) => {
  [logs, logsInfo] = await inspectFile(filePath);
```