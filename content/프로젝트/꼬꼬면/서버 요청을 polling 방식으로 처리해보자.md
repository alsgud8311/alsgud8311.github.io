---
title: 서버 요청을 polling 방식으로 처리해보자
created: 2025-08-09 22:34
updated: 2025-08-09 22:34
tags: []
categories: []
aliases: []
description: ""
status: draft
---
꼬꼬면에서 인터뷰 요청에 대해서 처리하는 POST API가 약 20초 이상이 걸릴 정도로 레이턴시가 심했다.
해당 API의 문제는 애초에 AWS bedrock을 사용하고 있는데, 해당 서비스에서 응답을 받아오는 속도 자체가 너무 느렸다. 지금은 프롬프팅과 모델을 바꿔가면서 많이 개선하기는 했지만, 사실상 아직까지도 4~5초가 나오는 상황이다.

이러한 상황에서 하나의 요청에 대해서 POST 요청을 받아 처리를 해야 하는데, 이러한 POST 요청을 받고응답하기까지 spring 서버에서 하나의 쓰레드를 할당하고, AI 요청을 보낸 다음에 요청을 받을 때까지 해당 톰캣 스레드를 계속해서 물고 있는게 문제가 되었다. 현재 서버는 최대 30개정도의 스레드를 만들 수 있었는데, 여기서 더 커지면 인스턴스상  속도가 급격히 느려지는 등 문제가 발생하기 때문에 이 이상의 스레드를 할당할 수는 없었다.

이러한 30개의 쓰레드라는 제한적인 상황에서 하나의 쓰레드가 5분동안 아무것도 안하고 차지하고 있는 것은 굉장한 비용 낭비였다. 따라서 서버에서는 이러한 문제를 해결하기 위해 비동기적으로 AI 요청/응답을 처리하기로 했다.

