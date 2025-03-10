# GIST 관련 업로드하기
### 클론해서 받아오기

1. gist 설명에는 `J041 - Day01` 처럼 `캠퍼 ID - Day 숫자` 형식으로 표기하고 README.md 파일을 생성
2. gist 화면에서 다음과 같이 Embed 버튼을 눌러서 Clone 주소로 변경한다. 
	- `Clone via HTTPS`로 변경하고 옆에 복사하기 버튼을 누르면 gist의 git 주소를 확인할 수 있다.
3.  다음과 같은 `git clone {클론할 gist의 git 주소} {클론할 폴더명}` 형태 명령으로 gist를 클론한다.
```
git clone https://github.com/e7d4f69b0e0af82xxxxxxx.git day1
```

> 이 때 맨 마지막 day1 폴더명을 생략하면 gist id `e7d4f69b0e0af82xxxxx` 값으로 폴더가 생성된다. 폴더명을 안 써도 무방하지만 헷갈릴 수 있으니 폴더명을 지정하는 게 좋다.
### add & commit

로컬에 생긴 폴더에서 새로운 파일을 작성하고 add, commit 해야 한다. 로컬에서 README 파일을 열어서 내용을 수정해 보고 git 명령으로 add, commit 한다. 작업한 파일명과 작업 내용을 기록해야 한다.

```
git status // 확인

//파일 변경하기

git add 파일명 // 추가/변경 파일

git commit -m "커밋 기록용 메시지" // 커밋

```

- 아래 push는 한꺼번에 해도 되지만 add와 commit은 작업을 할 때 마다 반복적으로 해야 한다. 파일을 추가하거나 새로운 작업을 할 때 마다 add, commit 을 하는 습관을 만들자.

### gist 저장소에 push

```
git push

Username for 'https://gist.github.com': {아이디입력}
Password for 'https://{아이디}@gist.github.com': {토큰입력}
```

