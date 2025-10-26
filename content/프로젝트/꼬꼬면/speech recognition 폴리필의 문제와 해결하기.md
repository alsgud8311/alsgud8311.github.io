---
title: speech recognition 폴리필의 문제와 해결하기
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
updated: <% tp.date.now("YYYY-MM-DD HH:mm") %>
tags:
  - 개발
  - 작성중
categories:
aliases:
description: ""
status: draft
---


## 문제
꼬꼬면의 웹버전은 `Speech Recognition Web API`를 사용해서 마이크를 통해 인터뷰를 진행할 수 있게끔 하여 실제 음성으로도 정리해서 말할 수 있는 연습을 할 수 있도록 구현하였다.

하지만 이를 웹뷰로 다시금 만드는 과정에서 브라우저의 버전을 고려할 필요가 있었는데, 내가 지원 대상 기기로 삼은 IOS 13버전 이상에서는 `Speech Recognition Web API` 가 지원을 제대로 안한 상태였다.
최대한 사용할 수 있는 범위를 늘리려 IOS 13까지 지원범위로 하긴 했지만, 사실 14.5버전부터 Speech Recognition을 지원했기 때문에 14.5 버전 이상으로 `build target` 을 잡고 빌드하더라도 13버전의 점유율이 거의 없기 때문에 문제 될 것은 없다고 생각했다.
하지만 그럼에도 따로 대안이 필요하다고 느꼈던 이유는 `Speech Recognition Web API` 일부는 네트워크를 통해 서버에서 음성 인식 결과를 받는 경우도 있기 때문에, 네트워크가 유실되면 그대로 진행할 수 없는 상태가 됐었다. 이에 온디바이스 모듈을 사용하여 받을 수도 있기 때문에 이러한 네트워크 유실에 대한 위험성이 더 떨어져 네이티브 모듈을 활용하여 각 웹뷰에서 조작하기보다는 네이티브 모듈을 통해 조작하는 방식으로 개선을 결정했다. 
## 브라우저 버전을 고려해야 하는 이유
그렇다면 왜 브라우저 버전을 고려해야 할까? 그리고 왜 이런 고민을 웹에서는 많이 하지 않았을까?

대부분의 모던 브라우저들은 에버그린 브라우저 방식을 사용하여 브라우저의 버전을 관리한다. 

> 에버그린 브라우저란?
> 에버그린 브라우저(Evergreen Browser)는 사용자가 별도로 업데이트를 신경 쓰지 않아도, 브라우저가 자동으로 최신 버전으로 유지되는 웹 브라우저. 즉, 보안 패치, 새로운 웹 표준, 기능 개선 등이 자동으로 적용되어 항상 최신 상태를 유지함

하지만 이게 제대로 적용되지 않는 경우가 있는데, 바로 웹뷰이다. 

