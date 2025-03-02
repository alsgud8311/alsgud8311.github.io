# Trigger

트리거(Trigger)는 테이블에서 어떤 이벤트가 발생했을 때 자동으로 실행되는 함수와 같은 존재다.

자바스크립트의 이벤트 리스너처럼 어떤 테이블에서 특정한 이벤트가 발생했을 때 실행시키고자 하는 추가 쿼리 작업들을 자동으로 수행할 수 있게끔 트리거를 미리 설정해주는 것이다.

정말 간략하게 예를 들어보자면, A 테이블에 1이라는 숫자가 입력됐을 때, 자동으로 B 테이블에도 1을 복사해주고 싶을 때 트리거를 이용해 설정해 놓았다면 자동으로 B에도 1이라는 숫자가 입력되게 할 수 있습니다.

## Trigger 종류

![](https://velog.velcdn.com/images/odh0112/post/8dbbda7b-059a-4cab-ac75-51494f665cdf/image.png)

## 문장 트리거

- INSERT, UPDATE, DELETE 문에 대해 **한 번만** 실행
- AFTER 트리거 : 쿼리 이벤트 작동한 후
- BEFORE 트리거 : 쿼리 이벤트가 작동하기 전 -> 미리 데이터를 확인 가능할 때

![](https://velog.velcdn.com/images/odh0112/post/64e5363f-9df4-48f0-bb0b-b6aae6236ef1/image.png)

## 행 트리거

- 테이블 안의 영향을 받은 행 각각에 대해 실행
- 변경 전 or 변경 후의 행은 각각 **OLD, NEW**라는 가상 줄 변수를 사용하여 읽어옴  
    - OLD : 기존 데이터, delete로 삭제 된 데이터 또는 update로 바뀌기 전의 데이터  
    - NEW : 새로운 데이터, insert로 삽입된 데이터 또는 update로 바뀐 후의 데이터

| 트리거 이벤트 | OLD | NEW |
| ------- | --- | --- |
| INSERT  | X   | O   |
| UPDATE  | O   | O   |
| DELETE  | O   | X   |

> - INSERT - 새롭게 데이터가 추가되는 것이므로 이전 데이터는 존재하지 않아 OLD X, NEW O 입니다.
> - UPDATE - 기존에 있던 데이터를 새로운 데이터로 변경하는 작업이기 때문에 OLD O, NEW O 입니다.
> - DELETE - 기존에 있던 데이터를 지우는 작업이므로 OLD O, NEW X 입니다.

## Trigger 사용법

### 트리거 생성

```sql
DELIMITER $$

CREATE TRIGGER before_to_after -- before_to_after라는 Trigger 이름
AFTER INSERT ON before_num -- {BEFORE | AFTER} {INSERT | UPDATE | DELETE}중 언제 어떤 작업을 할 지 정해줍니다.
FOR EACH ROW -- 아래 나올 조건에 해당하는 모든 row에 적용한다는 의미

BEGIN
	-- Trigger가 실행되는 코드
	IF NEW.number THEN -- 새로운 number가 입력됐을 때,
		INSERT INTO after_num(id, number) VALUES(NEW.id, NEW.number); -- `VALUES(NEW.id, NEW.number)`의 데이터를 after_num의 id, number에 삽입
	END IF;
END $$
```

- BEGIN ~ END 사이에 조건문과 실행문을 작성
- delimiter(구문 문자, 문법의 끝) 명시(대부분 `$$`를 많이 씀)

### 트리거 실행

Trigger before_to_after는 `AFTER INSERT ON before_num`가 실행되면 자동으로 트리거가 작동하는 구조이기 때문에, before_num 테이블에 새로운 데이터를 삽입해주면 됩니다.

```sql
INSERT INTO before_num(number) VALUES(1);
```

### 트리거 확인

-  앞서 만들었던 Trigger 이름과 명령 등 정보들을 확인

```sql
SHOW triggers;
```

![](https://velog.velcdn.com/images/odh0112/post/a62e280a-9aab-4f78-8eca-6d74ee2f7bc6/image.png)

### 트리거 삭제

```sql
-- 전부 삭제
DELETE TRIGGERS;

-- 하나만 삭제
DROP TRIGGET 트리거이름;
```

### 변수 생성

- 변수 선언은 `DECLARE` 명령을 이용해 사용
-  BEGIN ~ END 사이에 작성

```sql
-- DECLARE 선언 방법 
BEGIN
	DECLARE 변수 타입 {디폴트값}
    .
    .
    .
END
```

### 조건문

```sql
IF (조건) THEN
ELSEIF (조건) THEN
ELSE
ENDIF
```