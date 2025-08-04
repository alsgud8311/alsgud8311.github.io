---
title: speech recognition 폴리필의 문제와 해결하기
created: 2025-07-31 16:25
updated: 2025-07-31 16:25
tags:
  - 개발
  - 작성중
categories: 
aliases: 
description: ""
status: draft
---


## 개요
`Speech Recognition Web API`를 사용해서 꼬꼬면의 웹은 마이크를 통해 인터뷰를 진행할 수 있게끔 하여 실제 음성으로도 정리해서 말할 수 있는 연습을 할 수 있도록 구현하였다.

하지만 이를 웹뷰로 다시금 만드는 과정에서 브라우저의 버전을 고려할 필요가 있었는데, 대부분의 브라우저 버전에서는 최신이 아닌 이상 `Speech Recognition Web API` 가 지원을 제대로 안한 상태이기 때문에 폴리필을 통해서 구현을 하던지, 아니면 다른 방법을 찾아야 했다. 
## 브라우저 버전을 고려해야 하는 이유
그렇다면 왜 브라우저 버전을 고려해야 할까? 그리고 왜 이런 고민을 웹에서는 많이 하지 않았을까?

대부분의 모던 브라우저들은 에버그린 브라우저 방식을 사용하여 브라우저의 버전을 관리한다. 

> 에버그린 브라우저란?
> 에버그린 브라우저(Evergreen Browser)는 사용자가 별도로 업데이트를 신경 쓰지 않아도, 브라우저가 자동으로 최신 버전으로 유지되는 웹 브라우저. 즉, 보안 패치, 새로운 웹 표준, 기능 개선 등이 자동으로 적용되어 항상 최신 상태를 유지함

하지만 이게 제대로 적용되지 않는 경우가 있는데, 바로 웹뷰이다. 

