---
title: forA_OCR 알고쓰자!
created: 2025-02-11 00:35
updated: 2025-02-11 00:35
tags:
  - ncp
  - ocr
  - 개발
  - React
  - ReactNative
categories: 
aliases: 
description: ""
status: draft
---

기존에 다른 사람이 하던 프로젝트를 맡게 되었지만 많은 기능들이 제대로 구현되지 않은 채로 방치되어 있었다. 그 중 이번에 해볼 주제는 `OCR`이다. 

## OCR이란?
OCR은 Optical Character Recognition의 약자로, 광학 문자 인식의 약자이다.
OCR은 이미지에서 문자(텍스트)를 추출하는 기술로, 스캔된 문서, 사진, 손글씨 등의 이미지를 분석하여 기계가 읽을 수 있는 문자 데이터로 변환하는 기술이다.

##  OCR의 원리
OCR은 크게 **전처리 → 문자 인식 → 후처리** 과정으로 나뉜다.
### 전처리 (Preprocessing)

이미지를 OCR로 분석하기 전에 최적화하는 과정이다.
해당 과정에서는

- **이진화(Binary Thresholding)**: 컬러 또는 그레이스케일 이미지를 흑백으로 변환하여 명확한 윤곽을 생성
- **노이즈 제거(Denoising)**: 배경 제거, 흐린 이미지 개선, 문자의 명확도 증가
- **기울기 보정(Deskewing)**: 문서가 기울어진 경우 올바르게 정렬
- **영역 분할(Segmentation)**: 문서에서 텍스트가 포함된 영역을 찾아 개별 문자 또는 단어로 분할

등을 수행한다.

### 문자 인식 (Character Recognition)

전처리가 끝난 이미지에서 문자를 인식하는 단계로, **패턴 매칭 방식**과 **기계 학습 방식**이 있다.

- **패턴 매칭 (Template Matching)**
    - 미리 저장된 글자 패턴과 비교하여 문자 식별
    - 폰트가 일정하고 규칙적인 문서에서 효과적
    - 다양한 폰트나 손글씨 인식에는 약함
- **기계 학습 (Machine Learning & Deep Learning)**
    - 이미지 데이터를 학습한 모델이 문자를 판별
    - 딥러닝 기반의 CNN(Convolutional Neural Network)과 RNN(Recurrent Neural Network)을 활용하여 문맥까지 분석 가능
    - 다양한 폰트 및 손글씨 인식에 강함

### 후처리 (Postprocessing)

인식된 텍스트를 더 정제하고 정확도를 높이는 과정이다.

- **문맥 분석(Context Analysis)**: 문장 구조를 고려하여 오류 수정
- **사전 기반 보정(Dictionary Correction)**: 문법적으로 이상한 단어를 사전에 맞춰 수정
- **글자 연결 및 띄어쓰기 보정**

등의 과정을 통해 텍스트의 품질을 보다 높이는 과정을 거치며 결과물이 나오게 된다.

## Clova OCR
OCR 모델에도 여러 가지가 있지만, 이번에 사용해볼 것은 NCP(Naver Cloud Platform)의 OCR 모델이다.

```
CLOVA OCR은 전세계적으로 가장 권위 있는 글로벌 챌린지인 ICDAR 2019 4개 분야에서 1위, CVPR 및 ICCV 국제 학회 논문으로 선정되는 등 독보적인 기술력을 자랑합니다. 특히 읽는 순서와 방향을 추정해 이미지 속 문자를 인식하며, 곡선으로 배열되거나 기울어진 문자, 필기체까지 인식할 수 있어 더욱 정확하게 데이터를 추출할 수 있습니다.
```
라고 서비스의 정확한 데이터 추출 능력을 강조한다.

