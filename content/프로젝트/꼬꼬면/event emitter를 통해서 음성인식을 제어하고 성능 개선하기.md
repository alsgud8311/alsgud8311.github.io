---
title: event emitter를 통해서 음성인식을 제어하고 성능 개선하기
created: 2025-08-21 01:09
updated: 2025-08-21 01:09
tags: []
categories: []
aliases: []
description: ""
status: draft
---

## 개요
음성 모드를 개발하면서 상태를 상세하게 조작했어야 하는 과정이 있었습니다.

음성 모드에서는 3D 인터뷰 아바타의 상태 조작, 음성 조작, 마이크 조작을 여러 상태로 관리하면서 각각의 상태에 따라 아바타가 일정부분 상호작용할 수 있게끔 해야 했고, 음성 및 마이크에 따라서 각각 상태에 따라 다시금 음성을 들을 수 있게끔 하거나 마이크가 작동되고 있다는 UI를 제공해야 했습니다. 이 때문에 곅속해서 바뀌는 음성 인식중 여부 등을 상태로 관리할 수 밖에 없었습니다.

이 과정에서 하위에서 조작하던 상태가 위로 올라가야 하는 상황과 함께 리렌더링에 대한 문제가 있었고, 이를 Event Emitter를 사용했던 이야기를 담았습니다.

## 문제
기존에 따로 개발했던 `useSpeechRecognition`은 이와 같은 형태로 되어 있었습니다.