React Native WebView에서 iOS 플랫폼은 내부적으로 [WKWebView](https://developer.apple.com/documentation/webkit/wkwebview)를 사용한다. WKWebView는 iOS에 내장된 웹 엔진(WebKit)을 기반으로 동작하며, 이 엔진은 사용자의 iOS 버전에 따라 업데이트된다. 즉, iOS 시스템 업데이트를 통해서만 WebKit이 최신으로 유지되며, 데스크톱의 Safari처럼 별도로 자동 업데이트되는 에버그린 브라우저가 아니기 때문에 웹뷰의 버전은 사용자의 운영체제 버전에 따라 각기 달라질 수 있다. 따라서 내가 어느정도의 브라우저를 최소 범위로 잡고 개발을 할 것인지 각 버전을 명시해야 한다. 

## 폴리필과 필요성  
가장 먼저 폴리필이 뭔지에 대해서 이해해야만 이후의 흐름을 이해할 수 있을 것 같아 설명을 추가한다.
폴리필은 브라우저가 지원하지 않는 최신 웹 API나 언어 기능을 메꿔주는 작은 스크립트이다. 예를 들어, **Promise**, **fetch**, **Array.from** 같은 기능은 사실 현대 브라우저에서는 당연히 사용이 되기 때문에 아무 의심 없이 사용할 수 있다. 하지만 이러한 기본적인 ES6의 기능마저도 제대로 동작하지 않는 브라우저 또한 있기 마련이다. 예를 들면 IE라던가 IE라던가 IE라던가...
![](https://i.imgur.com/pz7zbDs.png)
하지만 그럼에도 개발자는 사용자가 어떤 브라우저로 진입하든지 같은 사용자 경험을 제공할 수 있도록 최선을 다해야 한다. 그렇기에 구형 환경에서도 동일한 인터페이스로 사용할 수 있게 구현한 코드가 바로 **폴리필**이다. 런타임에 글로벌 객체를 보강하거나, 원본과 동일한 동작을 흉내 내며 개발자가 최신 문법과 API를 그대로 작성할 수 있게 해주는 것이다. 

브라우저가 발달하면서 각 API들의 baseline이 조금씩 달라지자 이러한 폴리필은 프론트엔드 개발자로서 신경써야 하는 요소가 되었다. [vite와 같은 빌드 도구 또한 plugin을 통해 이러한 폴리필을 관리할 수 있도록 하였다.](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

지금 나의 상황도 이와 같다. SpeechRecognition은 대부분 브라우저를 관리하는 주체(크롬이면 구글, safari면 애플 등)가 클라우드 서버를 통해 STT를 Web API로 제공하도록 하는데, 일반 사파리에 들어가는 웹뷰와 우리가 사용하는 사파리의 브라우저 버전은 명확히 구분되어 있으며, 해당 브라우저의 버전은 대부분 IOS의 버전을 따라간다.


![](https://i.imgur.com/AZk32Jy.png)
그렇기 떄문에 이와 같이 14이하의 버전을 사용하는 사람들에게는 제대로 Web API가 동작하지 않을 수도 있기 때문에 폴리필을 찾게 된다. 하지만 **나는 여기서 Web API에 대해 폴리필을 적용하지 않는 방향으로 결정하게 되었다.**

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

### RN에서의 처리
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
이런 식으로 이벤트 기반으로 메시지를 받고 이에 대해 분기처리를 해줌으로써 각 이벤트 타입에 맞춰 처리할 수 있다.

주의할 점은 처음 웹뷰가 로드됐을 때 `injectJavascript` 로 `isNativeApp = true` 를 주입시키지 않으면 제대로 웹뷰 인식이 되지 않아 브릿지를 통해 메시지를 주고받을 수 있는 메소드가 웹뷰쪽에서 주입되지 않기 때문에 주의해야 한다(나도 이거때문에 한참 헤맸었다).

### 웹뷰에의 처리
웹뷰에서도 음성인식 버튼을 눌렀을 때와 정지를 눌렀을 때, 네이티브에서 해당 상태를 감지하고 이에 따라 음성 인식을 활성화해야 했고, 또 음성 인식에 대한 결과를 받아와서 렌더링시켜줘야 했으므로 이에 대해 처리를 해줘야 했다.
따라서 웹뷰도 웹뷰를 위한 커스텀 훅을 만들어주었다.

```tsx
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
  // MessageMessage 타입은 따로 정의한 타입이다.
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

이런 식으로 이벤트 리스너를 등록하고 이에 따라 웹뷰에서 처리하도록 함으로써 네이티브 <-> 웹뷰 간의 통신이 원할하게 이루어질 수 있도록 하였다.

![](https://i.imgur.com/4PCB2O8.png)

하지만 이런 메시지 교환 구조를 만드는 과정에서 React Native 자체의 환경과 브라우저의 환경이 서로 다르기 때문에 직렬화를 시켜서 보내야 하는데,  `JSON.stringify` 를 해서 보내고 다시 파싱하는 과정에서 여러 가지 이벤트가 하나의 message 이벤트로 오기 때문에 타입에 대해서 안전하게 처리를 할 필요성을 느꼈다. 그렇지 않으면 휴먼 에러가 나올 가능성이 높기 때문임과 동시에 이벤트가 많아질수록 관리하기 어려워지기 때문이다. 따라서 파싱한 JSON에 대해서도 타입 단언을 통해 타입을 고정하고 이에 대해서 분기처리로 각 메시지 타입에 대해서 type-safe하게 관리할 수 있도록 했다.

