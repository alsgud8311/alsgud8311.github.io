## Tailwind와 필요한 것들 설치
```shell
npm install -D tailwindcss postcss autoprefixer 
npx tailwindcss init -p
```
### postcss와 autoprefixer는 왜 필요할까?
tailwind만 설치하면 될 줄 알았으나 tailwind가 작동하기 위해서는 postcss와 autoprefixer가 필요하다. 이 둘의 역할에 대해 알아보자.
#### postcss
![](https://i.imgur.com/whuE2nD.png)

postcss의 공식문서에는 `PostCSS is a tool for transforming styles with JS plugins.` 라고 적혀있다. js를 이용하여 css를 변환시킨다는 이야기이다.

postcss는 다른 scss, Stylus들과는 다르게 후처리기의 성격을 지닌다.

>CSS 전처리기
>화면에 보이기 전에 CSS를 변경하고, 스타일을 적용
>CSS 작성 -> 실행 전에 기본 CSS로 컴파일 -> 렌더링
>Stylus, Sass, Less 등

> CSS 후처리기
> 화면에 보여진 뒤에 CSS 스타일을 적용
> CSS 작성 -> 렌더링 -> 외부 모듈을 사용하여 스타일 변경
> PostCSS 등

![](https://i.imgur.com/oHM1gfQ.png)
postCSS는 위와 같이 `Parser -> plugins  -> Stringifier` 의 과정을 거친다.

가장 먼저 Parser에서는 문자열을 tokenizing한 다음 AST로 변환하여 단일 파일을 작성하는 과정을 거친다.
기존의 CSS에 대해서 토큰화 하는 과정을 살펴보자.
```css
.className { color: #FFF; }
```
위와 같은 CSS를 만들기 위해서는 우선 이러한 CSS에 대해 tokenizing한 결과를 보면 
```js
[
    ["word", ".className", 1, 1, 1, 10]
    ["space", " "]
    ["{", "{", 1, 12]
    ["space", " "]
    ["word", "color", 1, 14, 1, 18]
    [":", ":", 1, 19]
    ["space", " "]
    ["word", "#FFF" , 1, 21, 1, 23]
    [";", ";", 1, 24]
    ["space", " "]
    ["}", "}", 1, 26]
]
```
이런 식으로 각각 단일 토큰에 대해서 배열로 관리하며, 토큰 타입, 단어, 위치 정보 등을 관리한다.
```js
const token = [
    // 토큰 타입
    'word',

    // 매칭된 단어
    '.className',

    // 앞 두 숫자 -> 토큰의 시작 위치(optional)
    // `space`와 같은 토큰은 위치 정보 없음

    // 여기서 첫 번째 숫자는 줄 번호이고, 두 번째 숫자는 해당 줄의 열 번호
    1, 1,

    // 이 토큰처럼 여러 문자의 토큰에 대해 끝 위치(optional)
    // 숫자는 위에서 설명한 규칙과 같음
    1, 10
]

```
이렇게 토큰화된 각각의 CSS에 대해서 postcss의 `lib/parse.js`와 `lib/parser.js`의 모듈을 통해 파싱한다. 이 파서를 통해서 CSS에 대한 AST를 생성한다.
```js
'use strict'

let Container = require('./container')
let Input = require('./input')
let Parser = require('./parser')

function parse(css, opts) {
  let input = new Input(css, opts)
  let parser = new Parser(input)
  try {
    parser.parse()
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      if (e.name === 'CssSyntaxError' && opts && opts.from) {
        if (/\.scss$/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse SCSS with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-scss parser'
        } else if (/\.sass/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse Sass with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-sass parser'
        } else if (/\.less$/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse Less with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-less parser'
        }
      }
    }
    throw e
  }

  return parser.root
}

module.exports = parse
parse.default = parse

Container.registerParse(parse)
```
해당 parse에서는 parser 생성자를 통해 다시금 토큰화된 것들을 AST로 만드는 과정을 거치고, 이에 대한 root를 반환한다.

그렇게 만들어진 ast에 대해서는 processor(`lib/processor.js`)를 통해서 플러그인들을 초기화하고 문법적으로 변환하는 과정을 거친다.
```js
'use strict'

let Document = require('./document')
let LazyResult = require('./lazy-result')
let NoWorkResult = require('./no-work-result')
let Root = require('./root')

class Processor {
  constructor(plugins = []) {
    this.version = '8.4.47'
    this.plugins = this.normalize(plugins)
  }

  normalize(plugins) {
    let normalized = []
    for (let i of plugins) {
      if (i.postcss === true) {
        i = i()
      } else if (i.postcss) {
        i = i.postcss
      }

      if (typeof i === 'object' && Array.isArray(i.plugins)) {
        normalized = normalized.concat(i.plugins)
      } else if (typeof i === 'object' && i.postcssPlugin) {
        normalized.push(i)
      } else if (typeof i === 'function') {
        normalized.push(i)
      } else if (typeof i === 'object' && (i.parse || i.stringify)) {
        if (process.env.NODE_ENV !== 'production') {
          throw new Error(
            'PostCSS syntaxes cannot be used as plugins. Instead, please use ' +
              'one of the syntax/parser/stringifier options as outlined ' +
              'in your PostCSS runner documentation.'
          )
        }
      } else {
        throw new Error(i + ' is not a PostCSS plugin')
      }
    }
    return normalized
  }

  process(css, opts = {}) {
    if (
      !this.plugins.length &&
      !opts.parser &&
      !opts.stringifier &&
      !opts.syntax
    ) {
      return new NoWorkResult(this, css, opts)
    } else {
      return new LazyResult(this, css, opts)
    }
  }

  use(plugin) {
    this.plugins = this.plugins.concat(this.normalize([plugin]))
    return this
  }
}

module.exports = Processor
Processor.default = Processor

Root.registerProcessor(Processor)
Document.registerProcessor(Processor)
```
	이렇게 문법적으로 변환하는 과정을 마치면 이를 다시 순수 CSS 구문으로 바꿔줘야 하는데, Stringifier가 AST를 순회하면서 각 노드에 대해 CSS 문자열을 생성해낸다. 



#### autoprefixer
## 템플릿 경로 지정
```
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## index.css에 tailwind 설정 추가
```css
%% index.css %%
@tailwind base;
@tailwind components;
@tailwind utilities;
```
