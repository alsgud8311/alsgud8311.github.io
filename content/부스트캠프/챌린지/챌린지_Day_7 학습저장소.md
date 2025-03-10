# 체크포인트

- [x] 요구조건 분석 ✅ 2024-07-23
- [x] 정규표현식 설계 ✅ 2024-07-23
- [x] Path 클래스 설계 ✅ 2024-07-23
- [x] path 함수 설계 및 구현 ✅ 2024-07-23
- [x] Jest 학습 ✅ 2024-07-24
- [x] appendComponent 함수 설계 및 구현 ✅ 2024-07-24
- [x] deleteLastComponent 함수 설계 및 구현 ✅ 2024-07-24
- [x] path 함수 설계 및 구현 ✅ 2024-07-24

# 요구조건 분석

Path 문자열을 분석해서 처리하는 라이브러리를 구현하는 문제이다.
Path와 URL 규격을 이해하고, 이를 기반으로 경로 Path를 처리해야 한다.
문자열을 초기 매개변수로 전달하면 Path 객체를 생성하며, UNIX,Windows 스타일 구성 방식을 모두 지원해야 한다.
UNIX, WIndows 스타일의 경로를 받아 이에 대해 처리해주는 과정이 필요하며, 이를 다시 UNIX, Windows 스타일로 재조합할 수 있어야 한다.

## 예시 분석

각 예시를 보면 생성되는 객체의 Property는 모두 같다.

```js
//UNIX
const path = new Path("/home/user/boost/camp/challenge/day8/problem.md");

//path.root = "/"
//path.base = "problem.md"
//path.ext = ".md"
//path.name = "problem"
//path.lastDirectory = "day8"
//path.components = ["/", "home", "user", "boost", "camp", "challenge", "day8", "problem.md"]

//path.absoluteString = "/home/user/boost/camp/challenge/day8/problem.md"
//path.existFile = True
//path.fileSize = 1024

//Windows
const path = new Path("C:\\home\\user\\boost\\camp\\challenge\\day8\\problem.md");

//path.root = "C:\"
//path.base = "problem.md"
//path.ext = ".md"
//path.name = "problem"
//path.lastDirectory = "day8"
//path.components = ["C:\", "home", "user", "boost", "camp", "challenge", "day8", "problem.md"]

//path.absoluteString = "C:\home\user\boost\camp\challenge\day8\problem.md"
//path.existFile = True
//path.fileSize = 968

```
#### root : String
- UNIX :  `/`로 시작한다
- Windows : {드라이브}:\\\\로 시작한다.
#### base : String
해당 경로가 가르키는 최종 위치를 표시한다.
슬래시들로 구분한 가장 마지막이며, `파일이름.확장자`의 형태로 되어 있다.

#### ext : String
해당 파일의 확장자를 의미한다.
온점(.)을 포함하여 문자열이 들어가야 한다.

#### name : String
해당 파일의 이름을 의미한다.

#### lastDirectory : String
해당 파일의 최하위 위치를 의미한다.
components에서 파일 바로 앞의 문자열을 의미하기도 한다.

#### Components : String[]
모든 경로에 대해 문자열들로 이루어진 배열이다.
배열의 순서는 각 경로에 대해서 이다.
#### absoluteString : String
전체 경로명이다.
직접 저장하면 안되고 위에서 분석한 내용으로 조합해서 만들어야 한다.
#### existFile : Bool
생성 시점을 기준으로 파일이 존재하는지 여부를 판단한다.

#### fileSize : Int
생성 시점을 기준으로 파일의 크기를 가져온다.

# 정규표현식 분석
정규표현식의 경우 UNIX와 Windows 정규표현식을 따로 만들고, 이에 대해 검사에서 맞는 운영체제를 넘겨주면, 각 운영체제마다 작동을 다르게 만들려고 한다.
## UNIX

```js
export const UNIX_REGEX = /^\/[\w\/\-]+\/([\w\-]+(\.[a-zA-Z0-9]+){1,})$/;
```
체크한 케이스
- 맨 앞이 `/`로 시작
- 중간엔 `/`와 다른 문자들만 들어가야 함
- 마지막엔 /파일(문자, 숫자, \_만 가능).확장자(문자만 가능)

## Windows

