---
title: MVP에서 상태관리 개선하기
created: 2025-06-03 12:24
updated: 2025-06-03 12:24
tags:
  - 개발
  - 상태관리
categories: 개발
aliases: 
description: ""
status: draft
---
MVP(Minimum Viablae Product)를 만들 때는 무엇보다도 `이게 잘 굴러가는가?` 가 제일 중요하다. 하나하나 완성시킨다기보다는 시장 검증을 위해 핵심 기능을 어떻게든 완성하고, 이를 통해 초기 사용자의 반응을 관찰하면서 시장 검증을 수행할 수 있도록 해야한다.

![](https://i.imgur.com/Mr1KndG.png)

그렇기 떄문에 초반의 꼬꼬면의 경우 어떻게든 잘 굴러가게만 만들기 위해서 상태관리 등이 부실하다. 팀원들과 함께 스프린트를 돌리는 과정에서 가장 먼저 이 핵심 기능쪽에서의 리팩토링이 우선된다고 생각하여 핵심 기능에 대해서 상태관리를 하는 법을 개선한다.

## 면접 페이지의 Provider 리팩토링
```tsx
import { RobotStatus } from "@/domains/interview/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";

interface InterviewProviderProps {
  children: React.ReactNode;
  interviewId: number;
  message: string;
  status: RobotStatus;
  rootQuestion: string;
  answerQuestion: (answer: string) => Promise<void>;
  exit: () => void;
  interviewStartup: () => void;
}

const InterviewContext = createContext<InterviewProviderProps | null>(null);

const INTERVIEW_STARTUP = [
  "안녕하세요! 반갑습니다.",
  "면접에 참여해주셔서 감사합니다",
  "면접은 편하게 진행되니, 긴장하지 마세요.",
  "면접이 끝나면, 피드백을 드릴 예정입니다.",
  "면접을 시작하겠습니다.",
];

export const InterviewProvider = ({
  children,
  interviewId,
  questionId,
  rootQuestion,
}: {
  children: React.ReactNode;
  interviewId: number;
  questionId: number;
  rootQuestion: string;
}) => {
  const [message, _setMessage] = useState<string>("");
  const [status, _setStatus] = useState<RobotStatus>("beforeStart");
  const [currentQuestionId, setCurrentQuestionId] =
    useState<number>(questionId);
  const navigate = useRouter();

  const interviewStartup = () => {
    _setStatus("standby");
    startupMessage(0);
  };
  const startupMessage = (startupIdx: number) => {
    if (startupIdx < INTERVIEW_STARTUP.length) {
      changeMessage(INTERVIEW_STARTUP[startupIdx]);
      setTimeout(() => startupMessage(startupIdx + 1), 2000);
      return;
    }
    if (startupIdx === INTERVIEW_STARTUP.length) {
      changeMessage(rootQuestion);
      _setStatus("question");
      return;
    }
  };

  const changeMessage = (newMessage: string) => {
    _setMessage(newMessage);
  };

  const answerQuestion = async (answer: string) => {
    const prevMessage = message;
    try {
      _setStatus("thinking");
      const response = await axios.post(
        `/api/interviews/${interviewId}/questions/${currentQuestionId ?? questionId}/answers`,
        {
          interview_id: interviewId,
          question_id: currentQuestionId ?? questionId,
          answer,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      if (response.status === 204) {
        _setStatus("finished");
        changeMessage("면접이 종료되었습니다. 고생 많으셨습니다.");
        setTimeout(() => {
          navigate.replace(`/interview/${interviewId}/result`);
        }, 3000);
        return;
      }
      changeMessage(response.data.question);
      _setStatus("question");
      setCurrentQuestionId(response.data.question_id);
    } catch {
      _setStatus("standby");
      changeMessage("답변을 제출하는데 실패했습니다. 다시 시도해주세요.");
      setTimeout(() => {
        _setStatus("question");
        changeMessage(prevMessage);
      }, 2000);
    }
  };

  const exit = () => {
    if (status === "beforeStart") {
      navigate.back();
      return;
    }
  };


};

export function useInterviewContext() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error(
      "useInterviewContext must be used within an InterviewProvider"
    );
  }
  return context;
}

```

가장 먼저 리팩토링을 할 대상은 이 `InterviewProvider`이다.

일단 해당 코드의 냄새를 맡아보자.
## 코드 냄새 맡아보기 👃
### 1. 불필요한 props 없애기
```tsx

  return (
    <InterviewContext.Provider
      value={{
        exit,
        children,
        interviewId,
        message,
        status,
        rootQuestion,
        answerQuestion,
        interviewStartup,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
```
이건 왜 그랬지..? 어지간히 급했나보다
`children` props는 딱히 provider로 내려줄 필요가 없기 때문에 Provider 컴포넌트에서 받은 children은 `Provider의 children`으로만 가게 했다.

```tsx
<InterviewContext.Provider
      value={{
        exit,
        children,
        interviewId,
        message,
        status,
        rootQuestion,
        answerQuestion,
        interviewStartup,
      }}
    >
      {children}
    </InterviewContext.Provider>
```

### 2. 상태와 타입의 네이밍
지금 관리하고 있는 상태의 경우 세 가지가 있다. 
```tsx
const [message, _setMessage] = useState<string>("");
const [status, _setStatus] = useState<RobotStatus>("beforeStart");
const [currentQuestionId, setCurrentQuestionId] =
    useState<number>(questionId);
```
- message : 면접관이 질문할 때 보여주는 메시지
- status : 면접관의 상태(`시작 전 | 대기 | 질문 중 | 질문 제출 후 대기 | 면접 끝 `)
- currentQuestionId : 질문과 함께 해당 질문에 대한 대답을 post 요청으로 보내기 위한 id값

하지만
- message의 경우에, 어떤 메시지인지 조금 모호한 감이 있다
- `status`의 타입같은 경우, `RobotStatus`를 타입으로 가지고 있는데, 사실상 면접 자체의 상태를 나타내는 것인데 `로봇의 상태`라는 네이밍 자체가 애매하다.

### 3. 상태의 업데이트
`시작 전 | 대기 | 질문 중 | 질문 제출 후 대기 | 면접 끝 `

현재는 다섯 개의 status 상태를 가지고 있는데, 이 상태가 변경되는 경우는 명확하게 구분되어 있으면서, 메시지 또한 함께 가는 경우가 많다.
- 질문 중 -> 첫 질문이나 질문 제출 후 다른 질문을 받았을 때
- 질문 제출 후 대기 -> 서버에게 답변 제출 후 다음 질문이나 면접 끝 전까지
- 면접 끝 -> 서버로부터 204 `no Content` 응답을 받았을 때
- 시작 전 -> 면접 시작 버튼을 누르기 전 
- 대기 -> 인터뷰 시작하면서 안내사항 전달할 때
이렇게 상태를 명확하게 나누고, 업데이트 할 때가 명확하게 정해져 있으며 message와 같이 복수의 상태가 함께 바뀌게 된다면 `useReducer`를 통해서 각 로직을 하나로 묶어줄 수 있다.

```tsx
if (response.status === 204) {
        _setStatus("finished");
        changeMessage("면접이 종료되었습니다. 고생 많으셨습니다.");
        setTimeout(() => {
          navigate.replace(`/interview/${interviewId}/result`);
        }, 3000);
        return;
      }
      changeMessage(response.data.question);
      _setStatus("question");
      setCurrentQuestionId(response.data.question_id);
    } catch {
      _setStatus("standby");
      changeMessage("답변을 제출하는데 실패했습니다. 다시 시도해주세요.");
      setTimeout(() => {
        _setStatus("question");
        changeMessage(prevMessage);
      }, 2000);
    }
```
그렇게 된다면 message와 status를 하나로 묶어서 실행할 수도 있고, 각 상태 변경이 명확한 시점에 대해서 reducer를 정의해 놓는다면 이 로직이 어떻게 동작할 지를 더 명확하게 파악할 수 있을 것이다.

### 4. 과중되어 있는 책임
기존의 코드의 경우, 
- 인터뷰 시작 코멘트에 대한 메시지 변경
- 인터뷰 종료 시 밖으로 나가기
- 그 외 상태변경 등 인터뷰 진행 전반 모든 로직
등 상태만을 변경하는 것 말고도 많은 책임을 가지고 있다.

```tsx
  const exit = () => {
    if (status === "beforeStart") {
      navigate.back();
      return;
    }
  };
```
대표적인 예가 이 `exit` 함수이다.  면접을 시작하기 전에는 모달을 통해서 

![](https://i.imgur.com/zTryUgX.png)
이렇게 띄워주고 있는데, 결국 이 모달이 가지는 책임마저 Provider가 가지게 되는 문제가 발생한다.
그렇게 되면 Provider 자체가 가지고 있는 책임이 가중되어 이러한 책임을 분산시킬 필요가 있다고 판단했다.
그 외에도
```tsx
if (response.status === 204) {
        dispatch({ type: "QUESTION", payload: { status: "finished" } });
        setTimeout(() => {
          navigate.replace(`/interview/${interviewId}/result`);
        }, 3000);
        return;
      }
```
면접이 끝났을 때도 setTimeout을 통해서 결과 페이지로 이동하는 로직 자체가 answerQuestion 안에 함께 넣다 보니 `answerQuestion` 자체도 `다음 문제 처리, 에러시 롤백처리, 마지막 문제 후 결과 페이지로 이동` 등 과중한 책임을 가지게 된다. 따라서 이 router 훅 자체도 바깥으로 빼서 필요한 컴포넌트로 책임을 분산해야겠다고 생각했다.


## 리팩토링 후
```tsx
import { submitInterviewAnswer } from "@/domains/interview/api/interviewAnswer";
import { InterviewStatus } from "@/domains/interview/types";
import { createContext, useContext, useReducer } from "react";

interface InterviewProviderProps {
  interviewId: number;
  message: string;
  status: InterviewStatus;
  rootQuestion: string;
  answerQuestion: (answer: string) => Promise<void>;
  interviewStartup: () => void;
}

const InterviewContext = createContext<InterviewProviderProps | null>(null);

const INTERVIEW_STARTUP =
  "안녕하세요! 꼬꼬면 면접에 오신 것을 환영합니다. 면접을 시작하겠습니다.";
const INTERVIEW_SUBMIT_FAILED = "답변 제출에 실패했습니다. 다시 시도해주세요.";
interface InterviewState {
  message: string;
  status: InterviewStatus;
  currentQuestionId: number;
}
interface InterviewAction {
  type:
    | "ANSWER_QUESTION"
    | "START_UP"
    | "INTERVIEW_END"
    | "QUESTION"
    | "SUBMIT_FAILED";
  payload: {
    message?: string;
    status?: InterviewStatus;
    currentQuestionId?: number | null;
  };
}

function reducer(
  state: InterviewState,
  action: InterviewAction
): InterviewState {
  switch (action.type) {
    case "ANSWER_QUESTION":
      return {
        ...state,
        status: "thinking",
      };
    case "START_UP":
      return {
        ...state,
        status: "standby",
        message: INTERVIEW_STARTUP,
      };
    case "INTERVIEW_END":
      return {
        ...state,
        status: "finished",
        message: "면접이 종료되었습니다.",
      };
    case "QUESTION":
      return {
        ...state,
        message: action?.payload?.message as string,
        status: "question",
        currentQuestionId: action?.payload?.currentQuestionId as number,
      };
    case "SUBMIT_FAILED":
      return {
        ...state,
        status: "standby",
        message: INTERVIEW_SUBMIT_FAILED,
      };
    default:
      return state;
  }
}

export const InterviewProvider = ({
  children,
  interviewId,
  questionId,
  rootQuestion,
}: {
  children: React.ReactNode;
  interviewId: number;
  questionId: number;
  rootQuestion: string;
}) => {
  const [state, dispatch] = useReducer(reducer, {
    message: INTERVIEW_STARTUP,
    status: "beforeStart",
    currentQuestionId: questionId,
  });

  const interviewStartup = () => {
    dispatch({ type: "START_UP", payload: {} });
    setTimeout(
      () => dispatch({ type: "QUESTION", payload: { message: rootQuestion } }),
      2000
    );
  };

  const answerQuestion = async (answer: string) => {
    const prevMessage = state.message;
    try {
      dispatch({ type: "QUESTION", payload: { status: "thinking" } });
      const response = await submitInterviewAnswer({
        answer: answer,
        interview_id: interviewId,
        question_id: state.currentQuestionId,
      });
      if (response.status === 204) {
        dispatch({ type: "QUESTION", payload: { status: "finished" } });
        return;
      }
      dispatch({
        type: "QUESTION",
        payload: {
          status: "question",
          message: response.data.question,
          currentQuestionId: response.data.question_id,
        },
      });
    } catch {
      dispatch({ type: "SUBMIT_FAILED", payload: {} });
      setTimeout(() => {
        dispatch({
          type: "QUESTION",
          payload: { message: prevMessage, status: "question" },
        });
      }, 2000);
    }
  };

  return (
    <InterviewContext.Provider
      value={{
        interviewId,
        message: state.message,
        status: state.status,
        rootQuestion,
        answerQuestion,
        interviewStartup,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export function useInterviewContext() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error(
      "useInterviewContext must be used within an InterviewProvider"
    );
  }
  return context;
}

```
이전에 봤었던 파악하기 어려웠던 로직들이 보다 정리됐고, `dispatch type`을 통해 상태 변경 로직 자체를 명확히 볼 수 있어 무엇을 하고자 하는 로직인지 잘 보인다고 생각한다.

## 다시 고민하기 🤔
`InterviewProvider`같은 경우에 인터뷰의 상태를 내려하기 위한 provider이다.
그렇기 때문에 이 상태를 관리 하는 것이 하나의 책임이라고 생각하면, `answerQuestion`과 같이 질문에 대해 에러 분기 및 다음 메시지를 처리하는 로직과 같은  부분 또한 별도의 책임 하나를 더 들고 간다고 생각할 수 있다. 그렇다면 이 `answerQuestion`이나 , 인터뷰를 시작할 때 쓰는 `interviewStartup` 과 같은 부분은 해당 도메인의 컴포넌트에 책임을 분산하는 것이 좋을까?


## 리뷰를 받고 난 후..
소마 멘토님께 코드 리뷰를 요청했었다.
해당 코드 리뷰의 경우,  위 `Context api` 를 중점적으로 봐달라고 요청했는데, 여기서 좋지 못한 평을 받았다.
너무 복잡하게 설계되었다는 이유에서였다. 결국 `Context api` 를 사용한다는 것은, `props drilling` 이나 여러 컴포넌트에 분산된 상태를 `props`를 통해 주입하지 않고 관리하기 위해 사용되는 것인데, 내가 설계한 구조 자체는 애초에 `props drilling`이 일어날 정도로 추상화될 수 있는 부분이 크게 존재하지 않고, 사용할 곳이 제한적인 컴포넌트 자체를 너무 처음부터 복잡하게 추상화하고 있다는 이유였다.

멘토님 말씀을 듣고 보니 확실히 불필요한 추상화가 많이 이루어졌다는 생각도 들었다.
```tsx
import { useInterviewContext } from "@/domains/interview/components/interviewProvider";
import { InterviewStatus } from "@/domains/interview/types";
import Image from "next/image";

const ROBOT_SOURCES: Record<InterviewStatus, { src: string; alt: string }> = {
  beforeStart: {
    src: "/interview/robot_standby.png",
    alt: "Robot Standby",
  },
  standby: {
    src: "/interview/robot_standby.png",
    alt: "Robot Standby",
  },
  thinking: {
    src: "/interview/robot_thinking.png",
    alt: "Robot Thinking",
  },
  question: {
    src: "/interview/robot_question.png",
    alt: "Robot question",
  },
  finished: {
    src: "/interview/robot_standby.png",
    alt: "Robot Finished",
  },
};
export default function Robots() {
  const { status } = useInterviewContext();

  return (
    <div className="absolute top-[25%] left-[30%] w-[40%] z-10">
      {Object.entries(ROBOT_SOURCES).map(([key, { src, alt }]) => (
        <Image
          key={key}
          src={src}
          alt={alt}
          width={300}
          height={300}
          className={`w-full absolute top-0 left-0 ${
            status === key ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          priority={key === "standby"}
        />
      ))}
    </div>
  );
}
```

멘토님이 지적하신 과도한 추상화가 무엇인지 보았을 때 대표적으로 해당 Robots라는 컴포넌트였다고 생각한다. 그저 주입받은 의존성에 대해서 상태에 따라 이미지를 보여주는 것 뿐인 컴포넌트인데, 이런 부분이 너무 상세하게 추상화 되면서 오히려 응집도가 낮은 것 같다는 생각을 다시 해볼 수 있었다.

또한 이러한 추상화를 다시 벗겨낸다고 생각했을 때, 이를 `Provider`로 감싸 매번 `children`들의 리렌더링을 일으키기 보다는 `zustand`의 `store`를 사용해서 필요한 부분에서만 리렌더링을 시킨다던가, 아니면 그냥 상위에서 `Context api` 없이 관리해도 괜찮을 것 같다고 생각했다.

추가적으로 이를 고치면서 Context API에서 내려주고 있는 `interviewStatus`의 경우에도 고칠 필요가 있다고 생각했다. 

```ts
type InterviewStatus =
  | "standby"
  | "thinking"
  | "question"
  | "finished"
  | "beforeStart";
