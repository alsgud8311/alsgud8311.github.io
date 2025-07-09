# 체크포인트

## 설계 전 프로세스 관리 모델 학습

- 스택 영역
- 힙 영역
- 텍스트 영역
- 글로벌변수 GVAR

## 함수 설계 및 정리

- 스택 영역
- 힙 영역
- 텍스트 영역
- GVAR 영역

# 프로세스 메모리 구조

![https://i.imgur.com/ZxcILSe.png](https://i.imgur.com/ZxcILSe.png)


## 스택 영역

- 프로그램이 자동으로 사용하는 영역으로, 호출된 함수의 수행을 마치고 복귀할 주소 및 데이터(지역변수, 매개변수, 리턴값 등)를 임시로 저장하는 공간
- 프로세스가 메모리에 로드될 때 스택 사이즈는 고정되며 함수 호출 시 생성되고, 함수 반환 시 소멸
- 스택사이즈가 고정이므로 재귀함수가 너무 깊거나, 함수 지역변수가 메모리를 초과하면 Stack Overflow가 발생
- 영역이름대로 스택 자료구조를 사용하여 LIFO(후입선출)의 형식이다.
- 명령 실행 시 자동으로 증가 또는 감소하기 때문에 보통 메모리의 마지막 번지를 지정한다
- data, stack 영역의 크기를 계산해 메모리 영역을 결정

## 힙 영역

- 프로그래머가 필요할 때마다 사용하는 동적인 영역
- 런타입에 크기 결정
- 메모리 주소 값에 의해서만 참조되고 사용됨
- 위의 스택과 같은 공간을 공유하며, 힙이 낮은 주소부터 할당되는데 각 영역이 상대공간을 침범하면 Stack Overflow, Heap Overflow가 발생한다.
- stack 에서 변수 할당 -> pointer가 가리키는 heap 영역의 임의의 공간부터 원하는 크기만큼 할당해 사용
- 힙 영역은 메모리의 **낮은 주소에서 높은 주소**의 방향으로 할당
- 더 이상 해당 힙 영역을 참조하는 변수가 없을 경우 소멸되며, free() 함수로 나중에 할당했던 영역을 반납해야 한다.

## 데이터 영역

- 전역변수, 정적변수, 배열과 같은 구조체 등이 저장되는 공간
- BSS영역과 GVAR영역으로 나뉨
    - BSS영역
        - 초기화되지 않은 데이터 저장되는 영역
    - BVAR
        - 초기화된 데이터가 저장되는 영역

## 텍스트 영역

- 코드 영역이라고도 불리며, 말그대로 코드가 저장되는 공간
- 사용자가 작성한 프로그램 코드가 CPU에서 수행할 수 있는 기계어 명령 형태로 변환되어 저장되어 있음
- 컴파일 타임에 결정되고 중간에 코드를 바꿀 수 없게 Read-only로 되어있음


## 프로그램 영역

- **STACK 영역 (512KB) :** 어셈블리 코드를 실행하면서 호출할 때마다 필요한 값을 스택 방식으로 Push하거나 Pop하는 영역 ◦ 0x00000 부터 0x7FFFF 까지
    - 상수로 1024 * 512 = 524,288 을 할당해놓고 만약 스택의 length가 이를 넘으면 stackoverflow 에러 추가
- **HEAP 영역 (512KB) :** 어셈블리 코드를 실행하면서 메모리 할당 요청이 있을 때 사용할 공간을 확보하는 영역 ◦ 0x80000 부터 0x100000
- **TEXT 영역 (문자열배열) :** 입력으로 주어지는 어셈블리 코드가 저장되는 영역 ◦ 0x100000부터 명령어 한 줄(배열 인덱스 1개)이 4바이트씩이라고 가정한다.
    - int32Array가 각 요소를 4바이트로 잘라서 저장하므로 한 요소에 명령어 한줄이 있으면 된다.
    - 참조할 때도(포인터를 쓸 때도) 4바이트 기준으로 하면 된다.

**다음과 같이 동작하는 함수를 포함하는 `Simulator` 객체를 구현한다.**

- **TEXT, STACK, HEAP 영역은 크기에 맞게 미리 할당한다.**
- **TEXT 영역에서 몇 번째 명령을 실행중인지 `PC(Program Counter)` 변수를 사용한다.**
- **STACK 영역을 위해서 `Stack Pointer`변수를 두고 관리한다.HEAP 영역을 관리하는 방식은 스스로 판단한다.**
- **이번 미션에서는 일반적인 프로세스 메모리 모델(배경 지식 참조)중에서 텍스트, 스택과 힙 영역을 위주로 구현한다. 다른 영역은 무시한다.**

[Int32Array - JavaScript | MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Int32Array)

# 예시 분석을 통한 이해

```jsx
setSize("INT", 4)
setSize("BOOL", 1)
locate("main", ["VAR A: BOOL[4]", "VAR B: INT", "CALL foo()", "SET B=$RETURN"])
locate("foo", ["VAR K: INT", "RETURN 10"])
step()
usage()
step()
step()
heapdump()
step()
callstack()
step()
gabageCollect()
reset()
```
- setSIze(”INT”,4)
    - simulator.types[’INT’] =4
- setSize("BOOL", 1)
    - simulator.types[’BOOL’] = 1
- locate("main", ["VAR A: BOOL[4]", "VAR B: INT", "CALL foo()", "SET B=$RETURN"])
    
    ```jsx
    let Text = {
       codes: ["VAR A: BOOL[4]", "VAR B: INT", "CALL foo()", "SET B=$RETURN"],
       functions: [
            {
            name: main,
            variant:{
    	        A : INT,
    	        B: INT
            }
            최종위치: 4
            }
         }
      ]
    }
    ```
    
- locate("foo", ["VAR K: INT", "RETURN 10"])
    

```jsx
let Text = {
   codes: ["VAR A: BOOL[4]", "VAR B: INT", "CALL foo()", "SET B=$RETURN",
   "VAR K: INT", "RETURN 10" ],
   pc: 0, //몇번째 명령 실행중인지
   functions: [
        {
        name: main,
        variant:{
	        A: BOOL,
	        B: INT
        }
        최종위치: 4
        }, {
	      name: foo,
	      variant : {
		      K: INT
	      }
	     }
     }
  ]
}
```

- **step()**
    - pc주소에 있는 코드 실행(PC 초기값인 0) → Text.codes[pc]를 실행
    - `VAR A: BOOL[4]` 파싱해서 → malloc(BOOL, 4)를 실행
    - BOOL 1 → 패딩 붙여서 8로 바꾸고 → 8*4 = 32 → HeapLoc + 32 = 32
        
        ```jsx
        let info = {
        	type: BOOL, // 타입
        	address: HeapLoc(= 0), // 힙에서의 주소
        	allocatedLength:32, // 할당된 길이
        	sp: 0 // 연결된 stackPointer
        }
        ```
        
    - heap.heapMemory.push(info)
    - stack.locMemory.push(info.address)
    - stack.stackPointer += 1
    - text.px++
        
- **usage()**
    
    - 스택 영역 전체크기, 사용중인 용량, 남은 용량과 힙 영역 전체크기, 사용중인 용량, 남은 용량을 순서대로 배열로 리턴
    - [stack.max, stack.locMemory.length *4, stack.remain, heap.max, heap.heapLoc, heap.remain]
- **step()**
    - Text.codes[pc]를 실행 → `VAR B: INT`
    - malloc(INT, 1)
    - INT 4 ⇒ 패딩 붙여서 8로 바꿈 → HeapLoc + 8 = 40
        
        ```jsx
        let info = {
        	type: INT, // 타입
        	address: HeapLoc, // 힙에서의 주소
        	allocatedLength: 40, // 할당된 길이
        	sp: 1 // 연결된 stackPointer
        }
        ```
        
    - stack.locMemory.push(40) ⇒ `stack = [34, 40]`
    - stack.stackPointer += 1 ⇒ 2
    - text.px ++
        
- **step()**
    - Text.codes[pc]를 실행 → `CALL foo()`
    - CALL ⇒ 마지막 PC를 스택에 push
    - 마지막 pc = 2를 스택에 push → `stack = [34, 40, 2]`, `stackPointer = 3`
    - FuncName에 해당하는 함수 주소로 PC를 옮기고 실행
        - PC = foo의 주소로
        - VAR K: INT → malloc(INT, 1) → `Heaploc + 8 = 48` → `stack = [34, 40, 48]` → `stackPointer = 4`
    - 호출에 대해 기록하고 callstack()에서 활용한다.
        - 호출에 대해 기록?????????
- **heapdump()**
    
    - 힙에 있는 상태를 문자열 배열로 표현해서 return
        
    - 힙 영역 정보는 타입과 주소, **할당한 길이**, 해당 주소를 참조하는 스택 포인터 변수 정보도 포함한다.
        
    - 힙 영역 정보?
        
        - **타입과 주소**
        - **할당한 길이**
        - **해당 주소를 참조하는 스택 포인터 변수 정보**
        
        스택은 메서드와 함수 프레임, 원시 값, 객체 포인터를 포함한 정적 데이터가 저장되는 곳이다
        


![](https://i.imgur.com/iSKRKjq.png)

# 함수 및 데이터구조 설계
## Simulator 객체

```jsx
let Simulator = {
		pointer : 0,
		types : {
			boolean: 4
		},
		pc:,
    text : {
	    codes: [코드들],
	    functions: [
		    {
			    이름: 함수이름,
			    최종위치: codes에서의 최종위치
		    }
	    ]
    }
};

const setSize = (type, length) => {
    Simulator[type] = length;
}

```

## Text 객체

```jsx
let Text = {
   codes: ["VAR A: INT", "VAR B: INT", "CALL foo()", "SET B=$RETURN"]
    functions: [
        {
        name: main,
        address: 0x100000
        } , {
       name: ‘foo’,
       address : 0x100000 + (4 * 4)
     }
  ]
}
    

```

## Heap 객체

```jsx
let heap = {
	max: 1024 * 512,
	heapLoc: 0,
	get remain() {
		return this.max - this.locMemory.length
	},
	heapMemory: [{
	{ 
		할당된 길이: 32
		type: BOOL
		address: heapLoc + mallocByte (힙 주소)
		sp: 0
		value: null
		}
},]
}
```

## Stack 객체

```jsx
let stack = {
	max: 1024 * 512,
	locMemory : Int32Array(),
	stackPointer = 0,
	get remain() {
		return this.max - this.locMemory.length
	}
}
```

![](https://i.imgur.com/FFWTDWg.png)

![](https://i.imgur.com/YNVUNUB.png)

![](https://i.imgur.com/f0bMxQb.png)

![](https://i.imgur.com/uQz7Gfi.png)

![](https://i.imgur.com/98jKkcy.png)

![](https://i.imgur.com/u3QQGXX.png)

![](https://i.imgur.com/NogyUSz.png)

![](https://i.imgur.com/mtvdIRH.png)

![](https://i.imgur.com/SB9BG1j.png)

![](https://i.imgur.com/YzCvN7S.png)

![](https://i.imgur.com/65Cx3UC.png)
![](https://i.imgur.com/BZSYiDd.png)
개발자 원칙 P38  "동기를 관리할 때 또 신경써야 하는 것은 에너지입니다."
-> 우리가 미션을 해결하기 위해 열심히 노력하는 것도 좋지만, 계속해서 밤을 새어 가며 하는 것은 몸도 망치고 나중에 가서 힘이 빠질 가능성이 있다.
-> 미션을 해결하는데 힘을 두기 보단 집중과 휴식의 밸런스를 맞춰야 한다고 생각한다.
✔️ 퀘스트 : 미션을 해결하면서 중간중간 쉬면서 생각을 정리하는 시간 가지기
✔️ 수행 기준
- 산책하기 : 하루종일 앉아서 코딩만 하면 힘들테니 4시간 당 최소 30분 산책하기
- 인증하기 : 산책하고 인증샷 찍기
- 생각 기록하기 : 오늘 하루는 어땠는지 다시금 생각하며 쌓인 생각들 정리하고 기록하기

✔️  퀘스트 : **과제를 진행하기 전에 과제를 세분화 하여 시간계획을 세운 뒤 과제 진행하기**

✔️ 의도 : 계획을 짜는 것 또한 개발자의 중요한 능력이다. 계획을 짜며 본인의 능력치를 파악해보자

✔️ 수행 기준

- 계획 하기 : 체크리스트 작성, 사전 지식 학습 , 구현, readme작성 등 세부 Task를 정하여 Task 당 할당 시간을 정한다.
- 수행 하기 : 각 Task들에 얼마나 시간이 소요되었는지 측정한다. (최대한 계획한것과 비슷하게 수행한다.
- 분석하기 : 계획과 수행 사이에서 발생한 시간 차이가 왜 났는지 분석한다.