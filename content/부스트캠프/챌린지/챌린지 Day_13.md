# 24-A조 J238, J031

  

# 우리의 체크 포인트

  

- [x] init 명령어

	- [x] 파일별로 blob 오브젝트를 생성한다.

	- [x] 해시값 앞에 8자리를 objects 하위 디렉토리로 생성한다.

	- [x] 나머지 부분을 파일명으로 (위에서 만든 해시값 앞자리 디렉토리에) 저장한다.

	- [x] blob 오브젝트 파일 내용은 원본 파일을 zlib로 압축해서 저장한다.

- [x] add 명령어

	- [x] 디렉토리에서 전체 파일 목록을 탐색하고, 각 파일 내용에 대한 sha256 해시 값을 비교한다.

	- [x] commit이 없거나 직전 commit 이후 해시값이 달라진 파일 목록을 저장한다

- [x] status 명령어

	- [x] add 명령으로 만들어진 변경된 파일 목록을 전체 경로와 함께 출력한다

- [x] commit 명령어

	- [x] blob 오브젝트 생성

	- [x] tree 오브젝트 생성

	- [x] commit 오브젝트 생성

	- [x] 커밋 기록을 index에 추가한다.

- [x] log 명령어

	- [x] 명령 형식은 mit log 디렉토리명 이다.
	
	- [x] 디렉토리명/.mit/index/commits 에서 커밋을 찾아서 이력을 출력한다.

- [x] commit 마다 현재 tree를 확인해서 변경된 파일명을 함께 표시한다

- [ ] restore 명령어

  

# 문제 해결 과정

  