```
애초에 타입에 따라 다른 이미지를 주기 위해서 사용했다면, 같은 이미지를 주는 경우에는 상태를 합쳐도 크게 문제될 점이 없다. 그런데도 이미 너무 상태를 복잡하게 나눈게 아닌거냐는 멘토님의 말씀을 듣고 이 부분도 함께 고쳐보기로 했다.
### 성능을 고려해서 다시 고치기
```tsx
import { InterviewStatus } from "@/domains/interview/types";
import React, { useReducer } from "react";

const INTERVIEW_STARTUP: string =
  "안녕하세요! 꼬꼬면 면접에 오신 것을 환영합니다. 면접을 시작하겠습니다.";
const INTERVIEW_SUBMIT_FAILED: string =
  "답변 제출에 실패했습니다. 다시 시도해주세요.";
const INTERVIEW_FINISHED: string = "면접이 종료되었습니다. 수고하셨습니다!";

interface IInterviewState {
  message: string;
  status: InterviewStatus;
  currentQuestionId: number;
}

interface IStartupAction {
  type: "START_UP";
}
interface IAnswerQuestionAction {
  type: "ANSWER_QUESTION";
}
interface IInterviewEndAction {
  type: "INTERVIEW_END";
}
interface ISubmitFailedAction {
  type: "SUBMIT_FAILED";
}
interface IQuestionAction {
  type: "QUESTION";
  message: string;
  currentQuestionId: number;
}
type InterviewAction =
  | IStartupAction
  | IAnswerQuestionAction
  | IInterviewEndAction
  | ISubmitFailedAction
  | IQuestionAction;