사실 쓰게 된 이유는 내가 NCP 크레딧이 많이 남아서이기도 하지만.. 추가적으로 Document OCR이라는 기능을 지원하는데, 해당 기능은 대량의 학습 데이터를 기반으로 CLOVA AI 기술을 적용하여 특화 문서의 주요 정보를 추출해내는 능력을 가지고 있다.
Document OCR에는 영수증, 신용카드, 사업자등록증 등등 표준화된 문서 양식에 대해서 미리 document를 지정하고, 해당 document에 특화된 모델을 사용하여 문서를 처리하기 때문에 보다 신뢰성이 높을 것 같아서 선택한 이유도 있다.

![](https://i.imgur.com/5jhUyz9.png)
물론 돈은 내야한다
기본 요금이 있다는게 살짝 킹받지만, 그만큼의 값어치를 한다면야 크레딧 사용해도 상관은 없을 것 같다.

> Clova OCR의 Document OCR을 사용하려면 민감 정보가 많은 document들을 처리하다 보니 사전 승인이 필요하다. 미리 신청해놓는 것을 추천한다.


![](https://i.imgur.com/iIdehha.png)

신청을 한 뒤 API Gateway도 하나 열어 클라이언트 측에서 사용할 수 있도록 해주었다.

![](https://i.imgur.com/f3qpmwp.png)

다른 클라우드 서비스도 마찬가지겠지만, 클라우드 서비스의 API를 사용할 때는 먼저 요청 바디와 응답 코드 등에 대해서 미리 숙지하고 있는 것이 좋다.
타입을 제공하지 않기 때문에 보면서 휴먼 에러가 나지 않도록 해야한다.
또한 먼저 postman 등으로 API를 테스트한 후에 제대로 작동하는지 확인하고 사용할 것을 추천한다. 클라이언트에서 에러 체크하는 것보다 postman에서 보는게 훨 보기 편하다.

![](https://i.imgur.com/AiY75kl.png)

근데 이상한게 `requestId`에 UUID 넣으라 해서 postman에서 지원하는 `randomUUID`를 넣었는데 0011 코드로 된 에러가 떴다
![](https://i.imgur.com/I6397G1.png)
계속 사진 오류인가 하고 찾아봤지만 결국 `requestId`를 위와 같이 UUID가 아닌 임의의 값으로 해주니 되었다(?)
~~UUID라고 하지를 말던가..~~
그러니 최대한 API 요청 예시를 보고 따라할 수 있는 부분은 따라하는 것을 추천한다.

## API 설계하기 - 에러 처리를 곁들인
Postman으로 테스트까지 되었다면 응답 객체가 어떻게 되어있는지 clova api 문서와 비교하면서 확인까지 되었을 것이다.
그렇다면 이제 이 api를 어떻게 호출하고, 어떻게 영수증 인증을 야무지게 할 수 있을까를 생각해봐야 한다.

원래대로 api 호출이라 함은

```ts
function receiptValidation() {
	const {data} = axios.post(API_URL, BODY);
	return data
}
```
이런 식으로  요청을 보내거나
```ts
function receiptValidation() {
	try{
		const {data} = axios.post(API_URL, BODY);
		return data
	}catch(error){
		throw error;
	}
}
```
이런 식으로 api 호출 함수에도 `try-catch`문을 사용할 것이다.

하지만 http 요청을 하는 함수에서 `try-catch`문을 걸고 다시 던지는 코드는 그렇게 좋은 코드가 아니라고 생각한다.
왜냐면 대부분 해당 함수를 `import`한 뒤에 해당 함수를 실행시키는 부분에서도 `try-catch`를 통해 에러 전파를 잡아줘야 할텐데 그렇게 되면 http 요청부에서 실행된 함수의 `catch`문은 그저 받아서 다시 던지는 역할밖에 되지 않는다.
공던지기 놀이를 두명이서 하고 있다가 한명이 사이에 끼어 들어가서 공을 그저 받았다가 다시 주는..느낌이랄까..

물론 저기에서 그저 던지는게 아니라 각각 에러 로깅을 해서 callstack을 확인하기 위해서라는 용도로도 쓰이는 것 같지만 나는 굳이 그렇게 해야하나 싶었다. 

![](https://i.imgur.com/1sn5J6f.png)

추가적으로 여기에서는 http 요청을 날렸을 때, `Bad Request`라던가 400번대 에러에 해당하는 것들은 에러로 돌아오지만 `clova ocr`이 사진을 인식하고 응답을 보내는 과정에서 사진이 제대로 인식되지 않은 에러와 같은 부분은 정상적인 응답의 이미지 객체의 `inferResult`로 오게 된다.

![](https://i.imgur.com/qOS7YzB.png)

따라서 이렇게 제대로 인식이 된 경우와 되지 않은 경우를 나누어 각각 에러처리를 해줘야 했다.

### 커스텀 에러로 에러 핸들링하기
내가 선택한 에러 핸들링은 axiosError와 커스텀 에러를 혼합한 방식이다.
gateway api로 보낸 요청에서 400번대 에러가 오게 되면, 400번대 에러가 온다. 이는 자연스럽게 `axiosError`로 catch에서 잡히게 된다.

하지만 위에서 말한 것처럼 응답은 정상적으로 오지만 이미지 인식에 실패한 경우라면? 
이 경우에 그냥 `Error`로 보내게 된다면 이 에러가 이미지 인식에 실패해서 나는 에러인지, 코드단에서 뭐가 잘못돼서 나오는 에러인지 제대로 구분하기 쉽지 않다. 그렇기 때문에 에러를 보다 명확히 하기 위해서 나는 커스텀 에러를 추가하는 방식을 선택했다.

```js
class Error {
  constructor(message) {
    this.message = message;
    this.name = "Error"; // (name은 내장 에러 클래스마다 다릅니다.)
    this.stack = <call stack>;  // stack은 표준은 아니지만, 대다수 환경이 지원합니다.
  }
}
```
기존 에러는 이런 식으로 구성되어 있다.

나는 해당 에러를 상속받아 새로운 커스텀 에러를 만들면 된다. 물론 에러를 굳이 상속받지 않아도 던지기만 하면 catch에서 잡히긴 하지만, 해당하는 부분이 에러라는 것을 명확히 할 수 있으며 가지고 있는 Error의 stack과 같은 속성들도 모두 에러를 추적하는데 필요한 요소이기 때문에 상속해주었다.
```js
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}
```

그럼 이제 이걸 가지고 어떻게 사용할 수 있을까?
먼저 ocr 함수의 검증부를 보자.

```js
const REQUEST_ID = 'hospitalReceiptValidation';
const MIN_HOSPITAL_PRICE = 1000;
export const receiptValidationCheck = async (
    base64EncodedImage: string,
    hospitalName: string,
) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'X-OCR-SECRET': NAVER_CLOUD_PLATFORM_OCR_SECRET,
        },
    };

    const { data } = await axios.post(
        NAVER_CLOUD_PLATFORM_OCR_URL,
        {
            version: 'V2',
            requestId: REQUEST_ID,
            timestamp: Date.now(),
            images: [
                {
                    format: 'jpg',
                    name: 'ocrImage',
                    data: base64EncodedImage,
                },
            ],
            enableTableDetection: false,
        },
        config,
    );

    if (
        data.images[0].inferResult === 'FAILURE' ||
        data.images[0].inferResult === 'ERROR'
    )
        throw new ValidationError(
            '이미지 확인이 제대로 되지 않았습니다. 다시 찍어주세요.',
        );

    if (
        data.images[0].receipt.result.storeInfo.name === hospitalName &&
        +data.images[0].receipt.result.totalPrice.price.formatted >= MIN_HOSPITAL_PRICE
    )
        return +data.images[0].receipt.result.totalPrice.price.formatted;

    throw new ValidationError('영수증 검증에 실패했습니다. 다시 찍어주세요.');
};
```
여기서 base64Encoded 이미지에 대한 유효성 검사는 해당 함수를 Promise Chaining을 통해 넘겨주는 과정에서 진행되며, hospitalName에 대한 유효값 또한 미리 검증하기 때문에 따로 검증을 해당 함수에서는 시켜주지 않았다.

header에 필요한 값을 넣어주고 post에 필요한 값들을 넣어주었다.
그리고 axios를 통해 `post` 요청을 보내게 되면 `data`가 올 것이라 가정한다. data가 오지 않아 `data is undefined`와 같은 오류가 뜨게 된다면 해당 오류는 비정상적인 오류로 간주했다. `gateway api`쪽에서 보내는 오류는 `axiosError`로 던져질 것이고 그게 아니라면 객체가 무조건 오게 되어있는데 만약에 오지 않는 오류는 비정상적인 오류이기 때문이다. 따라서 이런 오류는 그냥 원인을 알 수 없는 오류로 보고 catch단에서 알 수 없는 오류라고 내보내게끔 했다.

내가 ValidationError를 건 경우는 두 가지 경우이다.
- image의 InferResult 로 오는 값이 `ERROR`이거나 `FAILURE`일 때
	- 인식이 실패했을 때 오는 오류를 잡아서 던진다
	- 이 경우에는 인식이 제대로 되지 않았다는 것이 명확하기 때문에 다시금 사진을 찍도록 유도하면 된다.
- 병원 이름과 가격에 대한 유효성 검사가 끝나고도 아직 return되지 않았을 경우
	- 해당 경우는 뭐 어떻게 되든 인식 후에 제대로 유효성 검사가 되지 않은 경우라고 판단했다. 
		- 병원에서 1000원 이하 나왔을 때
		- 병원 이름이 일치하지 않을 때
	- 의 경우가 아래의 throw문으로 갈 것이다. 여기까지 오고도 아래로 가게 되면 검증이 제대로 되지 않았다는 의미이기 때문에 마지막에 `ValidationError`를 `throw`시켜주었다.

해당 오류들은 내가 인지했던 예외상황이기 때문에 메세지를 직접 넣어줌으로써 해당 에러의 메세지를 그대로 모달로 띄워 보내도 되도록 하였다.
하지만 이외의 경우는 내가 예상하지 못했던 예외 상황이기 때문에 이런 부분의 오류 메세지를 그대로 모달에 띄워주게 된다면 사용자는 이게 무슨 말이지? 싶을 것이다.
그러므로 다른 에러에 대해서는 통일된 `예상치 못한 오류` 안내 모달을 띄워주면 된다.
```ts
try {
	...
} catch (error) {
	if (error instanceof ValidationError) {
		pushError(error.message);
	} else if (axios.isAxiosError(error)){
		pushError(
			'서버와의 오류가 발생했습니다. 다시 시도해 주세요.',
		);
	} else{
		pushError(
			'예상치 못한 오류가 발생했습니다. 지속된다면 고객센터에 문의해주세요.',
		);
	}
}
```
이런 식으로 에러 처리를 하게 되면 보다 세부적으로 에러를 관리할 수 있게 되고, 이를 통해 보다 나은 사용자 경험을 제공할 수 있다!

### 회고
~~사실 이건 리팩토링이 아니라 처음부터 다시 짠 코드가 좀 더 맞는 표현같기도..~~
OCR을 도입하고, 검증 과정을 다시 리팩토링 하면서 코드를 봤을 때 옛날에는 아무생각없이 그저 보기만 했었는데 이제는 그래도 코드의 뭐가 부족할까를 많이 생각하면서 보는 것 같다.

특히 실제로 운영될 서비스인 만큼, 예외 처리는 예전처럼 무지성으로 catch문에 콘솔만 찍는 행위를 하지 않게 되었다. 사용자에게 또한 예외에 대해 안내를 할 수 있어야 좋은 사용자경험을 제공할 수 있으며 다른 사람들 또한 해당 코드를 유지보수 할 수도 있다고 생각하다보니 여러가지 방식을 생각하게 되고, 이렇게 고민하는 과정을 통해 보다 코드의 품질이 향상된다고 생각한다. 

항상 UX와 DX를 모두 고려하면서 코드를 짜도록 습관화하자!