## 개선된 처리 플로우
![](https://i.imgur.com/pibG8w3.png)
다이어그램으로 처리 플로우를 그려 이해가 더 쉽도록 정리했다.
서버가 면접별 답변 제출을 받으면 
1. 해당 답변이 성공적으로 제출되어 AI로 요청이 갔으면 응답을 먼저 내려준다.
2. 서버는 AI에게 비동기적으로 요청을 보내고, 클라이언트는 500ms 주기로 계속 서버에 요청하면서 꼬리 질문이 생성되었는지 확인한다
3. 서버가 AI의 응답을 받으면 해당 응답에 대해서 꼬리 질문을 Polling 요청의 응답으로 반환한다.
라는 큰 흐름을 따라가고 있다.

여기서 클라이언트가 고민해야 했던 점은 크게 두가지가 있었다.
1. 처음 AI 요청 자체가 실패했을 경우에는 어떻게 처리해야 할까
2. 다음 AI의 답변을 polling으로 요청해야 하는데 실패했을 경우엔 어떻게 처리해야 할까

나는 여기서 
1. 처음 AI 요청 자체가 실패했을 경우 -> 최대 3번까지 retry 할 수 있도록 한다. 해당 API가 실패하는 경우는 주로 서버 내부적인 문제일 수 있으므로 지수 백오프를 통해 에러를 재시도하도록 하면서 서버가 정상화되기 까지 일정시간 텀을 둔다
2. AI의 답변을 polling으로 요청하다가 실패하는 경우 -> 해당 polling이 실패로 가게 되면 계속해서 polling 과정에서 응답으로 내려주던 `proceedState`가 `LLM_FAILED`로 받게 된다. 이 경우에는 서버에 응답이 제출이 됐는데, LLM 생성만 제대로 안 됐던 경우이기 때문에 LLM에 대한 재요청은 서버에서 3번까지 retry를 하기로 했다. 해당 재요청을 서버에서 다루는 이유는 클라이언트가 따로 요청하면서 RTT를 늘리는 것보다 서버에서 자체적으로 재요청을 하는 것이 효율적이라고 생각했다. 
의 방식으로 에러 예외를 처리하기로 했다.

## 인터셉터를 통한 에러 재시도 로직 추가
이러한 설계를 코드로 구현하면서 `axios`의 인터셉터를 주로 활용하였다. 각각의 요청에 대해서 재시도 상태를 관리해야 할 필요가 있으므로, 요청별로 시도한 상태를 Map으로 관리하였다.
### 면접 답변 제출
```ts
// 요청별 재시도 상태를 관리하는 Map
const retryStateMap = new Map<string, number>();

// 요청 식별자 생성 함수
const createRequestId = (config: AxiosRequestConfig): string => {
  const { method, url, data } = config;
  return `${method}:${url}:${JSON.stringify(data || {})}`;
};

// 재시도 상태 관리 함수들
const getRetryCount = (requestId: string): number => {
  return retryStateMap.get(requestId) || 0;
};

const incrementRetryCount = (requestId: string): number => {
  const currentCount = getRetryCount(requestId);
  const newCount = currentCount + 1;
  retryStateMap.set(requestId, newCount);
  return newCount;
};

const resetRetryCount = (requestId: string): void => {
  retryStateMap.delete(requestId);
};

// 인터뷰 면접 답변에 대한 서버 인스턴스
const answerServerInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_V2_API_BASE_URL,
  withCredentials: true
});

export async function submitInterviewAnswerV2({
  interviewId,
  questionId,
  answer,
  mode
}: InterviewAnswerForm): AxiosPromise {
  return answerServerInstance.post(
    `api endpoint`,
    { answer, mode },
    { timeout: 2000 }
  );
}

// POST 요청에 대한 인터셉터
answerServerInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 성공 시 해당 요청의 retry 상태 정리
    const requestId = createRequestId(response.config);
    resetRetryCount(requestId);
    return response;
  },

  // 에러 응답 처리
  async (error: AxiosError) => {
    const requestId = createRequestId(error.config as AxiosRequestConfig);
    const retryCount = incrementRetryCount(requestId);
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
      resetRetryCount(requestId);
      return Promise.reject(error);
    }

    await exponentialDelay(retryCount);
    return answerServerInstance.request(error.config as AxiosRequestConfig);
  }
);
```
면접 답변의 경우에는 에러에 대한 재시도 인터셉터만을 추가하여 해당 답변 제출 자체가 실패했을 경우에는 3번까지 retry 할 수 있도록 하였다. 여기에 지수 백오프를 사용하여 서버의 상태가 제대로 돌아올 때까지 어느정도 시간을 증가시키며 기다릴 수 있도록 하였다.

응답 인터셉터에서는 정상적인 응답이 오는 경우이기 때문에 기존에 가지고 있던 재시도 상태를 가지고 있던 Map 자료구조를 초기화시켜주었다.
### 꼬리면접에 대한 polling 요청
```ts
// 인터뷰 면접 답변 폴링을 위한 서버 인스턴스
const answerV2ServerInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_V2_API_BASE_URL,
  withCredentials: true
});

// API 요청
export async function getInterviewAnswerV2({
  interviewId,
  questionId,
  mode
}: {
  interviewId: number;
  questionId: number;
  mode: InterviewMode;
}): Promise<CamelCasedProperties<InterviewSubmitPollingSuccess>> {
  return answerV2ServerInstance
    .get<InterviewSubmitPollingSuccess>(
      `api endpoint`
    )
    .then((res) => res.data)
    .then((data) => mapToCamelCase(data));
}

// 폴링 응답 처리 함수
const POLLING_INTERVAL = 500;
const onFullFilledPolling = async (
  response: AxiosResponse<InterviewSubmitPolling>
) => {
  const requestId = createRequestId(response.config);

  if (response.data.proceed_state === "COMPLETED") {
    resetRetryCount(requestId);
    return response;
  }

  if (
    response.data.proceed_state === "LLM_FAILED" ||
    response.data.proceed_state === "TTS_FAILED"
  ) {
    resetRetryCount(requestId);
    return Promise.reject("답변에 대한 처리를 하던 중 오류가 발생했습니다.");
  }

  const retryCount = incrementRetryCount(requestId);
  const maxRetries = 20;

  if (retryCount >= maxRetries) {
    resetRetryCount(requestId);
    return Promise.reject("서버가 응답하지 않습니다.");
  }

  await delay(POLLING_INTERVAL);
  return answerV2ServerInstance.request(response.config);
};

// 폴링 에러 처리 함수
const onRejectedPolling = async (error: AxiosError) => {
  const requestId = createRequestId(error.config as AxiosRequestConfig);
  const retryCount = incrementRetryCount(requestId);
  const maxRetries = 3;

  if (retryCount >= maxRetries) {
    resetRetryCount(requestId);
    return Promise.reject(error);
  }

  await exponentialDelay(retryCount);
  return answerV2ServerInstance.request(error.config as AxiosRequestConfig);
};

// 인터뷰 면접 답변 폴링을 위한 서버 인스턴스
answerV2ServerInstance.interceptors.response.use(
  onFullFilledPolling,
  onRejectedPolling
);
```
`proceed_state`에는 해당 LLM에 대한 생성 오류 뿐만 아니라, 음성 모드일 경우에는 같은 API로  polling 요청을 통해 음성 파일을 받아오기 때문에 해당 로직이 있다. 

기본적으로 polling 요청을 보냈을 때, 서버에서 온 응답에서 `proceed_state` 를 보고 진행중일 경우에는 `POLLING_INTERVAL` 만큼 대기하고 다시금 요청을 보내면서 주기적으로 확인할 수 있도록 인터셉터를 응답 인터셉터쪽에 설정했다.

추가적으로 폴링 자체가 AI 생성중일 때도 200 응답으로 `proceed_state`가 오는데, 이 외의 에러 코드로 오는 경우는 서버가 잠깐 잘못된 상황이라고 가정하고 에러 인터셉터쪽에는 지수 백오프를 사용하여 최대 3번까지 대기하도록 했다. 

## 결론
기존에 30명까지 받을 수 없던 서버 요청에 대해 비동기로 바꾸면서 크게 서버의 처리량을 증가시킬 수 있었으며, 클라이언트 또한 동일한 사용자 경험을 제공할 수 있었다.