![](https://i.imgur.com/JZPgEmi.png)

간단하게 그림으로 보면 인터뷰 페이지에는 크게 세 개의 컴포넌트가 있었습니다(하위 컴포넌트 대부분은 제외했습니다.)

각자 인터뷰 페이지 내에서 맡고 있는 책임에 따라 상태들을 분리해서 관리해줄 수 있도록 하였고, 대부분 상태들은 현재 전체적인 인터뷰 진행 상황 상태를 제외한 상태들은 하위 컴포넌트의 지역 상태로 분리했습니다.

하지만 여기서 신 기능으로 음성 인식을 추가하면서, 음성이 인식되고 있는 중간에는 아바타가 끄덕거리는 등 사용자의 인터랙션에 따라 아바타에 피드백을 하려는 과정에서 생깁니다.

![](https://i.imgur.com/77UpZcg.png)

인터뷰 답변 폼에서 가지고 있던 음성인식 여부의 지역상태를 같은 계층의 아바타 모델 컴포넌트가 필요로 한다는 점이었습니다. 

```ts
export const useSpeechRecognition = ({
  ...
}: UseSpeechRecognitionProps): UseSpeechRecognitionReturn => {
  const {
    lang = "ko-KR",
    continuous = true,
    interimResults = true,
    maxAlternatives = 1
  } = options;

  // 현재 듣고 있는지 여부
  const [isListening, setIsListening] = useState(false);
  // 음성 인식 사용중 발생한 오류 캐치
  const [error, setError] = useState<string | null>(null);
  // Web API 지원 여부
  const [isSupported, setIsSupported] = useState(false);
  // 중간 결과를 Merge하기 위한 배열과 포인터
  const result = useRef<string[]>([]);
  const resultPointer = useRef<number>(0);
  ...
```

기존에 인터뷰 답변 폼 내부에서 사용하고 있던 음성 인식 커스텀 훅의 일부입니다.
해당 커스텀 훅은 음성 인식에 대한 책임을 담당하고 있습니다. 음성 인식들에 대한 결과와 에러, 음성인식중 여부 등을 모두 검사하고 있습니다. 

문제는 이 커스텀 훅이 위로 올라오는 경우입니다. 해당 상태들이 위로 올라오게 되고, 음성 인식에서 옵션으로 줬던 `InterimResult`의 특성상 평균 한 문장에 8~10번정도의 텍스트 업데이트가 이루어지고, 그렇게 된다면 상위 컴포넌트에서 발생하는 리렌더링인 만큼, 하위의 컴포넌트를 모두 리렌더링 시키게 됩니다.

![](https://i.imgur.com/cHqIHWs.png)

추가적으로 뎁스가 높아지는 하위 컴포넌트들에 대한 복잡성 증가 또한 무시할 수 없습니다. 
바로 아래 하위 컴포넌트 뿐만 아니라, 보이는 컴포넌트들의 하위에도 전부 컴포넌트들이 있는데, 해당 상태를 사용하는 컴포넌트까지 뎁스를 늘리고, 음성 인식 버튼도 당장 한 단계 뎁스가 높아져 이후의 유지보수가 어려울 수 있다는 문제또한 있었습니다.
## 문제 해결
저는 이 문제를 EventEmitter를 사용해서 observer 패턴 기반의 유틸 함수를 만들어 해결했습니다.
제가 해결한 문제를 설명해드리기 전에 이전에 고려했던 방안들에 대해서도 먼저 말해볼까 합니다. 
### memo를 통한 메모이제이션?
확실히 memo를 통해 컴포넌트 자체를 메모이제이션하는 것도 이에 대한 해결방법 중 하나였습니다. 가장 쉽게 해결할 수 있는 방안이었을 것 같아요.
음성 인식 커스텀 훅의 일부 상태만 Props로 내려주면서 해당 Props가 바뀔 경우에만 리렌더링 하도록 할 수 있습니다. 

하지만 이를 선택하지 않은 가장 큰 이유는 `유지보수성` 이었습니다.
현재 컴포넌트의 구조에서 인터뷰 질문같은 경우는 이미 꼬리 질문에 따라 바뀌는 질문이 상위 컴포넌트에서 Props로 내려주고 있었고, 이에 따라 불필요한 경우에는 리렌더링이 되지 않도록 해놓은 상태였습니다.
이 때, 이 구조에서 만약 상태를 더 주입하고 하위 컴포넌트에 렌더링을 하게 된다면 메모이제이션이 다른 타이밍에 최적화되는 상태가 여러개가 되는 셈입니다.

이 외에도 상태에 주입하는 Props들이 여러개가 있다면 더욱 최적화를 위한 상태가 어떤 상태인지 더 구별하기 힘들어지게 됩니다. 저는 그렇기 때문에 최적화를 위해 컴포넌트를 설계할 때는 최적화를 위한 상태를 여러개를 두지 않습니다. 이로 인해 나중에 이 memo가 무엇을 위한 memo인가에 대한 기억을 복기하는 것도 비용 소모이기 때문입니다. 

추가적으로 memo가 필요 없던 컴포넌트들도 전부 memo로 감싸야 한다는 점도 코드의 복잡성과 위에서 말한 문제들이 더 수평적으로 불어나기 때문이라는 이유도 있었습니다.

### 전역 상태 라이브러리 사용
전역 상태 라이브러리를 사용하는 방법도 있었습니다. 현재 사용하고 있는 zustand를 활용하자면 독립된 하나의 스토어를 만들어놓고 여기서 상태 정보를 관리하는 것이죠.

> slice pattern을 생각하지 않은 이유는 독립된 비즈니스 로직에서 기존의 Store와 합쳐진 store는 부적합하다고 생각합니다. 

하지만 이 전역 상태 라이브러리를 사용하는 방식 또한 그렇게 마음에 들진 않았습니다.

zustand는 Flux 패턴을 따르는 라이브러리로, 대부분 상태에 대한 action을 정의하고 이를 통해 데이터를 단방향으로 정리하려는 것이 zustand의 철학 중 하나입니다. 그렇게 된다면 store의 action이 가지는 책임에 Web API를 두는 것이 유지보수성 측면에서 좋지 않다고 생각했습니다. 또한 Web API를 따로 두게 된다면 결국 Web API의 이벤트들과 따로 관리를 해야 하는 필요성이 있었고, '굳이 상태까지 따로 보관해야 할까?'하는 생각이 들었습니다. 하위 컴포넌트에서는 직접적으로 상태를 이용하는 것이 아니라 간접적으로 해당 상태를 useEffect의 의존성으로 두고 다른 상태를 바꾸는 형태였기 때문입니다. 따라서 스토어까지 만들어가면서 직접 상태를 구독하는 것은 배보다 배꼽이 더 큰 상황처럼 여겨졌습니다.

이러한 고민들을 한 끝에, 저는 EventEmitter를 활용하는 방식을 떠올리게 되었습니다.
- 특정 상태를 보고 해당 상태가 바뀔 경우에 이에 따라 다른 상태를 조작하기만 하면 됐기 때문에 콜백을 등록시키고 상태 변경시 Notify를 통해 상태 변화 감지 후 하위 컴포넌트의 상태 변경
- store와 같이 상태를 따로 전역에 보관해놓지 않고 특정 필요한 이벤트만 구독하고 특정 콜백 등록
- 추가적인 리렌더링이 이루어지지 않고 특정 이벤트를 구독해놓은 컴포넌트만 리렌더링
이라는 매력적인 특징이 있었기 때문입니다. 


이를 구현하기 위해, 저는 음성 인식과 관련된 특정 이벤트들만 미리 typescript의 `Union` 타입을 통해 정해놓고 해당 이벤트에 대해서 콜백을 등록하고 상태 변경이 이루어질 시 해당되는 이벤트를 발생시키는 코드만 추가하면 됐습니다.

```ts
import { EventEmitter } from "events";
import { DependencyList, useEffect } from "react";

export type InterviewEventType =
  | "startVoiceRecognition"
  | "stopVoiceRecognition"
  | "voiceRecognitionStarted"
  | "voiceRecognitionStopped"
  | "voiceRecognitionError"
  | "voiceRecognitionResult";

interface InterviewEventPayloads {
  startVoiceRecognition: undefined;
  stopVoiceRecognition: undefined;
  voiceRecognitionStarted: undefined;
  voiceRecognitionStopped: undefined;
  voiceRecognitionError: { error: string };
  voiceRecognitionResult: { text: string };
}

class TypedEventEmitter extends EventEmitter {
  public emit<K extends InterviewEventType>(
    event: K,
    ...args: InterviewEventPayloads[K] extends undefined
      ? []
      : [InterviewEventPayloads[K]]
  ): boolean {
    return super.emit(event, ...args);
  }

  public on<K extends InterviewEventType>(
    event: K,
    listener: InterviewEventPayloads[K] extends undefined
      ? () => void
      : (payload: InterviewEventPayloads[K]) => void
  ): this {
    return super.on(event, listener);
  }

  public off<K extends InterviewEventType>(
    event: K,
    listener: InterviewEventPayloads[K] extends undefined
      ? () => void
      : (payload: InterviewEventPayloads[K]) => void
  ): this {
    return super.off(event, listener);
  }

  public once<K extends InterviewEventType>(
    event: K,
    listener: InterviewEventPayloads[K] extends undefined
      ? () => void
      : (payload: InterviewEventPayloads[K]) => void
  ): this {
    return super.once(event, listener);
  }
}

// 싱글톤 인스턴스
export const interviewEvents: TypedEventEmitter = new TypedEventEmitter();

// 이벤트 구독하는 훅
export function useInterviewEvent<K extends InterviewEventType>(
  event: K,
  handler: InterviewEventPayloads[K] extends undefined
    ? () => void
    : (payload: InterviewEventPayloads[K]) => void,
  deps: DependencyList = []
): void {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interviewEvents.on(event, handler as any);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      interviewEvents.off(event, handler as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]);
}
```

기존의 EventEmmiter를 상속받아 새로운 eventemitter를 만들면서도 Type-safe하도록 이벤트를 관리하였고, 해당 eventEmitter는 싱글톤 인스턴스로 두어 어디서든 가져와도 한 곳을 바라볼 수 있도록 하였습니다. 

```ts
// 이벤트 발생 -> 커스텀 훅
const handleSpeechStart = useCallback((): void => {
    setIsListening(true);
    setError(null);
    // voiceRecognitionStarted 이벤트 발행
    interviewEventHelpers.notifyVoiceStarted();
  }, []);
  
// voiceRecognitionStarted 이벤트 구독
// voiceRecognitionStarted 이벤트가 발행되면 콜백이 실행
useInterviewEvent("voiceRecognitionStarted", () => {
    setIsListening(true);
  });
```

이벤트를 구독하는 컴포넌트에서는 이렇게 특정 콜백을 간단하게 등록시키기만 하면, 해당하는 이벤트가 발행될 때 등록시켜놓은 콜백이 작동하게 됩니다.

이를 통해 각 하위 컴포넌트는 불필요한 리렌더링을 방지하고 특정 상태를 감시하면서 이와 결합된 다른 상태의 상태를 쉽게 변경할 수 있습니다. 


## 결론
저는 프론트엔드 개발을 하면서 전역 상태 관리 툴에 대해서 공부하고 사용도 많이 해봤지만, 사실 리렌더링을 최적화하기 위해 관성적으로 전역 상태 관리 라이브러리로 상태를 옮겨 관리하는 방식을 좋아하지 않았습니다. 상태의 초깃값이라고 하더라도 쓰지 않다가 필요할 때만 쓰는 상태를 전역에 두는 것이 다소 어색하게 느껴지기도 했습니다. 

그러던 중 eventEmitter를 통한 새로운 상태 관리 방식을 알게 되었고, 결국 이 기술 또한 다른 전역상태 관리 라이브러리의 원리임을 알게 되었습니다. 이를 통해 전역 상태 관리 라이브러리를 관성적으로 사용하기보다는 기술의 상황과 크기 등에 맞춰서 유동적으로 조절하는 활용의 중요성을 깨닫기도 했고요. 결국 이는 더욱 효율적인 상태 관리에 대한 고민을 많이 할 수 있게 해준 소중한 경험이었습니다. 