React Native WebView에서 iOS 플랫폼은 내부적으로 [WKWebView](https://developer.apple.com/documentation/webkit/wkwebview)를 사용한다. WKWebView는 iOS에 내장된 웹 엔진(WebKit)을 기반으로 동작하며, 이 엔진은 사용자의 iOS 버전에 따라 업데이트된다. 즉, iOS 시스템 업데이트를 통해서만 WebKit이 최신으로 유지되며, 데스크톱의 Safari처럼 별도로 자동 업데이트되는 에버그린 브라우저가 아니기 때문에 웹뷰의 버전은 사용자의 운영체제 버전에 따라 각기 달라질 수 있다. 따라서 내가 어느정도의 브라우저를 최소 범위로 잡고 개발을 할 것인지 각 버전을 명시해야 한다. 

## 폴리필을 선택하지 않은 이유
폴리필을 검색했을 때 가장 먼저 나오는 폴리필은 [speechly라는 서비스에서 제공하는 폴리필 라이브러리이다.](https://github.com/speechly/speech-recognition-polyfill?tab=readme-ov-file#readme)

하지만 해당 폴리필 라이브러리의 경우 2년 전이 마지막 업데이트이기도 했고, 유지보수가 제대로 안되고 있다는 점과 해당 API를 사용한다면 결국 서비스의 API를 호출하여 기존의 SpeechRecognition을 수행하게 되는데, 이 경우 API에 의존하는 형태이기 때문에 계속해서 이용하면서 유지보수하는 것은 무리가 있겠다고 판단했다.

또한 추가적으로 폴리필을 사용하면 결국 기존에 지원하지 않는 API를 사용하기 위해 구현체를 추가해야 하면서 번들의 크기가 커진다는 점도 마음에 걸렸다. 번들의 사이즈를 최대한 작게 해서 최대한 레이턴시를 줄여야 앱 안에서 작동하는 웹뷰가 사용자 경험에 긍정적으로 영향이 갈 것이라 생각했다.

## 네이티브를 활용해보면 어떨까 🤔
네이티브에 라이브러리를 설치하게 되면 해당 애플리케이션을 설치할 때 빌드에 해당 라이브러리가 함께 들어가기 때문에 웹뷰의 번들 크기를 줄이지 않고 초반 설치 사이즈만 늘리면 된다. 초반 사이즈가 커지는 문제는 현재 스마트폰의 용량이 크기도 하고, 그렇다고 기하급수적으로 증가하는 것도 아니기 때문에 레이턴시를 줄임으로써 가지는 이득이 더 크다고 판단했다.

따라서 React-native 쪽에서 음성 인식 관련 기능을 추가하고, 음성이 입력되면 이에 대해서 recognition한 후 나온 결과물을 웹뷰 쪽으로 브릿지를 통해 메시지를 전달하고, 웹뷰에서 이를 받아 처리할 수 있도록 해주는 방식을 생각하게 되었다. 
## Expo-Speech-Recognition 활용하기
네이티브에서의 음성 인식은 [Expo-Speech-Recognition](https://github.com/jamsch/expo-speech-recognition)이라는 라이브러리를 활용했다.

Expo Docs에서는 보이지 않는 것으로 보아, 정식으로 채택된 라이브러리는 아직 아니지만 활발하게 유지보수가 되고 있다는 점과 Expo SDK와도 호환이 되며, 이벤트 기반으로 쉽게 관리할 수 있으면서도 구현체를 보니 각 운영체제에서 지원하는 프레임워크(ios의 AVFoundation, Speech 등)을 이용하여 구현된 것으로 보아 `Speech Recognition Web API`와 같이 유지보수와 기능이 보장되어 있으면서도 최소 버전 또한 요구사항에 맞게 낮은 버전부터 지원을 했기 때문에 사용하게 되었다.

## 네이티브 <-> 웹뷰 사이에서 음성인식 처리하기
네이티브와 웹뷰 사이에서 음성인식한 결과를 전해주고 처리하기 위해서는 양쪽에서의 처리가 필요하다

### RN
리액트 네이티브에서는 각 Speech Recognition을 실행하고 이에 따라 처리할 수 있는 로직을 받을 수 있도록 커스텀 훅을 만들어 주었다.

```ts
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useState } from "react";
import { Platform } from "react-native";

export default function useSpeechRecognition({
  onStart,
  onEnd,
  onResult,
  onError,
  abortOnError = false,
}: {
  onStart?: () => void;
  onEnd?: () => void;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  abortOnError?: boolean;
}) {
  const [isListening, setIsListening] = useState(false);

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    onStart?.();
  });
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    onEnd?.();
  });

  useSpeechRecognitionEvent("result", (event) => {
    onResult?.(event.results[0]?.transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    onError?.(event.error);
    if (abortOnError) {
      ExpoSpeechRecognitionModule.abort();
    }
  });

  const handleStart = async () => {
    const microphonePermissions =
      await ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync();
    if (!microphonePermissions.granted) {
      alert("마이크 허용을 해야 인터뷰 내 마이크 인식이 가능합니다.");
      return;
    }

    if (Platform.OS === "ios") {
      const speechRecognizerPermissions =
        await ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync();
      if (!speechRecognizerPermissions.granted) {
        if (speechRecognizerPermissions.restricted) {
          alert("음성 인식 권한이 제한되었습니다.");
        } else {
          alert("음성 인식 권한이 없습니다.");
        }
        return;
      }
    }
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "ko-KR",
      interimResults: true,
      continuous: true,
      requiresOnDeviceRecognition: Platform.OS === "ios",
    });
  };

  const handleStop = async () => {
    setIsListening(false);
    ExpoSpeechRecognitionModule.stop();
  };

  return {
    handleStart,
    handleStop,
    isListening,
  };
}
```

그리고 사용할 때는 
```tsx
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";

export default function InterviewMainScreen() {
  const webviewRef = useRef<WebView>(null);
  const runFirst = `
      window.isNativeApp = true;
      true;
    `;

  const { handleStart, handleStop } = useSpeechRecognition({
    onResult: (transcript) => {
      webviewRef.current?.postMessage(
        JSON.stringify({
          type: "speechRecognitionResult",
          data: transcript,
        }),
      );
    },
  });
  const handleMessage = (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === "startListening") {
      console.log("startListening");
      handleStart();
    } else if (data.type === "stopListening") {
      console.log("stopListening");
      handleStop();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "position", android: undefined })}
          enabled
          keyboardVerticalOffset={-300}
          contentContainerStyle={{ flex: 1 }}
          style={{ flex: 1 }}
        >
          <WebView
            ref={webviewRef as any}
            source={{ uri: `uri 입력` }}
            javaScriptEnabled={true}
            injectedJavaScriptBeforeContentLoaded={runFirst}
            webviewDebuggingEnabled
            onMessage={handleMessage}
            style={{ flex: 1 }}
            setBuiltInZoomControls={false}
            domStorageEnabled={true}
            setDisplayZoomControls={false}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

```
이런 식으로 interimResult 옵션을 넣어주면 음성인식 중에서도 인식된 결과를 받아서 브릿지를 통해 네이티브에서 웹뷰로 전송할 수 있다.

주의할 점은 처음 웹뷰가 로드됐을 때 `injectJavascript` 로 `isNativeApp = true` 를 주입시키지 않으면 제대로 웹뷰 인식이 되지 않아 브릿지를 통해 메시지를 주고받을 수 있는 메소드가 웹뷰쪽에서 주입되지 않기 때문에 주의해야 한다(나도 이거때문에 한참 헤맸었다).

### 웹뷰
웹뷰에서도 음성인식 버튼을 눌렀을 때와 정지를 눌렀을 때, 네이티브에서 해당 상태를 감지하고 이에 따라 음성 인식을 활성화해야 했고, 또 음성 인식에 대한 결과를 받아와서 렌더링시켜줘야 했으므로 이에 대해 처리를 해줘야 했다.
따라서 웹뷰도 웹뷰를 위한 커스텀 훅을 만들어주었다.
```tsx
import { WebviewMessage } from "@kokomen/types";
import { useEffect, useState } from "react";

export default function useSpeechRecognition(
  // eslint-disable-next-line no-unused-vars
  callback: (result: string) => void
): {
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  isSupported: boolean;
} {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);

// 처음에 해당 웹뷰에서 ReactNativeWebview가 있는지를 검사하여 브릿지가 제대로 연결되었는지를 확인한다.
  useEffect(() => {
    if (typeof window !== "undefined" && window.ReactNativeWebView) {
      setIsSupported(true);
    }
  }, []);

  const startListening = (): void => {
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({
        type: "startListening"
      })
    );
    setIsListening(true);
  };

  const stopListening = (): void => {
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({
        type: "stopListening"
      })
    );
    setIsListening(false);
  };

//네이티브로부터 받은 메시지를 제대로 처리할 수 있도록 이벤트를 등록한다
  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      const data = JSON.parse(event.data) as WebviewMessage;
      if (data.type === "speechRecognitionResult" && data.result)
        callback(data.result);
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [callback]);

  return {
    startListening,
    stopListening,
    isListening,
    isSupported
  };
}

```
이런 식으로 이벤트 리스너를 등록하고 이에 따라 웹뷰에서 처리하도록 함으로써 네이티브 <-> 웹뷰 간의 통신이 원할하게 이루어질 수 있었다.

또한 네이티브가 보내거나 웹뷰가 보내는 각 메시지에 대해서 따로 타입을 정의해놔 