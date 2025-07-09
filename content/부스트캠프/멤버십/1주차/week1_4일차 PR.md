## 주요 작업
- [x] Sorting card button ✅ 2024-08-22
- 생성 순 정렬
- 최신 순 정렬
- [x] drag & drop box ✅ 2024-08-22
- 드래그 앤 드롭 시 색상 변경(잔상)
- [x] 카드 컴포넌트 상태 관리 ✅ 2024-08-22
- [x] 히스토리 아이템 컴포넌트 ✅ 2024-08-22
- [x] 카드 수정 ✅ 2024-08-22


## 학습 키워드
- 이벤트 위임
- pug mixin
- templating
- addEventListener
- DOM API

1주차 학습정리
https://luxurious-share-af6.notion.site/1-baed698a7b3c40bbbd6b94fb1097dc42?pvs=4
## 고민 및 해결 과정
### 삭제 컴포넌트화
삭제와 같은 경우, 해당 서비스에서는 할일 카드에 대한 삭제와 전체적인 히스토리에 대한 삭제가 있으며 이를 위한 확인 모달이 존재한다.
확인 모달같은 경우 버튼이나 요소들은 대부분 동일하지만 텍스트가 조금 달랐다. 하지만 이거때문에 굳이 각각 다른 pug 파일에 일일이 작업하는 것은 다소 하드코딩 같다고 생각하여 이를 어떻게 하면 컴포넌트화를 시킬 수 있을까 생각했다.

#### SOL :  삭제 모달 mixin -> 성공
```pug
mixin deleteConfirm(target) 
    style
        | @import "/shared/deleteConfirm/css/deleteConfirm.css"
    .modalBackground
            .deleteConfirmContainer
                if target==="user"
                    p 모든 사용자 기록을 삭제할까요?
                else if target==="todo"
                    p 선택한 카드를 삭제할까요?
                .deleteConfirmContainer
                    button.cancelButton 취소
                    button.conFirmButton 삭제
```
삭제 모달을 컴포넌트화시켜 백그라운드와 가운데 들어가는 확인 창을 재사용할 수 있는 형태로 만들었다.
여기서 html 중간에 js문법을 사용할 수 있다는 장점을 활용했는데, if else문을 통해 target이라는 attribute에 따라서 각각 다른 텍스트만 나올 수 있도록 설계했다.

또한 상위 컴포넌트에서 이벤트 등록을 통해 해당 모달을 제어하며, 원할하게 작동할 수 있게 보완하였다.


### 데이터 조작 action
SSR로 클라이언트를 만들어 가면서 가장 고민이 됐던 부분이라고 생각한다. 카드나 히스토리 등 정보를 조작하는 데이터 fetching api들이 필요한 부분이 많은데, 이를 반영하고 새로고침하느냐, 아니면 원할한 사용자 경험을 위해서 임시적으로 띄우느냐의 차이라고 생각한다.

#### SOL 1 : 서버에서 templating해서 받은 뒤 렌더링 -> 실패
중요한 점은 수정을 하고 저장을 하는 것과 같은 기능들은 괜찮지만, 새롭게 카드 등록을 하는 경우는 기존 SSR 방식에서 처음에 페이지를 로딩하면서 필요한 데이터를 모두 가져와 해당 페이지에 필요한 히스토리와 등록한 할일 데이터를 넣어 렌더링을 시켜주기 때문에 이를 `임시적으로 보이게 하고 나중에 새로고침할 때부터 반영이 되느냐` 혹은 `새롭게 data post를 한 뒤에 다시금 전체적인 페이지 refresh`의 하느냐의 차이가 난다고 생각했다.
이를 맨 처음에는 반대로 생각해서 그냥 임시로 보여주되, 서버에서 `templating`을 하고 보내면  되지 않을까?라고 생각해서 맨 처음에는 서버의 templating 방법을 생각했다.
![](https://i.imgur.com/cB1qe1C.png)
pug에는 pug 파일을 가져와 해당 파일을 렌더링 시킬 수 있는 문자열을 반환하는 함수를 리턴한다. 이러한 Pug의 API를 사용하면 내가 일일이 귀찮게 템플릿을 문자열로 한땀한땀 만들지 않고 함수만 실행시키면 알아서 렌더링 가능한 문자열로 나오니 이를 활용하면 좋겠다 생각했었다..

```js
// 'client' 폴더를 정적 파일로 제공
app.use(express.static(path.join(__dirname, "client")));

// Pug 템플릿 파일이 위치할 디렉토리 설정
app.set("views", path.join(__dirname, "client"));
// 템플릿 엔진을 Pug로 설정
app.set("view engine", "pug");
app.locals.basedir = path.join(__dirname, "client");

// '/' 경로로 들어오는 요청을 처리
app.get("/", (req, res, next) => {
  console.log("refresh");
  const filePath = path.join(__dirname, "mockups");
  const todoData = JSON.parse(readFileSync(`${filePath}/todo.json`, "utf-8"));
  const historyData = JSON.parse(
    readFileSync(`${filePath}/history.json`, "utf-8")
  );
  // home.pug 템플릿을 렌더링하여 클라이언트에 전송
  res.render("app", { todoData: todoData, historyData: historyData.history });
});
```
하지만 내 서버의 세팅 자체가 문제였다. 나는 SSR 방식으로 했기 때문에 전체 페이지 자체를 렌더링해서 넘겨주는 방식을 택했다. 해당 방식만을 생각하면서 폴더구조를 짰는데, 나중에 이를 컴파일한 것을 templating해서 보내기 위해서는 Res.render 메서드를 사용해야 하는데, 해당 메서드에서는 위에서 설정한 디렉토리를 기준으로 더 깊게 디렉토리 구조를 인자로 줄 수 없었다. 처음에는 이 부분이 왜 이러는지 잘 몰랐고, 이거때문에 시간이 많이 걸린 것 같다. 

#### SOL2: 사전 컴파일을 통한 문자열 보내기 -> 실패중

```js
  const compiled = pug.compileFile(
    path.join(__dirname, "client", "shared", "card", "component", "card.pug"),
    {
      basedir: path.join(__dirname, "client"),
    }
  );
  console.log(
    "뭐여",
    compiled({
      title: "임시",
      detail: "임시디테일",
      author: "민형",
      date: "2023-10-24 11:00",
      id: "temp-1",
    })
  );
```
이에 compileFile을 통해 pug 파일을 컴파일 해서 문자열만 클라이언트로 받아 출력하는 방식을 생각해보았는데, 기존의 카드 컴포넌트가 여러 개의 attiribute를 받아서인지 `You should not have pug tags with multiple attributes.` 에러가 떴다. 시간이 남을 때 이 구조를 보다 학습해서 알맞을 템플릿 형태로 제작한 뒤 적용할 예정이다.