```js
export const WINDOWS_REGEX = /^[a-zA-Z\-]:[\\](?:[\w]+[\\])*[\w\-]+(\.[a-zA-Z0-9]+){1,}$/;
```
체크한 케이스
- 맨 앞이 `{드라이브}\\`로 시작
- 중간엔 `\\`와 다른 문자들만 들어가야 함
- 마지막엔 \\\\파일(문자, 숫자, \_만 가능).확장자(문자만 가능)

각 운영체제에서 UNIX는 Path를 콜론, Windows는 ;세미콜론으로 구분한다.
해당 경로에서 만약 :가 나오게 된다면 해당 경로에서 파일을 검색하고, 이후의 경로에서 파일을 검색해서 나오는 파일을 리턴해야 한다.

### 파일명 지우기
```js
export const REMOVE_FILENAME = /(?<=.*)\.[a-zA-Z0-9]+$/;
```
파일병 지우기의 경우 base에서 앞에 있는 모든 문자들을 지운 다음에 마지막에 `.확장자`만 나올 수 있도록 후방탐색자를 통해 찾아주었다.
### 확장자 지우기
```js
export const REMOVE_EXT = /(\.[a-zA-Z\.]+)/g;
```
확장자를 지우는 정규표현식은 name에 대해서 알아야 하기 때문에 .뒤로 가는 모든 문자들을 지우도록 했다.
### 파일이름.확장자만 추출하기
```js
export const REGEX_FILENAME = /[^\\/]*([\w]+)\.([a-zA-Z0-9]+)$/;
```
해당 정규표현식은 replace 함수에 넣어 파일이름.확장자를 제외한 모든 것들을 삭제시키고 파일이름.확장자만 가져오기 위해 설계한 정규표현식이다.


# 설계
## Path 클래스 설계 및 구현

- 생성자를 통해 생성하면서 정규표현식 체크
- processing 함수를 통해 Unix,Windows 구분 + 경로를 split하여 각 속성값 업데이트
- 정규표현식 검사에 맞는 운영체제를 검사하여 파싱하는 곳에 옵션으로 넣어주어 파싱
- 파싱한 문자를 stringify에 넣으면 JSON.stringify하여 출력
- 파일 경로에 대한 처리가 끝났으면 실제 경로에 파일이 있는지 검색
- 해당 파일을 찾아 사이즈(실체)의 여부에 따라 존재값 할당

