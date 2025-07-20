---
title: Nextjs Build시 js heap out of memory 고치기
created: 2025-06-28 12:01
updated: 2025-06-28 12:01
tags:
  - 개발
  - 프로젝트
categories:
  - 개발
  - 프로젝트
aliases: 
description: ""
status: 작성중
---
## 문제
Nextjs 빌드를 하다가 힙 메모리 초과의 에러로 cd가 제대로 돌아가지 않았다.
![](https://i.imgur.com/uyoBqY3.png)
```
#11 167.9    Creating an optimized production build ...
#11 228.7 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (253kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
#11 305.0 
#11 305.0 <--- Last few GCs --->
#11 305.0 
#11 305.0 [26:0x773a1be6a000]   301008 ms: Mark-Compact (reduce) 457.7 (484.1) -> 447.8 (473.1) MB, pooled: 0 MB, 671.97 / 0.00 ms  (+ 0.0 ms in 0 steps since start of marking, biggest step 0.0 ms, walltime since start of marking 690 ms) (average mu = 0.270, curren
#11 305.0 
#11 305.0 <--- JS stacktrace --->
#11 305.0 
#11 305.0 FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
#11 305.0 ----- Native stack trace -----
#11 305.0 
#11 ERROR: process "/bin/sh -c yarn build" did not complete successfully: exit code: 129
```


## 문제 분석하기
로그를 한번씩 뜯어보자
1. `Serializing big strings (253kiB) impacts deserialization performance`
    - Webpack 캐시가 내부적으로 “253 KiB짜리 큰 문자열”을 직렬화했다는 경고입니다.
    - 이런 큰 문자열을 계속 처리하면 메모리 사용량이 크게 는다
    - 이것도 앞으로 해결해야 할 문제이지 않을까 싶다
2. **마지막 GC 로그**
    `Mark-Compact (reduce) 457.7 MB → 447.8 MB … Ineffective mark-compacts near heap limit`
    - V8(=Node.js 엔진)이 “Mark-Compact” 가비지 컬렉션을 반복했지만, 힙 상한 근처라서 충분히 메모리를 회수 못했음
- **FATAL ERROR: … JavaScript heap out of memory**
    - Node.js 프로세스가 더 이상 힙 메모리를 늘릴 수 없어서 강제 종료
    - Node.js의 기본 힙 한도는 대체로 `500MB` 정도라서 Webpack이 그 이상을 요구하면 터진다
	    - `node -e 'console.log(v8.getHeapStatistics().heap_size_limit/(1024*1024))'` 명령어로 현재 힙 메모리의 제한을 볼 수 있다. (MB단위)

이 문제는 먼저 힙 메모리가 얼마나 쓰이는 지를 알아야 한다.
힙 메모리를 추적하기가 쉽지 않지만, 다행히 next 15버전부터는 힙 메모리가 얼마나 쓰였는지 추적할 수 있는 커맨드 옵션을 제공한다.
```
next build --experimental-debug-memory-usage
```

```
   ***************************************
   Memory usage report at "Finished build":
    - RSS: 1640.28 MB
    - Heap Used: 659.31 MB
    - Heap Total Allocated: 917.22 MB
    - Heap Max: 4144.00 MB
    - Percentage Heap Used: 15.91%
   ***************************************

 ✓ Collecting page data    

   ***************************************
   Memory usage report at "Finished collecting page data":
    - RSS: 54.77 MB
    - Heap Used: 652.05 MB
    - Heap Total Allocated: 917.22 MB
    - Heap Max: 4144.00 MB
    - Percentage Heap Used: 15.73%
   ***************************************
   
Memory usage report:
    - Total time spent in GC: 792.17ms
    - Peak heap usage: 659.31 MB
    - Peak RSS usage: 1749.19 MB
```
실행 시키면 이런 식으로 사용량을 볼 수 있다.
로컬 내 환경에서는 heap을 이미 4gb정도로 설정해둔 상태이기 때문에 오류가 뜨지 않고 나오는 것을 볼 수 있지만, 내가 띄워놓은 ec2 t2.micro에서는 이를 설정해두지 않아 문제가 되었다. 

혹시나 상호 참조가 있는지도 다시 하나씩 훑어보면서 찾아봤는데, 상호참조도 없었기 때문에 최적화보다는 빠르게 메모리 문제만 해결하는 것이 우선이겠다고 판단했다.

빠르게 해결하는 방법은 두 가지 정도가 있다.
1. Node.js 힙메모리의 제한을 늘리기
2. 빌드 과정에서 next.js의 `experimental` 기능 사용하기

## 1. Node.js 힙메모리의 제한 늘리기 
```json
"scripts": {
  "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
}
```
이런 식으로 스크립트에 옵션을 달아놓으면 Nodejs의 힙메모리 제한을 늘릴 수 있다.


## Next.js의 experimental 기능 사용하기
Next.js 또한 이러한 문제를 인지하고 있었고, 점점 애플리케이션의 사이즈가 늘어날 수록 힙 메모리의 사이즈가 커지면서 이런 힙 메모리를 관리할 수 있는 방법에 대해 설명한다.

> 더 자세한 설명은 [여기](https://nextjs.org/docs/app/guides/memory-usage) 서 볼 수 있다.

### WebpackMemoryOptimizations
가장 중요한 부분은 next.config.ts에서 experimental 속성 중 15버전부터 `webpackMemoryOptimizations` 속성이 추가됐다는 부분이다.

`experimental` 기능이긴 하지만, 따로 `low-risk` 한 기능이라고 추가로 덧붙여놓은것을 보면 크게 문제될 부분은 많이 없는 것 같다.

![](https://i.imgur.com/StRNHCF.png)
옵션을 활성화하고 빌드해보니 정말 크게 힙 메모리가 줄어들은 것을 볼 수 있다.
덕분에 힙 메모리의 제한을 바꾸지 않고 속성 하나 바꿔서 문제 해결이 가능했다.

하지만 조금 힙 메모리를 조금씩 쓰기 위해 더 작은 단위로 분할해서 빌드 작업 처리를 하는 것으로 보이는데, 그만큼 빌드 시간은 상승한다. trade-off가 심한 것 같아 웬만한 리소스를 가진 곳이라면 최적화와 함께 node.js의 힙 메모리 제한을 늘리는게 최선이지 않을까..
### Webpack Build worker
웹팩 빌드 워커를 사용하면 별도의 Node.js 워커 내에서 Webpack 컴파일을 실행할 수 있기 때문에 빌드 중 애플리케이션 자체의 메모리 사용량이 줄어들게 된다.
### 정적 분석 스킵하기
```json
//next.config.ts
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
```
결국 정적 분석 도구들도 리소스를 잡아먹는 일이고, 모든 파일들을 보면서 규칙에 어긋나는지 하나하나 파싱하고 분석해야 한다.
이러한 정적 분석들은 개발 및 CI 단에서 끝나야 하는 것이라고 판단하여 나는 CI에서 돌린 다음에 빌드에서는 별도의 runner에서 실행하도록 해놨다. 

### serverSourceMaps
```json
{
	experimental: {
		serverSourceMaps:false
	}
}
```
이것도 `experimental` 기능 중 하나이다.
소스 맵은 번들된 JS ↔ 원본 코드 간의 매핑 파일로, 번들된 js는 이름이 바뀌는데 이에 따라서 소스코드를 추적할 수 있는 만큼, 개발 과정에서 쓰인다.
하지만 이러한 소스 맵의 경우 프로덕션 빌드가 소스맵이 나오게 된다면, 보안에도 좋지 않기도 하고 추가적으로 리소스 소모하는 작업이기 때문에 false 처리해도 빌드 성능은 조금 좋아진다.

## 결론
- 웬만큼 리소스가 사용할 수 있는 정도가 있다면 Nodejs의 힙 메모리 제한을 늘리자
- 살짝 빠듯하다면 차라리 빌드 시간을 늘리는 대신 `WebpackMemoryOptimizations` 기능을 사용하면서 빌드를 최적화하는 여러 방법들을 많이 찾아나가자