![](https://i.imgur.com/ZuyzvJT.png)

  

### init 명령어

  

`mit init 디렉토리명`

  

1. .mit 하위 디렉토리 생성

2. .mit 디렉토리 아래에 `/.mit/objects/`와 `/.mit/index/` 하위 디렉토리를 생성

  

### add 명령어

  

```

mit add 디렉토리명

- 디렉토리에서 전체 파일 목록을 탐색하고, 각 파일 내용에 대한 sha256 해시 값을 비교한다.

- commit이 없거나 직전 commit 이후 해시값이 달라진 파일 목록을 저장한다

```

  

1. 디렉토리에서 전체 파일 목록 살펴보기

2. 파일을 돌면서 디렉토리가 나오면 재귀적으로 돌고, 파일명만 반복해서 으면서

3. commit이 없거나 직전 commit 이후 해시값이 달라진 파일 목록을 .mit/index/ 에 변경된 값을 저장

(저장 형식 - 파일 해시값 / 파일 상대 경로)

예시

bc2db54bb59cfb6d25308054726bc209a126f668 somethingNew/test.txt

6b584e8ece562ebffc15d38808cd6b98fc3d97ea test.txt

  

📁 디렉토리

  

- 추가된 파일(test.txt)

- objects

- index

예시: 디렉토리에 생성 test.txt ('create text')

파일 예시 해시값 - 2e65efe2a145dda7ee51d1741299f848e5bf752e

  

```

git대로 생각했을 때

1. mit add 디렉토리명

2. 디렉토리명 안의 디렉토리 혹은 파일을 돈다

- 파일일 경우 -> 파일에 대해 blob 파일을 만들고, 하나의 트리에 기록

- 디렉토리일 경우 -> 재귀적으로 디렉토리명 안의 디렉토리 혹은 파일을 돌면서 모든 파일을 만들고, 이를 하나의 트리에 넣은 다음 그 트리의 해시값을 상위 트리에 기록

3. 해당 모든 정보들을 가진 최상위 트리(루트 트리) 개체를 하나 만들어 object 내에 저장

4. .mit/index 안에 파일을 하나 두고 여기에서 commit 개체의 tree 속성에다가 집어넣기

5. 나중에 commit이 되기 전까지 add를 하면 그게 계속 갱신됨

6. 나중에 commit을 하면 commit message와 함께 새롭게 commit 개체를 .mit/index/commits에 저장

  
  
  

-a

-b

-c

-d

-e

-f

이런 식으로 디렉토리가 되어 있다고 가정하면

  

a(루트)

b(파일해시값) c(tree)

c -> d, e(tree)

e -> f

  
  
  

- .git/objects 파일 내부

.git/objects

.git/objects/.DS_Store

.git/objects/d0

.git/objects/d0/5bdf0ee8f1f50e60cc2244a322d58cdd0ef873

.git/objects/bc

.git/objects/bc/2db54bb59cfb6d25308054726bc209a126f668

.git/objects/pack

.git/objects/6b

.git/objects/6b/584e8ece562ebffc15d38808cd6b98fc3d97ea

.git/objects/info

  

- index 파일 내부 (git add 명령어 실행 후 생성됨)

100644 d05bdf0ee8f1f50e60cc2244a322d58cdd0ef873 0 .DS_Store

100644 bc2db54bb59cfb6d25308054726bc209a126f668 0 somethingNew/test.txt

100644 6b584e8ece562ebffc15d38808cd6b98fc3d97ea 0 test.txt

```

  

test

  

- 폴더

- 파일

- 파일

  

1. mit add 디렉토명

2. 디렉토리 내의 파일들을 objects/2e/65... 등으로 만들어 저장

3. 파일들을 모두 가리키는 tree를 objects 폴더에 저장

4. 해당 트리의 해시값을 index에 저장

  

- 트리를 만든 후, 해당 트리의 해시값을 Index에 저장

  

```

논의했던 사안들

- 파일들을 모두 objects 폴더 안에 저장하고, 변동사항등을 비교한 뒤에 Index 디렉토리 안의 파일에 이러한 파일들에 대한 해시값들을 모두 기록

```

  

### status 명령어

  

```

mit status 디렉토리명

```

  

- index에 저장된 변경 파일 목록 중에서 디렉토리 명을 포함하는 파일들 모두 출력

  

### commit 명령어

  

```

mit commit 디렉토리명

```

  

1. 주어진 디렉토리가 최상위 디렉토리로 되어 있을 때, 해당 디렉토리 안의 폴더들에 대해서 모두 blob 오브젝트를 생성

2. object 해시값 앞의 8자리를 하위 디렉토리로 생성하고, 나머지 부분을 파일명으로 저장

3. 파일 내용은 zlib으로 압축해서 저장

4. 파일을 저장하면서 tree 오브젝트에 저장된 모든 파일들을 기록

5. 오브젝트는 blob마다 blob 해시값, 압축 후 파일 크기, 파일명을 전부 받고, 이를 다시 파일로 tree object 파일로 저장(SHA256)

6. .mit/index/commits를 보고 커밋이 있으면 가장 최신의 커밋을 가져옴

7. 가져온 커밋을 새로 만드는 commit object의 이전 트리를 가져와 넣고, 현재 트리도 넣고 .mit/objects에 blob과 동일한 형태로 파일명을 저장

8. 해당 커밋의 해시값을 .mit/index/commits에 기록한다

  

### log 명령어

  

```

mit log 디렉토리명

- 디렉토리명/.mit/index/commits 에서 커밋을 찾아서 이력을 출력한다.

- commit 마다 현재 tree를 확인해서 변경된 파일명을 함께 표시한다.

```

  

```

1 commit (커밋 오브젝트)

0 | 1 tree hash(현재)

1 tree hash의 정보를 보여준다. (파일명, 파일 해시값)

  

test.txt 변경했습니다.

  

2 commit

1 tree hash | 2 tree hash

2 tree hash의 정보를 보여준다.

  

test1.txt 변경했습니다.

```

  

1. index의 각 커밋 기록에 남아있는 현재 tree 해시값으로 가서 변경 내역들을 모두 출력

  

### restore 명령어

  

```

mit resotore 디렉토리명 {8자리|64자리 커밋해시값}

- 특정한 커밋 해시값을 입력하면, 최신 커밋부터 차례대로 커밋 파일의 tree에 포함된 blob 내용을 꺼내서 파일을 복원한다.

- 커밋 해시값은 앞 8자리만 입력하는 경우에도 해당 object 디렉토리에 커밋 파일이 1개만 있는 경우 그 커밋을 복원한다.

- 단계별로 커밋은 index/commits 파일에서 삭제하고, 입력한 커밋해시값을 가진 커밋 정보까지만 남겨놓는다.

- 복원 과정에서 필요없는 commit, tree, blob 오브젝트는 삭제하지 않는다.

```

  

1. 8자리 폴더로 이동 -> 64-8=56자리 커밋 파일 보기

2. 해당 파일의 tree에 포함된 blob 내용을 꺼내 파일 복원

입력한 커밋해시값을 가진 커밋 정보까지 반복

  

# 결과

  

![](https://i.imgur.com/0HX9McR.png)

init, add, commit, log까지는 모두 정상 동작함을 확인할 수 있었다.

  
# 개선하기
## 개선 체크포인트

- [x] 파일 관련 클래스 만들어 정적 메서드로 관리하기 ✅ 2024-08-01
- [x] 공통적으로 쓰이는 file 경로 변수 할당하여 재사용 ✅ 2024-08-01
- [x] 예외처리 ✅ 2024-08-01
- [x] restore 구현하기 ✅ 2024-08-01
- [x] commit log 제대로 파일을 저장하지 않았던 문제 수정 ✅ 2024-08-01

이번 리팩토링은 구현하지 못했던 기능과 더불어 매우 만족스러웠던 결과를 가져왔다.
![](https://i.imgur.com/gV55Tlv.png)
기존에 '너무 지저분한데?' 라고 생각할 만큼 난잡한 코드라서 문제가 하나 터지면 어디서 문제가 터지는지 알아내는 데만 한세월이 걸렸는데 이제는 그나마 읽을 수라도 있는 코드가 되었다.

## 파일 관련 클래스 만들어 정적 메서드로 관리하기
```js
const { existsSync, mkdirSync, writeFileSync, readFileSync } = require("fs");
const { deflateSync } = require("zlib");
const cryptoJs = require("crypto-js");
const zlib = require("zlib");

class FileManager {
  static dirExceptionHandler(dir, hash) {
    if (!existsSync(`./${dir}/.mit/objects/${hash.slice(0, 8)}`)) {
      mkdirSync(`./${dir}/.mit/objects/${hash.slice(0, 8)}`, () => {});
    }
  }

  static async jsonFileDeflate(file) {
    const hash = cryptoJs.SHA256(file).toString();
    const blob = new Blob([JSON.stringify(file, null, 2)], {
      type: "application/json",
    });
    const converted = await blob.arrayBuffer();
    const deflatedFile = deflateSync(converted);
    return { hash, deflatedFile };
  }

  static writeFile(dir, hash, deflatedFile) {
    const filePath = `./${dir}/.mit/objects/${hash.slice(0, 8)}/${hash.slice(
      8
    )}`;
    writeFileSync(filePath, deflatedFile);
  }

  static jsonFileInflate(dir, hash) {
    let file = readFileSync(
      `./${dir}/.mit/objects/${hash.slice(0, 8)}/${hash.slice(8)}`
    );
    file = zlib.inflateSync(file).toString("utf-8");
    return JSON.parse(file);
  }
}

module.exports = { FileManager };

```
기존 코드의 경우, 파일을 읽어올 때는 매 해시값을 통해 파일에 진입-> zlib 압축을 해제 -> JSON Parsing -> 각 데이터 처리 와 같은 일련의 과정이 공통적으로 수반되었고, add와 같은 함수의 경우 SHA256 해싱 -> JSON stringify -> Blob객체화 -> zlib 압축과 같은 복잡한 과정이 계속해서 수반되어야만 했다. 그러다보니 모든 함수들에 대부분 이러한 로직이 공통적으로 들어가게 되었고, 결국 blob, commit, tree object와 commit blob 파일을 계속해서 갱신해줘야 하는 commit 함수와 그에 맞는 기능적인 함수들이 모두 가독성이 매우 떨어질 정도로 코드가 길고 난잡했다. 어제 코드를 짜면서도 계속 생각하고 있었지만, 구현에 급급해서 하다보니 리팩토링까지 미뤘었다. 
이번 리팩토링에선 FileManager라는 클래스를 두고, 해당 클래스의 인스턴스를 굳이 만들어서 사용하는 것이 아닌, 기능적으로 비슷한 과정들을 거치는 파일 압축과 해제와 관련된 파일 관련 정적 메서드들을 모두 넣어두어 필요할 때마다 해당 정적  메서드만 가져와서 쓰는 방식으로 설계하여 기존 코드를 개선했다.
```js
async function commit(directory) {
  const currentTreeHash = await treeCommit(directory);
  const prevCommitHash = getLastCommit(directory);
  const time = new Date();
  const commitData = `${prevCommitHash} ${currentTreeHash}\n${time}`;
  const hash = cryptoJs.SHA256(commitData).toString();
  const blob = new Blob([JSON.stringify(commitData, null, 2)], {
    type: "application/json",
  });
  const converted = await blob.arrayBuffer();
  const compressed = zlib.deflateSync(converted);
  const filePath = `./${directory}/.mit/objects/${hash.slice(0, 8)}`;
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, () => {
      console.log("만들어짐");
    });
  }
  // commit object
  fs.writeFileSync(`./${filePath}/${hash.slice(8)}`, compressed);
  commitUpdate(directory, hash);
  status(directory);
  await garbageCollect(directory);
}
```
당장 commit 안에 있는 함수들만 하더라도 각각의 함수가 해당 커밋 함수 안의 로직을 대부분 공통적으로 사용하고 있었다.
```js
async function commit(directory) {
  //현재 변경사항에 대해서 blob 파일을 만들어 저장하고, Tree Object를 만들어 트리의 해시값을 반환
  const currentTreeHash = await treeCommit(directory);
  //직전 커밋 해시값을 가져옴(commit object의 가장 최근 해시값)
  const prevCommitHash = getLastCommit(directory);
  const time = new Date();
  //갱신할 커밋 데이터(commit Object용)
  const commitData = `${prevCommitHash} ${currentTreeHash}\n${time}`;
  const { hash, deflatedFile } = await FileManager.jsonFileDeflate(commitData);
  // 해당 폴더 없으면 만들어주기
  FileManager.dirExceptionHandler(directory, hash);
  // commit object 저장
  FileManager.writeFile(directory, hash, deflatedFile);
  //.mit/index/commits에 있는 가장 최근값 최신화
  commitUpdate(directory, hash);
  status(directory);
  await garbageCollect(directory);
}
```
하지만 현재는 폴더 생성 및 파일 생성, 해제 등의 기능을 가진 FileManager의 정적 메서드를 활용하여 해당 메서드가 무슨 역할을 하는지에 대해서 보다 가독성이 좋아졌으며, 코드의 길이도 비교적 줄어들어 개선되었다고 생각한다.

## 공통적으로 쓰이는 file 경로 변수 할당하여 재사용

```js
 !fs.existsSync(`./${dir}/.mit/objects/${hash.slice(0, 8)}/${hash.slice(8)}`)
  )
```
리팩토링 전에는 경로를 확실하게 보기 위해 모든 로직에 이러한 방식으로 하드코딩 해가면서 경로를 각각 넣어줬는데, 리팩토링 과정에서 이러한 공통적으로 쓰이는 경로의 문자열 등을 하나의 변수에 할당하여 재활용하는 방식으로 개선하였다.
```js
async function commitUpdate(dir, currCommitHash) {
  const path = `./${dir}/.mit/index/commits`;
  if (!fs.existsSync(path)) {
    const { deflatedFile } = await FileManager.jsonFileDeflate(currCommitHash);
    fs.writeFileSync(path, deflatedFile);
    return;
  }
  const file = fs.readFileSync(path);
  // .mit/index/commits의 커밋 해시값은 한 줄씩 기록
  let commits =
    currCommitHash +
    "\n" +
    JSON.parse(zlib.inflateSync(file).toString("utf-8"));
  const { deflatedFile } = await FileManager.jsonFileDeflate(commits);
  fs.writeFileSync(path, deflatedFile);
}
```
특별히 index/commits에 들어가는 경우는 거의 없기 때문에 따로 메서드를 만들지 않고, objects 디렉토리 안에 들어가는 것들만 넣어주었으며 이러한 경우 path 변수를 사용하여 보다 코드의 가독성을 개선하였다.

## 예외처리
```js
// 저장한 커밋 로그에서 변동사항 파일만 받아 저장시키고 Tree Object에 필요한 변동사항 배열 넘김
async function blobCommit(dir) {
  const data = readChanged(dir);
  let commitData = [];
  for (const blob of data) {
    const { hash, path, fileName, status } = blob;
    if (status !== "삭제됨") {
      const file = fs.readFileSync(path).toString();
      const { hash, deflatedFile } = await FileManager.jsonFileDeflate(file);
      FileManager.dirExceptionHandler(dir, hash);
      FileManager.writeFile(dir, hash, deflatedFile);
      const fileSize = fs.statSync(path).size;
      commitData.push(`+ ${hash} ${fileSize} ${path} ${status}`);
    } else {
      commitData.push(`- ${hash} ${path} ${status}`);
    }
  }
  return commitData;
}
```
blob들에 대해서 각각 commit을 할 때 데이터에 넣어주는 과정에서  삭제의 경우만 따로 예외처리를 하면서 해당 파일을 읽어들이는 것이 아닌, 이전의 해시값을 가져와 넣어주어 나중에 복원할 때 해당 커밋들의 로그에서 해시값을 찾아내어 복원하는 방식으로 하면서 기존의 해시값을 갱신하는 경우에 예외처리를 시켜주었다.
또한 추가, 갱신, 수정의 경우 +로, 수정의 경우는 따로 -로 구분하여 보여줌으로써 사용자의 입장에서 보다 보기 좋은 커밋 로그를 볼 수 있도록 하였다.

## restore 구현하기
```js
const { readFileSync, writeFileSync, existsSync } = require("fs");
const zlib = require("zlib");
const { FileManager } = require("./fileManager");

async function restore(dir, hash) {
  const commitHashLogs = await getcommitHashLogs(dir);
  // 유효성 검증을 통해 먼저 해시값에 해당하는 로그가 있는지 검사
  const index = checkValidity(commitHashLogs, hash);
  for (let i = 0; i < index; i++) {
    // 각 커밋의 최신 반영사항 가져오기
    const treeObj = getHashObj(dir, commitHashLogs[i]);
    rollBack(dir, treeObj);
  }
  await updateCommitHash(dir, commitHashLogs.slice(index - 1));
}

async function getcommitHashLogs(dir) {
  const path = `./${dir}/.mit/index/commits`;
  if (!existsSync(path)) throw new Error("커밋 내역이 없습니다.");
  const file = readFileSync(path);
  const commitHashLogs = JSON.parse(
    zlib.inflateSync(file).toString("utf-8")
  ).split("\n");
  return commitHashLogs;
}

function checkValidity(hashlogs, hash) {
  const index = hashlogs.findIndex((log) => log === hash);
  if (index === -1)
    throw new Error("해당 해시값에 일치하는 커밋 해시값이 없습니다.");
  return index;
}

function getHashObj(dir, hash) {
  const hashObj = FileManager.jsonFileInflate(dir, hash);
  const treeObj = hashObj.split("\n")[0].split(" ")[1];
  return treeObj;
}

function rollBack(dir, hash) {
  let blobs = FileManager.jsonFileInflate(dir, hash);
  if (blobs.includes("\n")) blobs = blobs.split("\n");
  if (Array.isArray(blobs)) {
    blobs.forEach((blob) => {
      if (blob[0] === "-") {
        const blobHashToRollBack = blob.split(" ")[1];
        const path = blob.split(" ")[2];
        const content = FileManager.jsonFileInflate(dir, blobHashToRollBack);
        writeFileSync(path, content);
      }
    });
  } else {
    if (blobs[0] === "-") {
      const blobHashToRollBack = blobs.split(" ")[1];
      const path = blobs.split(" ")[2];
      const content = FileManager.jsonFileInflate(dir, blobHashToRollBack);
      writeFileSync(path, content);
    }
  }
}

async function updateCommitHash(dir, hashlogs) {
  const path = `./${dir}/.mit/index/commits`;
  if (typeof hashlogs !== "object") {
    hashlogs = hashlogs.join("\n");
  }
  const { deflatedFile } = await FileManager.jsonFileDeflate(hashlogs);
  writeFileSync(path, deflatedFile);
  console.log(
    "복원이 완료되었습니다.\n 해당 커밋 이후의 커밋들은 모두 사라집니다."
  );
}
/**
 * 1. 커밋 해시값을 입력 받아서 .mit/index/commits에서 해시값 존재 여부 판단
 * 2. 이전 트리, 현재 트리가 있는데 각각 루프
 * 3. 트리로 가서 blob 해시값과 파일 이름을 뽑아내고, 그걸 다시 압축해제하여 writeSync
 */

module.exports = { restore };

```
restore의 경우 구현하고 싶었지만 최소한이라도 조금 잔 다음에 해야 할 것 같아 아쉽게도 구현하지 못했던 기능이었다. 
해당 기능의 경우
1. 해당 커밋 해시값을 스택에서 인덱스 찾기
	- 만약 커밋 해시값이 없다면 예외처리
2. 인덱스를 받고 해당 인덱스 값 이전까지 모든 해시값에 대하여 해시 개체에 접근
3. 해시 개체에서 오른쪽에 있는 최근 commit의 트리 해시값에 접근
4. 최근 트리 해시값에 접근하여 각 커밋 수정사항 뽑아오기
5. 삭제의 경우만 뽑아내어 복원
	- 복원의 경우 줄마다 나와있는 해시값을 통해 objects 폴더의 해시값 위치에 접근하여 파일을 읽고 다시 쓰는 형태
6. 모두 복원한 후에는 해당 해시값 까지 위에 쌓여있는 모든 해시값 제거

의 과정을 거쳐 restore을 구현해내었다.
![](https://i.imgur.com/zwGrhg6.png)
해당 화면은 테스트 화면인데, delete.txt라는 파일을 지우고 커밋한 다음에 다시 이전 커밋으로 restore시켜줌으로써 다시 delete값을 가져오는 것을 확인하였다.

## commit log에 제대로 해시값을 저장하지 못했던 문제 수정

```js
static async jsonFileDeflate(file) {
    const hash = cryptoJs.SHA256(file).toString();
    const blob = new Blob([JSON.stringify(file, null, 2)], {
      type: "application/json",
    });
    const converted = await blob.arrayBuffer();
    const deflatedFile = deflateSync(converted);
    return { hash, deflatedFile };
  }
...
async function blobCommit(dir) {
  const data = readChanged(dir);
  let commitData = [];
  for (const blob of data) {
    const { hash, path, fileName, status } = blob;
    if (status !== "삭제됨") {
      const file = fs.readFileSync(path).toString();
      const { hash, deflatedFile } = await FileManager.jsonFileDeflate(file);
      FileManager.dirExceptionHandler(dir, hash);
      FileManager.writeFile(dir, hash, deflatedFile);
      const fileSize = fs.statSync(path).size;
      commitData.push(`+ ${hash} ${fileSize} ${path} ${status}`);
    } else {
      commitData.push(`- ${hash} ${path} ${status}`);
    }
  }
  return commitData;
}
```
기존에는 각각의 blob파일에 대해서 저장하고 해시값을 저장하는 과정에서 똑같은 해시값이 반복해서 나오는 버그가 있었다.
여기서 자꾸 막히길래 hash 스코프를 따라가다보니 data에서 가져오는 hash와  FileManager의 jsonFileDeflate에서 가져오는 hash가 있었는데, data의 경우는 딱히 변동이 없음을 확인했지만 jsonFileDeflate를 거쳐 나오는 해시값의 경우 똑같이 나오게 되는 오류가 있었다.
하나하나 뜯어가면서 보니 이 문제는 해시객체의 참조에 관한 문제였다. crypto-js라이브러리를 통해 해시값을 생성할 때, 생성되는 SHA256 객체는 문자열로 변환하지 않는 이상 해시 객체 자체를 가리키기 때문에 모두가 같은 객체를 가리키는 문제가 발생했던 것이다.
이에 SHA256을 통해 만들어지는 객체에 toString을 통해 문자열로 변환해주었고, 이후에 로그를 다시 확인해보니 정상적으로 작동된 것을 확인했다.
# 학습 메모
git의 내부구조
https://bigexecution.tistory.com/171
https://tecoble.techcourse.co.kr/post/2021-07-08-dot-git/
https://80000coding.oopy.io/7267f19f-5359-4799-a740-5d0f316fb589
https://storycompiler.tistory.com/7

commander 라이브러리
https://github.com/Jeontaeyun/TypeScript/blob/master/node.js-or/cli/README.md

Blob 객체
https://velog.io/@minh0518/Blob%EA%B0%9D%EC%B2%B4%EB%9E%80
https://developer.mozilla.org/ko/docs/Web/API/Blob

SHA256
https://velog.io/@ham3798/SHA-256-%ED%95%B4%EC%8B%9C-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98%EC%97%90-%EB%8C%80%ED%95%98%EC%97%AC
https://losskatsu.github.io/blockchain/sha256/
https://devje.tistory.com/181

# [[Day13_학습정리]]