function reducer(
  state: IInterviewState,
  action: InterviewAction
): IInterviewState {
  switch (action.type) {
    case "ANSWER_QUESTION":
      return {
        ...state,
        status: "thinking",
      };
    case "START_UP":
      return {
        ...state,
        status: "standby",
        message: INTERVIEW_STARTUP,
      };
    case "INTERVIEW_END":
      return {
        ...state,
        status: "standby",
        message: INTERVIEW_FINISHED,
      };
    case "QUESTION":
      return {
        ...state,
        message: action.message,
        status: "question",
        currentQuestionId: action.currentQuestionId,
      };
    case "SUBMIT_FAILED":
      return {
        ...state,
        status: "standby",
        message: INTERVIEW_SUBMIT_FAILED,
      };
    default:
      return state;
  }
}

export const useInterviewStatus = ({
  questionId,
}: {
  questionId: number;
  rootQuestion: string;
}): { state: IInterviewState; dispatch: React.Dispatch<InterviewAction> } => {
  const [state, dispatch] = useReducer(reducer, {
    message: INTERVIEW_STARTUP,
    status: "standby",
    currentQuestionId: questionId,
  });

  return { state, dispatch };
};
```
기존의 Context API를 벗겨내고 커스텀 훅으로 로직을 바꿨다.
기존의 복잡한 로직이 확 줄어들었고, 필요한 타입들이 조금 늘어난 것에 반해 확실히 로직이 어떤 식으로 진행되는지 확실하게 이해할 수 있게 되었다. 또한 reducer마다 필요한 payload의 타입을 따로 명시하면서 타입 안정성을 더 잘 가져갈 수 있도록 개선했다.

