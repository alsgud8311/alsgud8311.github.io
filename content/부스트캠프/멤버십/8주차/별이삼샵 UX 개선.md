별이삼샵은 이번에 새로운 서비스를 연말이기도 하고 토이프로젝트 겸 만든 프로젝트이다.

[![Image](https://i.imgur.com/6tUnFXC.png)](https://star23sharp.site)
| 해당 사진을 누르면 프로젝트로 이동합니다.


![](https://i.imgur.com/X9E5ceI.gif)

이런 식으로 옛날 폴더폰 쓰던 시절의 감성을 살려 롤링페이퍼 서비스를 기획했다.
항상 연말마다 나오는 롤링페이퍼들 서비스를 보면서 나는 이전 롤링페이퍼들이 항상 공개적으로 되어있어 다른 사람이 볼 수 있다는 점을 그리 좋아하지 않았다.

~~왜냐면 나는 친구가 없어서 얼마 오지 않은걸 공개확인사살 당하기 때문~~
![](https://i.imgur.com/Z8gThEs.png)

그렇게 만들어진 프라이빗 롤링페이퍼는 내가 링크를 간편하게 만들고 공유하여 받은 링크를 통해 접속하고, 해당 링크에서 바로 메세지를 작성할 수 있게끔 해주어 최대한 유저가 불편하지 않도록 하였다.

그렇게 만들고  제일 먼저 홍보할 사람은 주변 사람밖에 없기 때문에 그나마 있는 동아리 단톡방에 홍보를 해봤다.
<img src="https://i.imgur.com/Po2TX5j.png" width=500/>
일단 메세지의 링크를 공유하면서 바로 아차! 했다.
일단 링크에 담긴 meta 태그의 썸네일이나 title, description 모두 이 링크가 무슨 링크를 의미하는지 의미하는 것을 아무것도 찾을 수 없었다.

<img src="https://i.imgur.com/PXPX33F.png" width=500/>
그렇기에 위에처럼 처음 링크에 들어갔을 때 다짜고짜 메세지 작성만 있으니까 당황스러운 유저의 마음을 생각하지 못했었다.

![](https://i.imgur.com/AqVrwrP.png)
![](https://i.imgur.com/xRBz8zZ.png)
이는 처음 맛만 보고 떠난 유저의 마음도 이랬으리라 생각한다.
그렇기 때문에 카카오톡 공유 시에 적당한 안내가 있으면 UX를 보다 개선할 수 있겠다고 생각했다.

### kakao SDK 활용하여 개선하기

카카오톡은 메시지 API를 통해 사용자가 카카오톡 친구에게 카카오톡 메시지를 보내는 기능을 제공한다.
물론 이 기능은 일단 카카오디벨로퍼스에 자신의 서비스를 등록한 뒤 사용할 수 있다.

이 메시지 API에도 두 가지 종류가 있는데, **카카오톡 공유 API**와 **카카오톡 메시지 API**가 있다.

| 설명                  | 카카오톡 공유 API                                                                                            | 카카오톡 메시지 API                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| 카카오톡 친구 목록 페이지      | 카카오톡 앱에서 카카오톡 친구 목록 이용                                                                                 | [친구 목록 가져오기 API](https://developers.kakao.com/docs/latest/ko/kakaotalk-social/common)를 사용해 자체 구현       |
| 메시지 전송이 가능한 친구의 범위  | 카카오톡의 모든 친구                                                                                            | [친구 목록 가져오기 API](https://developers.kakao.com/docs/latest/ko/kakaotalk-social/common)의 정보 제공 조건에 맞는 친구 |
| 카카오톡 앱으로 이동해 메시지 전송 | O                                                                                                      | X                                                                                                      |
| 메시지 전송 요청 실행        | 카카오톡                                                                                                   | 서비스 클라이언트 또는 서버                                                                                        |
| 사용 신청 및 검수          | X                                                                                                      | O                                                                                                      |
| REST API 지원         | X                                                                                                      | O                                                                                                      |
| 메시지 전송 성공 여부 확인     | [카카오톡 공유 전송 성공 알림](https://developers.kakao.com/docs/latest/ko/message/callback#success) 기능을 사용해 자체 구현 | API 응답으로 확인                                                                                            |
보통 카카오톡 메시지 API의 경우는 보니 친구목록 가져오기 API를 사용해서 구현해야 하는 만큼, 카카오톡 로그인을 통해서 카카오 계정 정보를 수집하는 계정만 가능하다.

우리의 서비스는 최대한 로그인과 같은 기능을 줄이려 노력하고자 소셜 로그인을 사용하지 않았고, 웬투미트와 같이 가볍게 이름과 커스텀 비밀번호만 입력하면 사용할 수 있는 방법으로 구현하였다. 그렇기에 카카오톡 공유 API가 보다 적합한 API 사용이라고 결정하였다.

![](https://i.imgur.com/iihN73O.png)

카카오톡 공유 API는 서비스 클라이언트에서 카카오톡 앱을 실행시켜 카카오톡 메시지를 보낼 수 있도록 한다. 사용자의 클라이언트 측에서 **카카오가 제공하는 카카오톡 친구 또는 대화 목록 페이지**를 띄워 사용자가 메시지를 보낼 수 있도록 하기 때문에 서비스가 카카오톡 친구 정보를 출력하는 페이지를 직접 만들 필요가 없고, 모든 카카오톡 친구가 목록에 포함된다.
대신, 카카오톡 친구 정보를 데이터로 제공하지 않기 때문에 앞서 말했듯 일부 친구를 걸러서 보여준다던지 한다는 기능은 구현할 수 없다. 

### 초기 세팅
카카오톡 sdk를 맨 처음 불러와야 해당 sdk를 window객체에서 가져와 사용할 수 있다. 따라서 앱의 엔트리 포인트인`index.html`에 스크립트로 sdk를 가져올 수 있도록 헤드에 스크립트를 추가했다.
```html
<script src="https://developers.kakao.com/sdk/js/kakao.js"></script>
```
추가적으로 sdk를 Window객체에 할당했다면 따로 타입을 정의해주어야 한다. 
```d.ts
interface Window {
  Kakao: any;
}

```
### 왜 .d.ts를 수정할까?
`.d.ts` 파일은 타입을 정의(declare)하기 위해서 존재하는 파일이다. 
기본적인 타입스크립트 환경에서 린팅을 기본 세팅으로 두게 된다면 script에 카카오 공유하기 관련 API를 불러온 상태이지만Window 객체는 Kakao라는 API가 불려졌는지 모르기 때문에 찾을 수 없는 프로퍼티로 나오게 된다. 그렇기 때문에 만약 기존 객체에서 확장을 하려면 따로 타입 정의를 통해 기존의 Window 객체에 카카오 API를 추가해주어야 한다.
```d.ts
// /types/kakao.d.ts
interface Window {
  Kakao: any;
}

```

추가적으로 `.d.ts` 파일에 대해 이야기 해보자면 vite-env.d.ts를 만들어 readonly로 내가 가져오는 환경 변수들에 대한 타입을 미리 정의하게 되면 타입스크립트 환경에서 인텔리센스를 통해 타입을 추론할 수 있게 되고, 이를 통해 `import.meta.env`에서의 인텔리센스를 활성화시켜 개발자의 실수를 방지할 뿐만 아니라 사용성 또한 좋아진다.
```ts
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // 다른 환경 변수들에 대한 타입 정의...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 카카오 공유하기 api 부르기
어느정도 api를 사용하기 위한 준비가 되었다면 이제는 해당 API를 불러 사용하기만 하면 된다.
카카오는 공유하기를 할 때, 미리 주어지는 기본 템플릿과 사용자 정의 템플릿을 사용할 수 있다.

나같은 경우는 미리 사진같은 것들은 따로 리소스를 차지해야 하다 보니, 굳이 이렇게 기본 템플릿에 사진을 코드로 넣어주기 보다는 미리 카카오톡에서 필요한 리소스를 업로드하여 커스텀 템플릿으로 만든 후에 필요한 string값만 전달해줄 수 있도록 하였다.

![](https://i.imgur.com/Vo501nj.png)

이렇게 기본 템플릿을 커스텀 해주고, 어차피 공유할 때 가는 사진은 동적으로 결정되지 않다보니, 카카오디벨로퍼스에서 설정해주었다.

```tsx
type ShareMessageSendProps = {
  receiverId: string;
  receiverName: string;
};
export default function shareMessageSend({
  receiverName,
  receiverId,
}: ShareMessageSendProps) {
  window.Kakao.Share.sendCustom({
    templateId: +import.meta.env.VITE_APP_KAKOTALK_MESSAGESEND_TEMPLATE_ID,
    templateArgs: {
      RECEIVER_NAME: receiverName,
      RECEIVER_ID: receiverId,
    },
  });
}

```
템플릿을 만든 뒤에는 메세지를 보내는 함수를 만들었다.
`templateId`는 number 값으로 가야 하기 때문에 앞에 +를 붙여 타입을 변환시켜 주었다.

하지만 이 API도 만약 사용자가 카카오톡 앱이 없을 경우에는 앱의 공유하기 기능을 사용할 수 없으므로 에러를 내뱉게 된다. 대부분은 카카오톡이 설치되어 있겠지만 에러를 제대로 관리하지 않을 경우 서비스가 사용 중 그대로 멈춰버릴 수도 있으므로 이러한 부분 또한 세심하게 에러를 처리해줄 필요가 있다고 생각했다.

```tsx
  const share = async () => {
    try {
      const { title: receiverName } = await getMessageTitle(receiverId);
      shareMessageSend({ receiverId, receiverName });
    } catch (error) {
      console.error(error);
      pushError(
        "예상치 못한 에러가 발생했어요. \n 잠시 후 다시 시도해 주세요.",
      );
    }
  };
```
그래서 공유하기 버튼을 눌렀을 때, 해당 작성자의 이름을 가져오는 로직과 함께 카카오톡 공유하기 api를 호출하는 부분을 try~catch로 잡아주고, 만약 에러가 생겼을 경우, 내가 만든 커스텀 에러 모달을 띄워줄 수 있도록 했다.

![](https://i.imgur.com/d3xzt7h.png)

### 카카오 API 호출 코드 리팩토링
약간 만들고 나서 생각해보니 위의 로직을 가진 함수는 생각보다 템플릿 ID를 미리 인자로 꽂아넣고 사용하다보니 생각보다 사용성이 떨어진다는 생각을 하게 되었다.

위와 같이 코드를 작성한다면 나중에도 카카오의 sendCustom 프로토타입 메서드를 사용할 일이 생길 때 저 코드를 전부 작성해줘야 하기 때문에 확장하기가 다소 힘든 코드 구조를 가지고 있었다. 여러 템플릿이 생긴 경우 위 코드랑 매우 유사하게 생긴 함수를 여러개 만들어야 한다는 뜻이기도 하다. 따라서 이를 조금 고쳐보기로 했다.

```ts
export default function shareMessageSend(
  receiverName: string,
  receiverId: string,
) {
  kakaoShareCustom(+import.meta.env.VITE_APP_KAKOTALK_MESSAGESEND_TEMPLATE_ID, {
    RECEIVER_NAME: receiverName,
    RECEIVER_ID: receiverId,
  });
}

type CustomTemplateArgs = {
  [key: string]: string;
};

function kakaoShareCustom(
  templateId: number,
  templateArgs: CustomTemplateArgs,
) {
  window.Kakao.Share.sendCustom({
    templateId,
    templateArgs,
  });
}

```
kakao api를 부르는 부분과 각각의 템플릿에 맞추어 api를 실행하는 함수를 따로 만듦으로써 내가 인자를 확인하고 각각의 커스텀 템플릿에 따라 타입 또한 검사할 수 있는 로직으로 변경하였다.

하지만 요렇게 해도 결국 뭔가 코드가 더 길어졌기도 하고 그렇게 드라마틱하게 변경된 것은 없는데 빙빙 둘러 간다는 느낌만 들었다.
```ts
export type ShareMessageSendLink = {
  RECEIVER_NAME: string;
  RECEIVER_ID: string;
};

export function kakaoShareCustom<T>(templateId: number, templateArgs: T) {
  window.Kakao.Share.sendCustom({
    templateId,
    templateArgs,
  });
}

```
그래서 의존성을 아예 주입하는 방식으로 가면 어떨까? 생각해서 생각한 방향대로 리팩토링을 다시 해보았다. 

각 템플릿에 맞춰 필요한 인자들의 경우만 타입으로 선언해주어 제네릭을 통해 넘겨주면 인텔리센스를 사용할 뿐만 아니라 타입 안정성까지 보장될 수 있도록 해주었다.
추가적으로 따로 템플릿별로 호출하는 함수를 둘 중간 과정이 필요없다고 생각하여 삭제했더니 코드의 수도 거의 반정도 감소했다.

```ts
const share = async () => {
    try {
      const { title: receiverName } = await getMessageTitle(receiverId);
      kakaoShareCustom<ShareMessageSendLink>(
        +import.meta.env.VITE_APP_KAKOTALK_MESSAGESEND_TEMPLATE_ID,
        { RECEIVER_ID: receiverId, RECEIVER_NAME: receiverName },
      );
    } catch (error) {
      console.error(error);
      pushError(
        "예상치 못한 에러가 발생했어요. \n 잠시 후 다시 시도해 주세요.",
      );
    }
  };
```
해당 코드를 부를 때는 제네릭으로 필요한 템플릿에 대한 인자 타입만 import 해와서 사용하고, 인자로 templateid와 해당 템플릿에 맞는 타입만 넣어주면 된다.

하지만 여기서도 만족이 안 됐다,, 왜냐면 코드에 함수의 인자로 저렇게 긴 환경변수를 가져와 넣는 것이 그리 가독성이 좋아보이진 않는다고 생각했기 때문이다.

```ts
export type ShareMessageSendLink = {
  RECEIVER_NAME: string;
  RECEIVER_ID: string;
};

export enum CustomShare {
  MESSAGESEND = +import.meta.env.VITE_APP_KAKOTALK_MESSAGESEND_TEMPLATE_ID,
}

export type CustomArgs = Record<keyof typeof CustomShare, any> & {
  MESSAGESEND: ShareMessageSendLink;
};

export function kakaoShareCustom<K extends keyof typeof CustomShare>(
  templateId: K,
  templateArgs: CustomArgs[K],
) {
  window.Kakao.Share.sendCustom({
    templateId: CustomShare[templateId],
    templateArgs,
  });
}

```
조금 더 타입을 활용하여 고쳐보았다.
`CustomShare`라는 enum을 두고, 이 enum에 따라서 필요한 인자 값을 타입을 받는 `templateId`에 따른 타입을 선언해놓아 `templateArgs`가 커스텀 템플릿 별로 타입이 강제될 수 있도록 하였다.
```ts
kakaoShareCustom("MESSAGESEND", {
        RECEIVER_ID: receiverId,
        RECEIVER_NAME: receiverName,
      });
```
그렇게 해당 함수를 고쳤더니 이런 식으로 훨씬 코드가 예뻐졌으며, 인텔리센스를 통한 자동완성또한 가능해 개발자의 실수도 보다 줄일 수 있는 좋은 코드가 되었다고 생각한다!

### 카카오 공유하기 리팩토링 후
사실 카카오 공유하기는 그렇게 빡세진 않았다. 차근차근 문서를 보면서 하면 충분히 쉽게 할 수 있는 영역이라고 생각한다.

하지만 리팩토링을 시작하면서 어떻게 해야 확장성 있고, 간결하며, 사용성 있는 코드, 즉 '좋은 코드'가 될 수 있을까?에 대해서 고민하면서 쓰다보니 생각보다 내가 생각 없이 쓰던 코드도 계속해서 발전할 여지가 있었음을 알게 됐다. 

타입스크립트 또한 기존의 type정도의 사용만 했었다고 생각한다. 이번에 `extends`를 통한 `enum`의 강제와  `record`를 사용하여 키에 매핑되는 타입의 강제 등을 새롭게 알고 적용하면서 타입스크립트를 통해 보다 간결하고 가독성 좋은 코드를 작성할 수 있게 되어 타입스크립트의 중요성 또한 몸소 깨닫게 되는 경험이었다고 생각한다.