> 이 때 push를 하려면 GitHub 아이디와 권한이 있는 토큰이 필요하다.  
> [https://github.com/settings/tokens](https://github.com/settings/tokens) 주소로 이동해서 토큰을 생성하거나 기존의 토큰에서 `gist` 관련 권한을 추가해야 한다.  
> 토큰값을 복사하고 push 명령에서 아이디를 입력하고, 패스워드 대신에 복사한 토큰값을 입력한다.

- 주의 사항: gist 저장소에는 git 저장소와 달리 하위 폴더를 생성하지 못한다. 모든 파일을 하나의 폴더에 올릴 수밖에 없다.
- 로그인이 되어 있는 경우 그냥 git push 명령어만으로 푸시가 되어 편하다.

# 함수 내 this의 사용에 대하여

원래는 문제를 해결함에 있어서 Class를 선언한 뒤 `this`키워드를 활용할 계획이었다. 하지만 문제를 읽어보며 함수형으로 해야 한다고 하길래 `this`라는 키워드가 현재 가르키는 객체를 가리킨다고 하던데, function이 객체로 인식될까 싶었다.

```js
function meetingRoom() {
  data: {
  }
  console.log(this);
}
```

결론부터 말하자면 function은 객체가 아니기 때문에 function 안에 this를 호출하게 되면 html 내의 태그에서는 `window`객체를 가리킨다.
그냥 터미널에서 실행하게 되는 경우에는 js의 내장메소드를 가지는 객체들을 호출하는 것이 아닌가 싶다.

```zsh
<ref *1> Object [global] {
  global: [Circular *1],
  clearImmediate: [Function: clearImmediate],
  setImmediate: [Function: setImmediate] {
    [Symbol(nodejs.util.promisify.custom)]: [Getter]
  },
  clearInterval: [Function: clearInterval],
  clearTimeout: [Function: clearTimeout],
  setInterval: [Function: setInterval],
  setTimeout: [Function: setTimeout] {
    [Symbol(nodejs.util.promisify.custom)]: [Getter]
  },
  queueMicrotask: [Function: queueMicrotask],
  structuredClone: [Function: structuredClone],
  atob: [Getter/Setter],
  btoa: [Getter/Setter],
  performance: [Getter/Setter],
  navigator: [Getter],
  fetch: [Function: fetch],
  crypto: [Getter]
}
```

아무튼 function과 this를 사용하여 적절한 객체를 가리키고 싶다면, 객체 안에 함수를 넣고, 그 함수 안에서 this를 통해 객체의 값에 접근하는 것이 바람직하다.
결국 구현에 활용하진 않았지만, 꼭 알아둘 상식이지만 몰라서 다시금 되새기려 정리했다.

# 다중 바이트 문자
금일 문제에서 나온 🁢 블록은 다중 바이트 문자이다. 다중 바이트 문자는 문자(또는 다중 바이트 문자는) 한 문자당 1바이트 이상의 바이트를 사용하는 문자들이다. 한국어, 중국어, 일본어 등 많은 언어들이 다중 바이트 문자를 사용한다.

다중 바이트 문자인 유니코드는 기존에 영어와 특수문자만 가능했던 과거와는 다르게 모든 나라의 사람들이 이용할 수 있도록 문자의 폭을 넓혔어야 했는데 이를 8비트(0~255)가지로밖에 표현하지 못한다면 한계가 있기 때문에 유니코드를 사용함으로써 가변적으로 바이트를 사용하는 것이다. 하지만 이러한 유니코드는 가변 길이 인코딩 방식인 UTF-8을 통해 인코딩하지 않는 이상 문자를 인코딩하는 과정에서 오류가 발생할 가능성이 높으며, 특히 슬라이싱에서 많이 나타난다.

나의 경우도 블록을 채우는 문자열을 만드는 과정에서  |🁢🁢|🁢🁢|🁢🁢|🁢🁢|로 된 문자열을 슬라이싱하는 과정에서 물음표가 뜨는 오류를 맞았다. 분명 내가 설계한 인덱스가 맞았는데도 하나하나 인덱스를 검사해보니 인덱스 자체를 유니코드가 포함되어있어 잘못 해석되었다. 앞으로도 유니코드를 사용함에 있어서 꼭 UTF-8로 인코딩한 후에 사용하자.


# readline 모듈에 대하여
readline 모듈은 데이터를 한 줄씩 읽으면서 읽을 수 있는 스트림의 인터페이스를 제공하는 모듈이다.
해당 API는 동기/비동기 기반 모두 따로 사용가능하다.
```js
// 비동기 promise 기반
const readline = require('node:readline/promises');
```

```js
// 콜백과 동기처리 기반
const readline = require('node:readline');
```

## 동기 기반 readline 사용
```js
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

// 인터페이스 생성자
const rl = readline.createInterface({ input, output });

rl.question('What do you think of Node.js? ', (answer) => {
  // TODO: Log the answer in a database
  console.log(`Thank you for your valuable feedback: ${answer}`);

  rl.close();
});
```
동기 기반 readline 사용은 콜백함수를 두번째 파라미터로 넣어 해당 데이터 스트림이 콜백함수 안으로 들어가는 구조를 지닌다.
## 비동기 기반 readline의 사용(Promise)

```js
const readline = require('node:readline/promises')
const { stdin: input, stdout: output } = require('node:process');

const rl = readline.createInterface({ input, output });

const signal = AbortSignal.timeout(10_000);

signal.addEventListener('abort', () => {
  console.log('The food question timed out');
}, { once: true });

const answer = await rl.question('What is your favorite food? ', { signal });
console.log(`Oh, so your favorite food is ${answer}`);
```
반면 비동기 기반 readline의 사용은 Promise를 사용하기 때문에 `await`키워드를 사용하여 비동기적으로 들어오는 질문에 대해 동기적으로 처리할 수 있다.