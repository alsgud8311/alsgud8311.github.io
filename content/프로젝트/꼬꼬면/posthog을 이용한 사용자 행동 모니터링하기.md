---
title: datahog을 이용한 모니터링
created: 2025-07-12 01:56
updated: 2025-07-12 01:56
tags:
  - 개발
categories: 
aliases: 
description: ""
status: draft
---
# PostHog을 이용한 사용자 행동 모니터링

## 왜 도입했을까?
### 사용자 행동 모니터링
이번에 사용자를 실제로 대상으로 서비스할 것을 염두에 두면서 가장 신경썼던 점은 '사용자 행동'이다. 이제까지는 예측에 의존해서 `사용자가 ~할 것 같아`라고 했다면, 이제는 사용자 경험을 보다 긴밀하게 살펴보고 이를 기반으로 어떤 부분에서 개선해야 할지를 데이터로 찾아봐야 했다.

가장 먼저 도입했던 것은 `Sentry`였다. Sentry는 에러 추적에 용이한 로그 관리를 주로 해주었기 때문에 확실히 에러 추적에는 편했다. 또한 다른 사용자 행동 모니터링에 대한 기능 또한 제공하는데, 문제는

1. **비용 부담**: 상용 서비스 대비 높은 요금제
2. **제한적인 무료 플랜**: 무료플랜으로 제공할 수 있는 범위가 적음
3. **인프라 비용**: 셀프호스트 시 세션 리플레이 데이터 저장으로 인한 스토리지 비용 급증

정도가 있었다.

셀프호스트를 사용하면 라이선스 비용 부담을 조금은 줄일 수 있었지만, 애초에 트레이싱과 에러가 나타난 상황의 리플레이를 제공하는데 이러한 영상 데이터들을 모두 담아내려면 AWS의 무지막지한 정산서를 받을 게 뻔했기 때문에 이 또한 현실적인 문제가 되었다.

그렇기 때문에 에러 로깅은 Sentry로, 사용자 행동에 대한 모니터링은 다른 호스팅 서비스를 통해서 관리하려고 했던 것이 첫번째 이유였다.
### 실제 사용자의 경험이 들어간 데이터
프론트에서는 코어 웹 바이탈을 개발하는데 중요한 요소로 꼽는다. LCP(Largest Contentful Paint)나 FID(FIrst Input Delay), CLS(Cumulative Layout Shift) 등의 지표가 어느정도 점수를 얻어야지 구글의 검색 엔진 최적화에 들 수 있으며, 해당 지표는 애플리케이션의 성능과도 직결되기 때문이다.

나 또한 이러한 lighthouse 측정을 개발 중간중간 진행했었다. 하지만 이렇게 개발 하는 과정에서 매번 내가 직접 돌려야 한다는 점이 다소 번거롭게 느껴졌고, 빼먹는 일 또한 있었다. 그렇기 때문에 추가적으로 나는 Lighthouse CI를 도입하여 PR을 올리면 자동으로 해당 웹 바이탈을 측정할 수 있도록 하였다.

[[lighthouse CI로 웹 바이탈 지표 편리하게 모니터링하기]]

하지만 그럼에도 여전히 애매하게 느꼈던 부분은 `사용자마다 환경이 모두 다를텐데, 큰 쓸모가 있을까?`에 대한 고민이었다. 사용자는 각각 너무 다른 디바이스를 통해 접속하고 컴퓨터의 사양도 제대로 알 수 없다. 그렇기 때문에 Lighthouse CI가 어느정도의 참고할 수 있는 자료는 되지만, 실제 사용자가 해당 서비스에 접속하면서 가졌던 웹 바이탈을 알고 싶어했던게 이유였다.

고맙게도 이번에 찾았던 Posthog라는 모니터링 툴이 나의 이런 문제점을 해결해주었다.