```js
import {
  REMOVE_EXT,
  REMOVE_FILENAME,
  UNIX_REGEX,
  WINDOWS_REGEX,
} from "./regex";
import { PathType } from "./pathtype";
import { statSync } from "fs";

export class Path implements PathType {
  base: string = "";
  components: string[] = [];
  dir: string = "";
  ext: string = "";
  lastDirectory: string = "";
  name: string = "";
  os: string = "";
  root: string = "";

  constructor(path: string) {
    this.processing(path);
  }
  checkFile(path: string): number {
    throw new Error("Method not implemented.");
  }

  public get absoluteString(): string {
    let slash = this.os === "UNIX" ? "/" : "\\";
    return this.root + this.components.slice(1).join(slash);
  }

  public get fileSize(): number {
    try {
      return statSync(this.absoluteString).size;
    } catch (error) {
      return 0;
    }
  }
  public get existFile() {
    try {
      if (this.fileSize > 0) return true;
      return false;
    } catch (error) {
      return false;
    }
  }

  public stringify(): string {
    let text = `{
      root: '${this.root}',\n
      dir: '${this.dir}',\n
      base: '${this.base}',\n
      ext: '${this.ext}',\n
      name: '${this.name}',\n
    }`;
    return text;
  }

  public processing(path: string): void {
    try {
      let isUNIX = this.checkOS(path);
      if (isUNIX) {
        this.parsingUnix(path);
      } else {
        this.parsingWindows(path);
      }
    } catch (error) {
      console.log(error);
    }
  }
  public checkOS(path: string): boolean {
    if (UNIX_REGEX.test(path)) {
      this.os = "UNIX";
      return true;
    } else if (WINDOWS_REGEX.test(path)) {
      this.os = "Windows";
      return false;
    }
    return false;
  }

  public parsingUnix(path: string): void {
    this.components = path.split("/");
    this.dir = this.components.slice(0, this.components.length - 1).join("/");
    this.components[0] = "/";
    this.root = "/";
    this.base = this.components[this.components.length - 1];
    this.ext = this.base.match(REMOVE_FILENAME)?.[0] ?? "";
    this.name = this.base.replace(REMOVE_EXT, "");
    this.lastDirectory = this.components[this.components.length - 2];
  }

  public parsingWindows(path: string): void {
    this.components = path.split("\\");
    this.dir = this.components.slice(0, this.components.length - 1).join("\\");
    this.root = this.components[0];
    this.components[0] += "\\";
    this.base = this.components[this.components.length - 1];
    this.ext = this.base.replace(REMOVE_FILENAME, "");
    this.name = this.base.replace(REMOVE_EXT, "");
    this.lastDirectory = this.components[this.components.length - 2];
  }

  public appendComponent(folderPath: string) {
    this.components.splice(this.components.length - 1, 0, folderPath);
    this.lastDirectory = folderPath;
  }
  public deleteComponent() {
    this.components.splice(this.components.length - 2, 1);
    this.lastDirectory = this.components[this.components.length - 2];
  }
}
```
처음엔 Readonly속성으로 추가해야하는 absoluteString, fileSize, existFile에 대한 고민이 많았다. 
처음에는 readonly 타입을 추가해줬었는데, 이렇게 하다보면 다음 문제에서 해당 클래스 인스턴스의 주소를 추가해줬을 때 absoluteString이 바뀌지도 않고, 그렇다고 readonly인 값을 바꿀 수도 없다.
## Path 함수 구현 및 설계
```js
import { Path } from "./path";
import { REGEX_FILENAME } from "./regex";

export function path(path: string) {
  let splittedPath;
  let fileName;
  if (path[0] === ":" || path[0] === "/") {
    fileName = path.match(REGEX_FILENAME)?.[0];
    path = path.replace(REGEX_FILENAME, "");
    splittedPath = path.split(":");
    console.log(splittedPath);
  } else {
    fileName = path.match(REGEX_FILENAME)?.[0];
    path = path.replace(REGEX_FILENAME, "");
    splittedPath = path.split(";");
  }
  let searchResult = pathSearch(splittedPath, fileName);
  if (searchResult) {
    return searchResult;
  }
  console.log("해당하는 파일이 없습니다.");
  return;
}

function pathSearch(splittedPath: string[], fileName: string | undefined) {
  for (let i = 0; i < splittedPath.length; i++) {
    let file;
    if (i === splittedPath.length - 1) {
      file = new Path(splittedPath[i] + fileName);
    } else {
      file = new Path(splittedPath[i] + "/" + fileName);
    }
    if (file.fileSize > 0) return file;
  }
}
```
path 함수에서는 여러개가 콜론 또는 세미콜론으로 구분될 수 있으니 이러한 경우를 찾아 각 OS마다 처리방식이 상이하다.
각 OS마다 정규표현식을 통해 파일 이름과 확장자까지 받고, path 문자열에서는 지워준다.
이렇게 파일 이름이 지워진 각 문자열을 콜론 또는 세미콜론으로 split하면 마지막을 제외한 경로의 마지막엔 슬래시가 붙어있지 않기 때문에 따로 붙여주고 객체를 생성하여 사이즈가 있는지, 즉 존재하는 파일인지를 확인했다.
존재하지 않을 경우 다시 path 함수로 돌아가 아무것도 리턴시키지 않는다.

```zsh
Path {
  base: 'path.ts',
  components: [
    '/',      'Users',
    'miguel', 'Desktop',
    'naver',  'challenge',
    'day7',   'path.ts'
  ],
  dir: '/Users/miguel/Desktop/naver/challenge/day7',
  ext: '.ts',
  lastDirectory: 'day7',
  name: 'path',
  os: 'UNIX',
  root: '/',
  absoluteString: '/Users/miguel/Desktop/naver/challenge/day7/path.ts',
  fileSize: 3036,
  existFile: true
}
```
객체 찾았을 때 결과

```zsh
 ts-node "/Users/miguel/Desktop/naver/challenge/day7/main.ts"
{
      root: '/',

      dir: '/Users/miguel/Desktop/naver/challenge/day7',

      base: 'path.ts',

      ext: '.ts',

      name: 'path',

    }
```
`console.log(a?.stringify())`했을때 결과
제대로 나온당

