setTimeout과 setInterval은 호출을 할 때 자주 쓰이는 메서드이다. 
이 두 함수들에는 **'일정 시간이 지난 후 원하는 함수를 예약 실행'** 할 수 있게 해주는 기능을 가진다.
하지만 이 예약 실행에도 작동 방식에 따라 setTimeout과 setInterval이 나누어진다.

- setTimeout -> 일정 시간이 지난 후에 함수를 실행
```javascript
let timerId = setTimeout(func|code, [delay], [arg1], [arg2], ... )
```
- setInterval -> 일정 시간 간격을 두고 함수 실행
```javascript
let timerId = setInterval(func|code, [delay], [arg1], [arg2], ...)
```

두 개의 작동 방식은 다르지만 setInterval을 통해 setTimeout을 만들 수 있고, setTimeout을 이용해 setInterval로 만들 수도 있다.
```javascript
/** setInterval을 이용하지 않고 아래와 같이 중첩 setTimeout을 사용함
let timerId = setInterval(() => alert('째깍'), 2000);
*/

let timerId = setTimeout(function tick() {
  alert('째깍');
  timerId = setTimeout(tick, 2000); // (*)
}, 2000);
```
이처럼 두 함수의 역할은 보다 명확한 '시간'을 가지고 함수를 다루는 비슷한 함수들이라고 생각을 할 수 있다. 

실제로 setTImeout과 setInterval이 받는 인자의 종류와 개수가 같기 때문에, 만약 같은 함수를 지속적으로 실행하는 스케줄링과 같은 경우에 있어서 setInterval을 많이 쓰곤 한다.
하지만 이러한 setInterval을 쓸 때 꼭 주의해야 할 점이 있다.

### 지연 간격 보장 문제
```javascript
let i = 1;
setInterval(function() {
  func(i++);
}, 100);
```
다음과 같은 setInterval은 똑같이 동작하도록 setTimeout을 이용하여 만들 수 있다.
```javascript
let i = 1;
setTimeout(function run() {
  func(i++);
  setTimeout(run, 100);
}, 100);
```
하지만 이 각각의 코드가 동작 자체는 똑같이 동작하지만, 실제로 이 함수가 **실행되는 방식**에 대해서는 조금 다르다.


```javascript
let i = 1;
setInterval(function() {
  func(i++);
}, 100);
```
![](https://i.imgur.com/VCUyoS7.png)
setInterval로 함수를 실행하는 경우에는 함수간 호출의 지연 간격이 실제 명시한 간격보다 짧아지는 효과를 가진다.
왜냐하면 함수에는 그 함수를 실행시키는 과정에서 걸리는 시간 또한 간격에 포함되어 있기 때문이다.

반면 setTimeout을 중첩으로 실행하여 일정 간격으로 함수를 실행시키는 방법을 보자
```javascript
let i = 1;
setTimeout(function run() {
  func(i++);
  setTimeout(run, 100);
}, 100);
```
![](https://i.imgur.com/YIsYlYk.png)
중첩 setTimeout을 사용할 경우에는 이전 함수의 실행이 종료된 이후에 다음 함수 호출에 대한 스케줄링 계획이 짜여지기 때문에 명시한 지연 시간이 보장된다.
따라서 보다 명확하게 스케줄링 시간을 관리하기 위해서는 setTimeout을 통해 스케줄링 하는 것이 보다 확실한 방법이다.

하지만 둘 다 스케줄링 메서드 중 하나기 때문에 CPU의 과부하나 브라우저 탭이 백그라운드인 등의 상황에 대해서는 타이머의 지연 시간이 이에 따라 늘어나기 때문에 이 또한 유의해서 사용해야 할 필요성이 있다.
