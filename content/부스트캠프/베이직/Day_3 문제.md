# 학습 목표

- 시각적인 표를 프로그램에서 필요한 데이터 구조로 선언할 수 있다.
    
- 직접 만든 데이터 구조를 탐색할 수 있다.
    

# 사전지식

- 없음.
    

# 기능요구사항

다음과 같이 특정 게임에 대한 검색 프로그램을 작성하려고 합니다.  
검색 동작을 하는 find() 함수를 구현하세요.

| 이름       | 단종여부  | 장르         | 별점  | 최대참여자 |
| -------- | ----- | ---------- | --- | ----- |
| Kong     | true  | Adventure  | 4.1 | 1     |
| Ace      | false | Board      | 3.8 | 4     |
| Mario    | true  | RPG        | 3.3 | 2     |
| Prince   | true  | RPG        | 4.8 | 1     |
| Dragons  | true  | Fight      | 3.4 | 4     |
| Civil    | false | Simulation | 4.2 | 1     |
| Teken    | true  | Fight      | 4.0 | 2     |
| GoCart   | false | Sports     | 4.6 | 8     |
| Football | false | Sports     | 2.9 | 8     |
| Brave    | true  | RPG        | 4.2 | 1     |

각 게임을 판매한 기간은 다음과 같습니다.

![Game-Timelinev2](https://lucas-image.codesquad.kr/1717382106318Game-Timelinev2.png)

- 위의 기간에만 해당 게임을 할 수 있다고 가정하세요.
    

# 프로그래밍 요구사항

#### find() 요구사항

파일 이름은 다음과 같이 작성하세요.

- 자바스크립트 `find.js` , 스위프트 `find.swift` , 코틀린 `find.kt`
    

각 함수 시그니처는 다음과 같이 구현하세요.

###### JavaScript

```
function find(param0, param1)
```

###### Swift

```
func find(param0 : String, param1: Int) -> String
```

###### Kotlin

```
fun find(param0: String, param1: Int) : String
```

- 첫 번째 매개변수 param0는 문자열로 특정 시점을 전달하고, 두 번째 매개변수 param1는 정수형으로 참가 인원수를 전달해야 합니다.
    
- find() 함수 리턴값은 문자열로 리턴해야 합니다. find() 함수의 시그니처를 변경하지 마세요.
    
- 게임에 대한 데이터 구조에서 판매 시작 시점과 판매 종료 시점을 param0와 비교해서 판매 중인 시점의 게임을 출력해야 합니다.
    
- 판매 중인 동안만 참가할 수 있다고 가정합니다.
    
- 그리고 param1 참가자 인원수와 비교해서 참가 가능한 게임만 출력해야 합니다.
    
- 단종된 모델의 경우는 이름 뒤에 * 문자를 붙여서 출력합니다.
    
- 최종 출력값은 게임 별점(내림차순)으로 정렬해야 합니다.
    

# 예상결과 및 동작예시

#### 예시 1

- "198402", 1 -> "Prince*(RPG) 4.8, Brave*(RPG) 4.2"
    
    > 1984년 2월에 가능한 게임은 Brave, Prince로 모두 단종이라 \*가 붙음  
    > Prince는 별점 4.8, Brave는 별점 4.2라서 Prince > Brave 순으로 출력
    

#### 예시 2

- "200008", 8 -> "Football(Sports)"
    
    > 2000년 8월에 가능한 게임 중에 8명이 참여 가능한 게임은 Football 하나 뿐임
    

#### 예시 3

- "199004", 5 -> ""
    
    > 1990년 4월에 가능한 게임은 Ace와 Prince 뿐인데 5명 이상 불가능하니까 결과는 빈 문자열