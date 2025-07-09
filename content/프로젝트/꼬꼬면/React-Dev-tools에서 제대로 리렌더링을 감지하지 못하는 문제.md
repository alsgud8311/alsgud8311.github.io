---
title: React-Dev-tools에서 제대로 리렌더링을 감지하지 못하는 문제
created: 2025-07-04 01:41
updated: 2025-07-04 01:41
tags:
  - React
  - React-dev-tools
categories: 
aliases: 
description: ""
status: draft
---
## 리렌더링 감지 문제
평소처럼 렌더링 최적화를 하다가.. 이상한걸 발견해버렸다.

![](https://i.imgur.com/1cZJT7f.gif)
최적화를 진행해서 리렌더링이 form쪽에서만 발생할 수 있도록 만들었는데, 이상하게 전체가 다시 리렌더링 되는 듯한 느낌으로 익스템션이 동작하고 있었다.

리렌더링 되는 조건 다 따져가면서 컴포넌트를 나눴고, 콘솔 찍힌 것도 분명 리렌더링이 일어난 컴포넌트만 찍힌다. 따라서 익스텐션이 잘못된 것으로 생각하고 issue들을 찾아봤더니


![](https://i.imgur.com/mJuUL51.png)
누가 벌써 제보하고 해결책까지 나온 상태였다.

결론부터 말하자면 React-dev-tools가 **DOM 요소들을 기본적으로 필터링해서 숨기는데, 이 때문에 컴포넌트 리렌더링 분석이 부정확하게 표시될 수 있다**는 것이다.

![](https://i.imgur.com/u97lKuT.png)
Dev-tools 설정에서도 디폴트로 DOM 노드들에 대해서 div 영역들은 숨기는 것으로 되어 있다.
그렇기 때문에 이 과정에서 리렌더링 분석이 잘못 일어났고, 이에 따라 부모 컴포넌트가 리렌더링 되는 것으로 취급되었다. 

![](https://i.imgur.com/nmm7klh.png)
실제로 profiler를 통해 리렌더링을 분석했을 때에도 부모 컴포넌트가 리렌더링됨에 따라 렌더링되었다고 나와있다. 

## 해결
따라서 그냥 설정에서 저 Dom node들을 숨기는 설정을 지우면 원래대로 동작한다. 

![](https://i.imgur.com/onj9XgB.png)

div와 같은 html 요소들을 아예 필터링 해버리면 애초에 리렌더링 하는 과정에서 잡을 때 부모 컨테이너를 제대로 못볼 것 같은데..흠 시간 남을 때 extenstion을 한번 뜯어봐야 겠다.