![](https://i.imgur.com/fFpzTV9.png)

Sentry는 오류 모니터링에 가장 유용한 툴이었다면, Posthog는 프로덕트로서의 모니터링을 도와주는 툴이다. 프로덕트로서 Survey, A/B 테스팅, Session Replay 등의 기능들을 제공할 뿐만 아니라 각 유저가 접속하는 과정에서 어느 정도의 Web vital 수치가 나왔는지도 측정해서 알려준다.

![](https://i.imgur.com/0Lo8rwk.png)


특히 Session Replay 기능은 혁신적인데, 처음에 세션을 연결해놓고 사용자가 어떠한 이벤트를 발생시킴에 따라 이를 `Mutation Observer`를 이용하여 각 스냅샷을 캡쳐하고, 이를 동영상으로 만드는 `rrweb` 이라는 오픈소스 라이브러리를 사용하여 각 유저별로 어떤 행동을 했는지 모두 볼 수 있다. Sentry에서도 이러한 에러가 발생했던 경위를 파악하기 위해 세션 리플레이를 제공하는데, 이 또한 `rrweb` 을 사용하여 만들어진 기능이다. 
아무튼 이러한 기능에 대해서 추가적으로 더해진 기능으로 A/B 테스트와 같은 부분 또한 플래그를 따로 설정해두고 호스팅 페이지를 통해 비교군을 나누는 작업 등을 전부 할 수 있어서 유저 모니터링에 특화되어 있다.

아무튼 이번에는 이러한 사용자 행동에 대해서 모니터링하기 위해서 가장 기본적으로 커스텀 이벤트를 만들고, 관리해보려고 한다.
### 커스텀 이벤트 네이밍
커스텀 이벤트에 대한 모니터링은 네이밍에 대해서 어떤 식으로 써야 좋은지에 대해서 DOCS에 따로 적어놓았다.
![](https://i.imgur.com/YOdLVqd.png)
주로 `object verb` 의 네이밍으로 하는 것 같아 나 또한 이를 기준으로 크게 두 가지로 나누었다.

현재 나눴던 이벤트의 경우는 
- survey sent
```ts
type FormSubmitEvent =
  | "logout"
  | "startNewInterview"
  | "submitInterviewAnswer"
  | "changeNickname"
  | "createMemo"
  | "editMemo"
  | "deleteMemo";
```
	
- button clicked
```ts
type ButtonCaptureEvent =
  | "userLogout"
  | "MembersInterveiw"
  | "MemberInterviewLike"
  | "MemberDashboard";
```
로 나누었다.

각각을 이벤트로 따로 나누지 않고 큰 이벤트로 추상화하고 세부적인 이벤트를 properties에 놓은 이유는 모든 이벤트에 대해서 더 쉽게 통계를 조회할 수 있기 때문이다.
`Posthog`는 sql문을 통해서 db에 보관한 이벤트 로그를 조회할 수 있도록 제공하기 때문에 각 이벤트를 groupby해서 보기 훨씬 좋을 뿐만 아니라, 각 이벤트에 대해서도 세부적으로 조회할 수 있기 때문에 이벤트 자체를 크게 추상화하고 properties에 각 이벤트의 이름을 따로 추가해놨다.

![](https://i.imgur.com/CJwYlpq.png)
이런 식으로 전체 각 이벤트들에 대해서 쉽게 각 이벤트를 카운트 할 수도 있고

![](https://i.imgur.com/cUFudD3.png)
각 이벤트에 대해서도 자세하게 조회하는 것도 편리하게 할 수 있다.

![](https://i.imgur.com/FUDT0ON.png)
(주변사람들한테 피드백 달라하면 어떻게든 AI를 뚫으려는 노력도 볼 수 있다)

## 설정
posthog 모니터링 기본 설정은 매우 간단하다.
각 프레임워크/라이브러리마다 설정 방법을 따로 명시해놓았는데,

```ts
//instrumentation-client.ts
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: "2025-05-24",
  autocapture: false,
});
```

nextjs의 경우, instrumentation-client.js|ts 파일은 애플리케이션의 프론트엔드 코드가 실행되기 전에 모니터링 및 분석 코드를 추가할 수 있게 해준다. 이렇게 처음 initialize 하는 코드를 분리함으로써 코드의 유지보수가 쉽고 성능 추적, 에러 모니터링 또는 기타 클라이언트 사이드 관찰 도구를 설정하는 데 유용했다. 나같은 경우는 sentry와 함께 initailize하는 코드를 넣어주었다.

### 헬퍼 함수 구현
```ts
interface CaptureEventProperties<
  TEvent extends string,
  TProperties extends Record<string, string>,
> {
  name: TEvent;
  properties?: TProperties;
}

type ButtonCaptureEvent =
  | "userLogout"
  | "MembersInterveiw"
  | "MemberInterviewLike"
  | "MemberDashboard";
function captureButtonEvent({
  name,
  properties,
}: CaptureEventProperties<ButtonCaptureEvent, {}>): CaptureResult | undefined {
  return posthog.capture("button clicked", {
    name,
    ...properties,
  });
}

type FormSubmitEvent =
  | "logout"
  | "startNewInterview"
  | "submitInterviewAnswer"
  | "changeNickname"
  | "createMemo"
  | "editMemo"
  | "deleteMemo";
function captureFormSubmitEvent({
  name,
  properties,
}: CaptureEventProperties<FormSubmitEvent, {}>): CaptureResult | undefined {
  return posthog.capture("survey sent", {
    name,
    ...properties,
  });
}
```
posthog sdk에서는 일반적으로 커스텀 이벤트를 보내주는 capture 메서드를 제공하지만, 각각의 버튼, 폼에 각각 그떄마다 이벤트를 정의하고 property들을 설정하기에는 유지보수적인 측면에서 좋지 않다. 따라서 위와 같이 헬퍼함수를 따로 만들어주었고, 각 커스텀 이벤트마다 따로 함수를 구분했다.

이렇게 해서 각각의 버튼이나 폼 핸들러에 추가해줘도 되고, 나중에 리팩토링 계획으로는 각 커스텀마다 분리하거나 타입체크를 보다 엄격하게 해서 각 이벤트마다 꼭 필요한 property들을 정의하고 여러 곳에서 type safe하게 사용하는 법을 생각해 보려고 한다.

### 세션 리플레이

![](https://i.imgur.com/62PIK6P.png)
이런 식으로 각 세션 리플레이도 Initialize만 제대로 해 놓으면 알아서 세션 연결이 되고, 이에 따라 버튼 클릭이나 페이지 조회와 같은 부분들에 대해서 전부 리플레이가 가능하다. 추가적으로 web vital까지 측정해주니 가히 모니터링 한상차림이라고 볼 수 있겠다.

## 결론
posthog는 타 애널리틱스와 다르게 마케팅/비즈니스를 위한 여러 모니터링 도구들과 기능들이 너무 많아서 처음에 써보고 이런 꿀도구가 있다는 점에 놀라기도 했고 무료로 주는 양에서 그저 숭배할 수밖에 없었다.
![](https://i.imgur.com/9oC7sDl.png)

마치 노블리스 오블리주를 몸소 실천하는 posthog 형님들의 아량을 보면 감탄이 나올 수밖에 없다.
![](https://i.imgur.com/CcYMylP.png)
덥군에 많은 부분에서 db를 새로 파서 연결한다던가 web vital을 매일 측정한다던가 하는 귀찮은 과정을 많이 줄여줘서 생각보다 훨씬 편해지게 만들어준 툴이라고 생각한다.
다음 기능 추가때는 따로 feature flags를 두고 신규 기능을 추가할 때 이러한 기능들을 적극 더 사용해볼 생각이다. 