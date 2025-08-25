---
title: useImperativeHandle을 통해서 성능 개선하기
created: 2025-08-21 01:09
updated: 2025-08-21 01:09
tags: []
categories: []
aliases: []
description: ""
status: "draft" # draft, in-progress, completed
---

## 개요
최근에 음성 모드를 개발하면서 상태를 상세하게 조작했어야 했다.
음성 모드에서는 3D 인터뷰 아바타의 상태 조작, 음성 조작, 마이크 조작을 여러 상태로 관리하면서 각각의 상태에 따라 아바타가 일정부분 상호작용할 수 있게끔 해야 했고, 음성 및 마이크에 따라서 각각 상태에 따라 다시금 음성을 들을 수 있게끔 하거나 마이크가 작동되고 있다는 UI를 제공해야 했기 때문에 상태로 관리할 수 밖에 없었다. 이 과정에서 하위에서 조작하던 상태가 위로 올라가야 하는 상황과 함께 리렌더링에 대한 문제가 있었고, 이를 Event Emitter를 사용했던 이야기를 담았다.
## 문제
기존의 `useSpeechRecognition`은 이와 같은 형태로 되어 있었다. 콜백함수를 받아 해당 함수에 이전 결과를 누적해서 보여줄 수 있도록 하였다. 
```ts
import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

type SpeechRecognitionType =
  | typeof window.SpeechRecognition
  | typeof window.webkitSpeechRecognition;

interface UseSpeechRecognitionProps {
  // eslint-disable-next-line no-unused-vars
  onSpeechEnd: (result: string) => void;
  startOnMount: boolean;
  enabled?: boolean;
  options?: UseSpeechRecognitionOptions;
}

export const useSpeechRecognition = ({
  onSpeechEnd,
  startOnMount = false,
  enabled = true,
  options = {}
}: UseSpeechRecognitionProps): UseSpeechRecognitionReturn => {
  const {
    lang = "ko-KR",
    continuous = true,
    interimResults = true,
    maxAlternatives = 1
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const result = useRef<string[]>([]);
  const resultPointer = useRef<number>(0);

  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(
    null
  );

  // 이벤트 핸들러들
  const handleSpeechStart = useCallback((): void => {
    setIsListening(true);
    setError(null);
  }, []);

  const handleSpeechEnd = useCallback((): void => {
    setIsListening(false);
    if (result.current[resultPointer.current] === "") {
      return;
    }
    resultPointer.current++;
    if (startOnMount) {
      recognitionRef.current?.start();
    }
  }, [startOnMount]);

  const handleSpeechResult = useCallback(
    // eslint-disable-next-line no-undef
    (event: SpeechRecognitionEvent): void => {
      if (!enabled) return;
      let resultString = "";
      for (const result of event.results) {
        if (result[0].transcript) {
          resultString += result[0].transcript;
        }
      }
      result.current[resultPointer.current] = resultString;
      onSpeechEnd(result.current.join(" "));
    },
    [onSpeechEnd, enabled]
  );

  // eslint-disable-next-line no-undef
  const handleSpeechError = useCallback(
    // eslint-disable-next-line no-undef
    (event: SpeechRecognitionErrorEvent): void => {
      setIsListening(false);
      let errorMessage = "음성 인식 중 오류가 발생했습니다.";

      switch (event.error) {
        case "no-speech":
          errorMessage = "음성이 감지되지 않았습니다.";
          break;
        case "audio-capture":
          errorMessage = "마이크에 접근할 수 없습니다.";
          break;
        case "not-allowed":
          errorMessage = "마이크 권한이 필요합니다.";
          break;
        case "network":
          errorMessage = "네트워크 오류가 발생했습니다.";
          break;
        default:
          errorMessage = `음성 인식 오류: ${event.error}`;
      }

      setError(errorMessage);
    },
    []
  );

  // 이벤트 리스너 등록 함수
  const attachEventListeners = useCallback(
    (recognition: InstanceType<SpeechRecognitionType>): void => {
      recognition.onstart = handleSpeechStart;
      recognition.onresult = handleSpeechResult;
      recognition.onerror = handleSpeechError;
      recognition.onend = handleSpeechEnd;
    },
    [handleSpeechStart, handleSpeechResult, handleSpeechError, handleSpeechEnd]
  );

  // 이벤트 리스너 해제 함수
  const detachEventListeners = useCallback(
    (recognition: InstanceType<SpeechRecognitionType>): void => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    },
    []
  );

  // SpeechRecognition 인스턴스 생성 및 설정
  const createSpeechRecognition =
    useCallback((): InstanceType<SpeechRecognitionType> => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // 설정 적용
      recognition.lang = lang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = maxAlternatives;

      // 이벤트 리스너 등록
      attachEventListeners(recognition);

      return recognition;
    }, [
      lang,
      continuous,
      interimResults,
      maxAlternatives,
      attachEventListeners
    ]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("음성 인식이 지원되지 않습니다.");
      return;
    }

    try {
      // 기존 인스턴스가 있다면 정리
      if (recognitionRef.current) {
        detachEventListeners(recognitionRef.current);
        recognitionRef.current.abort();
      }

      // 새 인스턴스 생성 및 시작
      recognitionRef.current = createSpeechRecognition();
      recognitionRef.current.start();
    } catch (error) {
      setError("음성 인식을 시작할 수 없습니다.");
    }
  }, [isSupported, createSpeechRecognition, detachEventListeners]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      // 이벤트 리스너 해제
      detachEventListeners(recognitionRef.current);

      // 음성 인식 중단
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    // 상태 초기화
    setIsListening(false);
    result.current = [];
    resultPointer.current = 0;
  }, [isListening, detachEventListeners]);

  // 컴포넌트 마운트 시 브라우저 지원 확인
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    setIsSupported(true);
  }, [startListening]);

  useEffect(() => {
    if (startOnMount) {
      startListening();
    }
  }, [startOnMount, startListening]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        detachEventListeners(recognitionRef.current);
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [detachEventListeners]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    error
  };
};

```

