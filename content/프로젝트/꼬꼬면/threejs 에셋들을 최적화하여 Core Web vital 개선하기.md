---
title: threejs 에셋들을 최적화하여 Core Web vital 개선하기
created: 2025-09-01 20:27
updated: 2025-09-01 20:27
tags: []
categories: []
aliases: []
description: ""
status: "draft" # draft, in-progress, completed
---
## 문제
우리의 서비스는 타 서비스들과 같이 랜딩 페이지에서 이탈하는 사람이 많았다.
![](https://i.imgur.com/rERcMvr.png)
모니터링 툴에서 보면 첫번째 페이지 -> 두번째 페이지로 가는 사람들의 수가 반 정도 사라지는 것을 볼 수 있다.
랜딩 페이지에는 CTA 버튼이 주요 진입 수단이었기 때문에, 사실상 대부분 면접 화면도 제대로 보지 않은 채로 떠난다는 의미이기도 하다. 추가적으로 세션 리플레이들을 보면 대부분의 사람들이 30초도 안되는 시간동안만 보고 떠나는 모습들을 볼 수 있었다.

![](https://i.imgur.com/ulA206b.png)
이에 CTA를 통해 진입하는 사람들을 조금이나마 더 늘리고자 이것저것 랜딩페이지를 개선하기 시작했다.
서비스에 대한 소개를 더 넣고, 추천사도 넣었으며, 무엇보다 처음에 사람들의 이목을 끌기 위해 3D 요소를 추가했다.

![](https://i.imgur.com/N5sc1SL.gif)


하지만 추가적으로 문제가 생긴 지점은 Threejs 에셋이 너무 크다는 점이었다.
![](https://i.imgur.com/wi6KACA.png)
랜딩에서 이목을 끌기 위해 추가한 에셋은 약 8.7MB라는 너무나도 큰 사이즈였고, 이는 곧 Core Web Vital 중 Performance의 급격한 감소로 이어졌다.

![](https://i.imgur.com/8xcThPt.png)
Ligthhouse CI 단계에서 Performance가 급격히 떨어지는걸 확인했고, 이를 개선할 필요성을 느꼈다.

## 1. GLB → GLTF 
가장 먼저 한 것은 GLB 파일에서 GLTF로의 변환이다. 

GLB(GL Transmission Format Binary)는 모든 리소스가 하나의 바이너리 파일에 포함된 형태이며, GLTF(GL Transmission Format)는 JSON 기반의 텍스트 형태로 외부 리소스를 참조하는 구조이다.
둘은 같은 형식이면서도 GLTF를 바이너리화 시킨 것이 GLB이기 때문에, 각각의 텍스처나 애니메이션 키프레임 최적화를 위해서는 이를 분리할 필요가 있었다.

그렇기 때문에 나는 미리 완성된 glb 파일을 gltf로 변환하고, 각 텍스처 이미지와 gltf 파일 자체를 최적화하는 방식을 생각했다. 
추가적으로 gltf로 변환한 다음, 각각의 요소들을 전부 최적화 한 다음에 다시 glb를 통해 다시금 바이너리로 묶어주려고 했다.

이는 8비트로 되어있는 바이너리가 Base64 6bit를 기준으로 변환되기 때문에 인코딩된 글자가 길어질 수밖에 없기 때문에 용량이 33%가 증가하게 될 것이고 이는 치명적일 것이다. 

또한 GLTF는 JSON 형식으로 되어 있기 때문에 해당 파일을 파싱하고, GLTF 안에 선언되어 있는 텍스처와 같은 외부 리소스를 가져오는 과정 또한 있기 때문에, 이로 인한 네트워크 비용 증가와 로딩 속도 증가 또한 불가피하다.

따라서 나는 GLB -> GLTF -> GLB의 과정을 통해 용량을 최대한 줄이려 했다. 현재는 일단 먼저 gltf 파일로 blender에서 변환을 진행했다. 
## 2. 텍스처 이미지 최적화 (JPG/PNG → WebP)
gltf로 export한 다음에는 텍스처 이미지에 대한 최적화를 진행했다. 다른 텍스처 파일들이 모두 jpg, png로 변환되었는데 이렇게 되어 있는 이미지들을 webp로 변환하였다. 

WebP 포맷의 이점으로는 
- PNG 대비 26% 더 작은 파일 크기 (무손실 압축)
- JPG 대비 25-35% 더 작은 파일 크기 (손실 압축)
- 알파 채널 지원으로 PNG 대체 가능
의 이점이 있기 때문에 더 작은 용량을 위해 webp로 변환해주었다. 

## 3. gltfpack을 이용한 모델 데이터 최적화
gltfpack은 C언어로 이루어진 메시 데이터 최적화 툴인 Meshoptimizer 기반의 GLTF 최적화 도구로, 메시 압축과 텍스처 최적화를 통해 파일 크기를 대폭 줄일 수 있다.

해당 툴을 통해 
- 정점 데이터 압축으로 파일 크기 감소
- 중복 정점 제거 및 인덱스 최적화
- 애니메이션 키프레임 압축
의 최적화를 이룰 수 있다.

```bash
// 라이브러리 설치
npm install -g gltfpack

gltfpack -i input.gltf -o output.gltf
```

![](https://i.imgur.com/Nl4ifpe.png)
이를 통해 기존의 경우 애니메이션 키프레임과 같은 데이터를 담은 bin과 gltf 파일이 합쳐서 약 3MB정도 되었는데,

![](https://i.imgur.com/lhTNTUs.png)
이제는 합쳐서 1.8MB 정도로 약 60%로 개선할 수 있었다. 


## 4. 다시 GLTF -> GLB로 변환하기
![](https://i.imgur.com/0XUqnMv.png)
GLTF로 변환된 모델 데이터를 다시금 GLB로 blender에서 export 하면서 최적화 옵션을 통해 추가적으로 최적화를 진행했고, 1.8MB -> 1.3MB로 다시금 약 70%의 용량으로 줄일 수 있었다. 

## 정리
3D 모델을 도입하면서 performance가 25정도까지 떨어지던 문제를 해결하기 위해 최적화를 진행했다.

최적화를 진행했던 부분들은 3D 에셋들에 대해서 
- 텍스처 이미지 최적화
- gltfpack을 이용한 모델 데이터 최적화(메시, 애니메이션 키프레임 등)
- 바이너리 파일로 재변환하면서 최적화
등의 방법을 통해 최적화를 진행하였고, 처음 8.3MB였던 glb 파일 크기를 1.3MB까지 약 85% 용량을 개선할 수 있었으며, Web vital 지표로 보면 Performance를 25에서 약 80까지 거의 320%를 개선할 수 있었다. 
![](https://i.imgur.com/eYb8xu9.png)
