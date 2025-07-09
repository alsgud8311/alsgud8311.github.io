---
title: yarn berry의 zero-install을 먹자마자 뱉어버린 이유
created: 2025-05-26 17:15
updated: 2025-05-26 17:15
tags:
  - 프로젝트
  - yarn-berry
  - zero-install
categories:
  - 프로젝트
  - yarn
  - zero-install
  - 개발
aliases: 
description: ""
status: draft
---
## 개요
꼬꼬면 프로젝트를 모노레포로 구성하면서 이제까지 봐왔던 `yarn berry`의 `zero-install` 기능에 대해서 `나도 맛보고 싶다!` 라는 생각이 들었고, 이를 위해 `zero-install` 설정을 해주었었다. 하지만 정말 험난했던 과정을 거치면서 내가 투자한 비용 대비 zero-install이 가지는 장점이 너무 떨어진다고 생각했고, 내가 느낀점을 정리하기로 했다.
![](https://i.imgur.com/INYU9Zk.png)

## 맛보기(매운맛)
### yarn berry와 zero-install을 설정한 이유
이전에 올렸던 글에서도 설명했지만, `yarn classic`의 경우에는 `유령 의존성`과 성능 상의 문제가 있기 때문에 성능적으로 좋은 퍼포먼스를 보여주는 `pnpm`과 `yarn berry` 중에 선택해야겠다고 판단했고, `yarn berry`의 성능이 가장 우수함과 동시에 `javascript Map`을 사용해서 의존성을 관리하고 로드시킨다는 효율적인 방식이 신기해서 직접 다루어보고 싶은 마음도 있었다. 특히 `zero-install`은 `의존성 설치 없이 실행만 딸깍! 하면 된다고?` 라고 생각해서 흥미가 가지 않을 수 없었다.

![](https://i.imgur.com/tFn1gLr.png)

참고 : [[프로젝트 모노레포 구성하기]]

아무튼 이러한 이유들로, yarn을 패키지 매니저로 선택하면서 겸사겸사 `zero-install`도 맛봐보자! 했던게 문제의 발단이었다..

### 치료(물리)
yarn의 `zero-install`은 다른 단어로 비유하자면 `치료(물리)`에 딱 맞는다고 생각했다. 뭔가 무지막지한 느낌의...
zero-install의 핵심은 `.yarnrc.yml`과 `.gitignore`에 있다. 해당 yarn 프로젝트 설정 파일에서 `enableGlobalCache`의 값이 true일 경우에는 **자신의 홈 디렉토리** 안의 `.yarn/cache`에 설치하는 것이고,   false일 경우에는 **폴더 내** 안의 `.yarn/cache`에 설치하는 것이다. 한번 다운로드한 패키지는 글로벌 캐시에 두고 계속해서 캐시를 사용해서 중복되는 패키지를 재사용할 수 있다는 점에서 디스크 공간 절약과 설치 속도 향상 등의 효과를 기대할 수 있다. 그런데 이 설정을 끄게 되면 프로젝트의 루트에 모든 의존성을 설치하게 된다. 환경 자체를 프로젝트의 루트에 묶어둔다는 의미이다.

이러한 설정과 더불어 `gitignore` 파일에는
```
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions
```
을 놓아 아예 모든 환경 자체를 그대로 git에 올려버리는 것이 `zero-install`이다.

말그대로 의존성을 전부 올려버리는 방식이다.
![](https://i.imgur.com/VJs2Yub.png)
약간 이 느낌이 들기도 한다..

### 오히려 더 불편해진 DX
#### lfs 설정하는 비용
github에 의존성을 다 올려버리는 방식은 `그냥 올리면 되는거 아냐?`라고 생각했지만 그냥이라는 말이 쓰일 정도는 아니었다..
패키지 중에서는 100mb가 넘는 것들도 있는데, 원격 저장소에 push할 때는 100mb이상의 파일에서는 한번에 올라가지 않는다.

![](https://i.imgur.com/2RARaUG.png)
이런 오류를 터미널에서 볼 수 있을 것이다.

100mb이상의 파일들을 올릴 때는 git lfs(git large file storage)를 사용해야 한다.
![](https://i.imgur.com/JLYkDL0.png)
Git LFS는 실제 대용량 파일 자체를 Git 저장소에 직접 저장하는 대신, 해당 파일을 가리키는 작은 **텍스트 포인터 파일**을 생성한다. 이 포인터 파일에는 원본 파일의 해시값, 크기 등의 메타데이터가 포함된다.

이러한 파일들을 푸시 할 때, Git은 포인터 파일을 포함한 커밋 내역을 원격 Git 저장소로 푸시한다. Git LFS는 해당 포인터가 가리키는 실제 대용량 파일들을 별도의 원격 LFS 서버로 업로드되는 식이다.
문제는 EC2와 같은 곳에 인스턴스를 올리고 배포를 하는 식이라면, 인스턴스에서도 이를 받기 위해 lfs 설정을 해줘야 한다. 설정을 안하고 받아버리면 나처럼 체크섬이 변경되고 결국 아래처럼 처음부터 다시 설치해야 하는 대참사가 생길 가능성이 있다.
![](https://i.imgur.com/j7UXrZA.png)
무서운 빨간 글씨와 함께 쏟아지는 오류메시지....
에러를 읽어보면 예상했던 체크섬과 원격 저장소에서 가져온 것이 일치하지 않는다는 뜻이었다.

git lfs 자체가 대형 파일들에 대해서 실제 파일이 아닌 포인터 파일들만 클론하는 방식이기 때문이다.
```text
Git LFS creates a pointer file which acts as a reference to the actual file (which is stored somewhere else). GitHub manages this pointer file in your repository. When you clone the repository down, GitHub uses the pointer file as a map to go and find the large file for you.
```
읽어보면 git LFS는 실제 파일을 그대로 올려놓는 것이 아니라 100mb를 넘는 큰 파일들에 대해서는 이를 올리기 힘드니 이에 대한 참조 포인터만 올려놓는 방식이다. 그래서 일반적인 방식으로 git도 clone하게 되면, git에서 받는 파일은
```text
version https://git-lfs.github.com/spec/v1
oid sha256:4cac19622fc3a ... 8367b541f38b89102a3f1261ac81fd5bcb5
size 84977953
```
이와 같이 그냥 포인터 파일을 받기 떄문에 체크섬 검사에서 오류가 발생한 것이다.

이를 해결하기 위해서는 그냥 ec2에 lfs 깔고 활성화 시키면 된다.
```zsh
sudo apt update
sudo apt install git-lfs
git lfs install
git clone <내 레포>
cd <내 레포> && yarn install
```

암튼 이런 추가적인 설정을 하는 데에 대한 비용도 발생하면서, `굳이`의 영역임음 조금씩 깨닫기 시작했다.
#### 실제 비용은 생각도 못했지?
문제는 github에서 git LFS 대역폭은 무료 제한이 있고, 과금도 될 수 있다.

![](https://i.imgur.com/S6x2tXv.png)

~~돈...내야지?~~

![](https://i.imgur.com/uJVjTvW.png)

#### 어딘가 이상해진 줄건줘 메타 
`zero-install`이 큰 장점으로 떠올랐던 이유 중 하나는 CI에서 의존성을 설치하는 시간을 크게 절약할 수 있다는 점이었다. 
하지만 토스정도도 60-90초 정도가 걸린다고 했는데, 내 의존성 설치는 그것보다는 짧게 걸릴 것이다.
그런데 반대로 클론하는 시간이 이 시간보다 길어진다면? 결국 배보다 배꼽이 더 커진 셈이 된다.
아직 그정도는 아니지만 새롭게 받아온 의존성을 설치하는 시간 또한 무시할 수 없다. 그대로 변경된 파일만 추가적으로 가져온다고 하더라도 의존성을 가져오고 docker에 copy하는 시간까지 합하면 60초정도 되는 것 같다. 
![](https://i.imgur.com/yeR7Ooh.png)
근데 굳이 돈줘가면서 이렇게까지..? 라는 생각이 들면서 `굳이`라는 생각이 점점 커지기 시작했다.
#### install 안해도 됩니다(해야됨)
현재 환경에 대한 바이너리 정보를 가지고 동작해야 하는 의존성들은, install을 통해 따로 `unplugged`라는 디렉토리에서 의존성의 압축을 풀어 관리한다.

![](https://i.imgur.com/dbP7Fko.png)

내 경우에도 많은 것들이 현재 환경의 정보를 가지고 unplugged에 설치된 것을 볼 수 있다.
결국 `yarn install`은 필요한 경우가 있기 마련이고, 여기에 대한 시간까지 생각했더니 `굳이` 라는 생각은 곧 `돌리자` 라는 생각으로 바뀌었다.

## zero-install이 빛을 발하는 순간?
일반적인 프로젝트가 아닌, zero-install이 빛을 발하는 순간이 따로 있다.
### Offline mirror
![](https://i.imgur.com/m05nY19.png)

yarn의 cache 관련된 독스에 적힌 내용이다. 의존성이 불안전하게 설치되는 경우를 고려하여 이를 로컬 프로젝트에 묶어놓는다는 내용이다. 확실히 인터넷이 불안정하거나 속도가 느리다면 이러한 방식을 활용해서 안정적으로 프로젝트에서 쓰는 의존성들의 패키지를 가져올 수 있다.

하지만 이러한 의존성이 불안정하게 설치되는 경우가 웬만한 클라우드 환경에서는 드물게 일어나는 일이다. 하지만 zero-install이 가지는 이점은 또 하나 있다. 이러한 `offline mirror` 덕분에 의존성을 **외부에서 fetch하는 과정이 필요 없다**는 점이다. 이를 이해하기 위해서는 패키지 매니저의 작동 원리를 이해할 필요성이 있다.

### 패키지 매니저의 동작 방식
패키지 매니저는 `Resolution`, `Fetch`, `Link` 세 단게로 동작한다. 이에 대한 간단한 설명은 아래와 같다.
Resoultion
- 라이브러리 버전 고정
- 라이브러리의 다른 의존성 확인
- 라이브러리의 다른 의존성 버전 고정
Fetch
- 결정된 버전의 파일을 다운로드
Link
- 앞 두 단계를 거친 라이브러리를 소스코드에서 사용할 수 있는 환경을 제공 

여기서 fetch의 과정에서는 원격 레지스트리에서 인터넷을 통해 다운로드받게 되는데, 이 때 zero-install은 원격 레지스트리까지 가지 않고 로컬에 있는 캐시를 가져옴으로써 가지고 있는 의존성을 그대로 사용할 수 있다.
그렇기 때문에 **폐쇄적인 네트워크**와 같은 환경에서는 인터넷을 통해 가져오는 것이 어렵기 때문에 이렇게 의존성을 그대로 가져오는 것이다.

## 결론
zero-install을 사용할 수는 있지만, 어느정도 네트워크가 원할하고 폐쇄적인 네트워크에 프로젝트가 있는 것이 아니라면 굳이 `github lfs` 비용을 내가면서까지 해당 방식을 고수하는 것은 오버엔지니어링의 끝판왕이라고 생각했다. 따라서 나는 그냥 `zero-install`을 빼고 pnp만 사용하기로 결정했다.

비록 찍먹만 하고 바로 뱉어버렸긴 했지만, `zero-install`을 체험해보는 과정에서 많은 트러블 슈팅을 겪었고, 그 덕분에 많은 것들을 새롭게 알게 될 수 있었다.