```tsx


type InterviewInputProps = Pick<
  Interview,
  "cur_question_id" | "prev_questions_and_answers"
> & {
  ...
};
const SUBMIT_FAILED_MESSAGE: string =
  "제출 중 오류가 발생했습니다. 다시 시도해주세요.";
const FINISHED_MESSAGE: string = "면접이 종료되었습니다. 수고하셨습니다.";
export function InterviewAnswerForm({
  ...
}: InterviewInputProps): JSX.Element {
  const [interviewInput, setInterviewInput] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const updateInterviewInput = useCallback(
    (result: string) => {
      if (!isInterviewStarted) return;
      setInterviewInput(result);
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight > 400 ? 400 : textAreaRef.current.scrollHeight}px`;
      }
    },
    [setInterviewInput, isInterviewStarted]
  );
  const {
    startListening,
    isListening: isVoiceListening,
    stopListening
  } = useSpeechRecognition({
    onSpeechEnd: updateInterviewInput,
    startOnMount: mode === "VOICE"
  });
  const { mutate, isPending } = useMutation(..)

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
  ): void => {
    ...
  };
  return (
    <form className="bottom-10 gap-3 p-4 items-center w-full border border-border-secondary rounded-xl bg-bg-base">
      <Textarea
        ref={textAreaRef}
        role="textbox"
        aria-label="interview-answer"
        variant={"default"}
        name="interview-answer"
        border={"none"}
        className={`transition-all block w-full resize-none border-none focus:border-none max-h-[250px] mb-2 ${
          isVoiceListening ? "bg-bg-text-hover animate-pulse" : ""
        }`}
        rows={1}
        onChange={(e) => setInterviewInput(e.target.value)}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            !e.shiftKey &&
            !isPending &&
            isInterviewStarted
          ) {
            e.preventDefault();
            setIsListening(false);
            mutate({
              interviewId: interviewId,
              questionId: cur_question_id,
              answer: interviewInput,
              mode: mode as InterviewMode
            });
          }
        }}
        value={interviewInput}
        autoAdjust={true}
        disabled={isPending || !isInterviewStarted || isVoiceListening}
        aria-disabled={isPending || !isInterviewStarted || isVoiceListening}
        placeholder={"답변을 입력해주세요..."}
        onFocus={() => setIsListening(true)}
        onBlur={() => setIsListening(false)}
      />
      <div className="flex w-full gap-5">
        <div className="flex-1 items-center flex gap-5 justify-between">
          <span className="text-text-tertiary font-bold">
            {prev_questions_and_answers.length} / {totalQuestions}
          </span>

          <VoiceInputButton
            onVoiceStart={() => {
              setIsListening(true);
              startListening();
            }}
            onVoiceStop={() => {
              setIsListening(false);
              stopListening();
            }}
            isVoiceListening={isVoiceListening}
            disabled={isPending || !isInterviewStarted}
            mode={mode as InterviewMode}
          />
        </div>
    
  );
}
```
하지만 useSpeechRecognition은 기존에 이벤트리스너가 처음 등록되면서 시스템 오디오만 들어가고 마이크 오디오가 제대로 들어가지 않는 문제가 있어 위로 끌어올려 처음 '면접 시작' 버튼을 누르고 TTS 음성이 나온 이후에 마이크를 활성화시켜야 했다. 그렇게 된다면 결국 SpeechRecognition 훅은 더 상위 컴포넌트에서 조작하여 `useAudio` 훅을 사용하는 계층에서 end 이벤트에 달아줘야 하기 때문에 상위로 올라가야 할 필요성이 있었다.
하지만 이 과정에서 input의 setState를 콜백으로 넣기 때문에 결국 input value의 상태값도 위로 올라가야 하는 상황이 되었다.
그렇게 된다면 결국 상위 컴포넌트에서 다루는 모든 컴포넌트들이 계속 input 값이 업데이트될 때마다 리렌더링이 되어야 하는 문제가 있다. 