## pathComponents
아 내가 왜 이거 지금 봤지 하
### appendComponent & deleteComponent
```ts
  public appendComponent(folderPath: string) {
    this.components.splice(this.components.length - 1, 0, folderPath);
    this.lastDirectory = folderPath;
  }
  public deleteComponent() {
    this.components.splice(this.components.length - 2, 1);
    this.lastDirectory = this.components[this.components.length - 2];
  }
```
appendComponent와 deleteComponent 메소드는 중간의 경로를 바꿔주는 것이기 때문에 components의 값과 lastDirectory의 값만 변경해주면 된다.
absoluteString은 get 메소드에서 components들에 대해 조합해서 리턴해주는 메소드로 설계했기 때문에 변경이 되더라도 따로 해당 값에 접근하여 변경하지 않아도 되기 때문에 read-only 조건을 충족한다.

## 테스트하고 비교하기

```js
import { Path } from "./path";

describe("파일 분석 비교 테스트", () => {
  var path1 = new Path("/Users/miguel/Desktop/naver/challenge/day7/path.ts");
  var path2 = new Path(
    "/Users/miguel/Desktop/naver/challenge/day7/path.test.ts"
  );

  test("서로 다른 파일 크기 비교", () => {
    expect(path1.fileSize).toBeGreaterThan(path2.fileSize);
  });
  test("서로 다른 파일 파일명만 비교", () => {
    expect(path1.absoluteString).toEqual(path2.absoluteString);
  });
  test("서로 다른 파일 내용 비교", () => {
    expect(path1).toEqual(path2);
  });
});
```

path.ts와 path.test.ts파일을 비교해보았다.
```zsh
 npm test

> day7@1.0.0 test
> jest

  console.log
    Path {
      base: 'path.test.ts',
      components: [
        '/',
        'Users',
        'miguel',
        'Desktop',
        'naver',
        'challenge',
        'day7',
        'path.test.ts'
      ],
      dir: '/Users/miguel/Desktop/naver/challenge/day7',
      ext: '.ts',
      lastDirectory: 'day7',
      name: 'path',
      os: 'UNIX',
      root: '/'
    }

      at Object.<anonymous> (path.ts:112:9)

 FAIL  ./path.test.ts
  파일 분석 비교 테스트
    ✓ 서로 다른 파일 크기 비교 (1 ms)
    ✕ 서로 다른 파일 파일명만 비교 (2 ms)
    ✕ 서로 다른 파일 내용 비교 (3 ms)

  ● 파일 분석 비교 테스트 › 서로 다른 파일 파일명만 비교

    expect(received).toEqual(expected) // deep equality

    Expected: "/Users/miguel/Desktop/naver/challenge/day7/path.test.ts"
    Received: "/Users/miguel/Desktop/naver/challenge/day7/path.ts"

      11 |   });
      12 |   test("서로 다른 파일 파일명만 비교", () => {
    > 13 |     expect(path1.absoluteString).toEqual(path2.absoluteString);
         |                                  ^
      14 |   });
      15 |   test("서로 다른 파일 내용 비교", () => {
      16 |     expect(path1).toEqual(path2);

      at Object.<anonymous> (path.test.ts:13:34)

  ● 파일 분석 비교 테스트 › 서로 다른 파일 내용 비교

    expect(received).toEqual(expected) // deep equality

    - Expected  - 2
    + Received  + 2

    @@ -1,16 +1,16 @@
      Path {
    -   "base": "path.test.ts",
    +   "base": "path.ts",
        "components": Array [
          "/",
          "Users",
          "miguel",
          "Desktop",
          "naver",
          "challenge",
          "day7",
    -     "path.test.ts",
    +     "path.ts",
        ],
        "dir": "/Users/miguel/Desktop/naver/challenge/day7",
        "ext": ".ts",
        "lastDirectory": "day7",
        "name": "path",

      14 |   });
      15 |   test("서로 다른 파일 내용 비교", () => {
    > 16 |     expect(path1).toEqual(path2);
         |                   ^
      17 |   });
      18 | });
      19 |

      at Object.<anonymous> (path.test.ts:16:19)

Test Suites: 1 failed, 1 total
Tests:       2 failed, 1 passed, 3 total
Snapshots:   0 total
Time:        0.928 s, estimated 1 s
Ran all test suites.
```
이런 식으로 비교하여 서로 다른 파일 내용을 비교하고, 파일명, 크기들에 대해서 테스트를 진행했다.
`.test.ts`와 같은 경우도 정규표현식을 통해 필터링해주었기 때문에 확장자인 .ts만 성공적으로 뽑아낸 것을 확인할 수 있었다.