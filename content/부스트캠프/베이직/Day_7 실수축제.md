# 실수 코드
```js

    switch (command) {
		...
      case "PRINT":
        result = calculator.print();
        if (result) stdOut.push(result);
        stdOut.push(result);
        break;
	}
```

## 문제가 되는 테스트케이스와 동작결과

입력값:  \["PRINT", "PUSH0", "PRINT", "POPA"\]  
예상했던 결과값: \["EMPTY", "0", "EMPTY"\]
실제 결과값: \["EMPTY", "EMPTY"\]


## 문제 이유 분석
나는 각 메소드들의 리턴값에 대해서 에러나 구현 조건에 의해 특정 값을 리턴하지 않는 이상 따로 return값을 넣어주지 않았다. 그렇게 만든 메소드를 바탕으로 `Switch case`문을 통해 메소드를 실행시키고 여기에서 리턴값이 있는 경우에만 나중에 출력할 배열에 넣어주도록 만들었다. 하지만  이 경우 만약에 0이란 값이 오류가 아닌데도 의도해서 `PUSH0` -> `PRINT`와 같이 동작시킬 경우 `PRINT`가 리턴하는 수는 0이기 때문에 falsy한 값으로 취급하여 if(result)에서 true 조건으로 가지 못해 0이 결과값 배열에 추가되지 않는 현상이 발생했다.
 
## 보완 방법 설계

이러한 오류가 나는 부분을 보완하기 위해 메소드를 실행하고 에러나 구현조건에 의해 특정 값을 리턴하지 않는 경우 `undefined`가 리턴되는 점을 고려하여 `typeof`를 통해 필요없는 리턴값들만 필터링하도록 로직을 변경하였다.

## 보완한 코드

```js
...
case "PRINT":
        result = calculator.print();
        if (typeof result !== "undefined") stdOut.push(result);
        break;

```