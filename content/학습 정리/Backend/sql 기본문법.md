# SQL이란?
SQL(Structured Query Language) 는 관계형 데이터베이스에 정보 저장 및 처리에 용이한 프로그래밍 언어이다.
관계형 데이터베이스는 정보를 표 형태로 저장하며, 행과 열을 통해 데이터 속성과 데이터 값 간의 다양한 관계를 나타낸다.
## DBMS란?
데이터베이스를 **데이터의 집합**이라고 한다면, DBMS(데이터베이스 관리 시스템)은 이러한 데이터베이스를 관리하고 운영할 수 있는 소프트웨어이다. 정보에 대해서 
다수의 사용자들이 데이터베이스 내의 데이터를 접근할 수 있도록 해주는 소프트웨어 도구의 집합
사용자 또는 다른 프로그램의 요구를 처리하고 적절히 응답하여 데이터를 사용할 수 있도록 해준다.
### 장점
- 자료의 통합성 증진
- 데이터의 접근성 용이
- 데이터 통제 강화
- 애플리케이션 프로그램 개발 및 관리 용이
- 보안 강화

### DBMS의 분류
- 계층형(Hierarchical)![](https://i.imgur.com/F0m6agz.png)
	- 트리 형태를 갖는 계층형 구조
	- 현재는 사용 X
- 망형(Network)![](https://i.imgur.com/tZMMoSx.png)
	- 하위에 있는 구성원끼리도 연결된 구조
	- 현재는 사용 X
- 관계형(Relational) ![](https://i.imgur.com/3ETG6Gc.png)
	- 테이블(table)이라는 최소 단위로 구성
	- 테이블은 하나 이상의 열과 행으로 이루어짐
- 객체지향형(Object-Oriented)
- 객체관계형(Object-Relational)

### 사용되는 DBMS들
- MYSQL
	- Oracle에서 제공하는 오픈 소스 관계형 데이터베이스 관리 시스템
- NOSQL
	- 테이블을 사용하여 데이터를 저장하지 않는 비관계형 데이터베이스
	- 수평 확장(NOSQL 소프트웨어를 실행하는 컴퓨터의 추가)이 가능하여 최신 애플리케이션에 많이 사용됨
- Microsoft SQL Server
	- SQL로 데이터를 조작하는 마이크로소프트의 관계형 데이터베이스 관리 시스템
- PostgreSQL
- DB2
- ACCESS
- SQLite

# sql 기본 문법
## USE - 스키마(데이터베이스) 선택
```sql
-- USE '스키마명'
USE mh_db
```

## SELECT - 조회할 데이터(column) 지정
```sql
-- SELECT '컬럼명' FROM '테이블명'
SELECT member_id, name FROM member;

-- SELECT 와 FROM 사이에 *를 적으면 테이블의 모든 컬럼을 조회한다.
SELECT * FROM member;

-- 두 SQL은 동일한 기능
SELECT * FROM market_db.member;
SELECT * FROM member;;

```

### 논리연산자 사용
```sql
-- 논리연산자 사용 가능
SELECT TRUE OR FALSE AND FALSE;   // 1 SELECT (TRUE OR FALSE) AND FALSE; // 0
```

### between 범위표현
```sql
-- between을 통한 범위 표현
SELECT * FROM member 
	WHERE height between 160 and 165
```

### LIKE 문자열의 일부 글자 검색
```sql
-- mem_name 컬럼 값이 '블'로 시작하는 4글자 글자 데이터 조회
SELECT * FROM member WHERE mem_name LIKE '블___';

-- mem_name 컬럼 값이 '블'로 시작하는 모든 데이터 조회
SELECT * FROM member WHERE mem_name LIKE '블%';

-- mem_name 컬럼 값에 '블'이 들어가는 모든 데이터 조회
SELECT * FROM member WHERE mem_name LIKE '%블%';
```
- 글자_ -> 글자로 시작, 언더바의 수에 따라 글자 지정
- 글자% -> 해당 글자로 시작하는 모든 데이터 조회
- %글자% -> 값에 해당 글자가 들어가는 모든 데이터 조회

## WHERE - 특정 조건 조회
```sql
-- member 테이블에서 mem_number 컬럼 값이 5이상인 데이터 조회
SELECT * FROM member 
	WHERE mem_number >= 5;
```


## IN() - 여러 값 매칭
```sql
-- addr 컬럼값이 경기, 전남, 경남인 데이터 조회
SELECT * FROM member 
	WHERE addr IN('경기', '전남', '경남');

SELECT * FROM member
	WHERE addr = '경기' OR addr = '전남' OR addr = '경남';
```

## 서브 쿼리
```sql
SELECT mem_name, height 
	FROM member 
	WHERE height > (select height from member where mem_name LIKE '에이핑크');
```
2개의 SQL문을 하나로 만들기

## ORDER BY 조회 데이터 정렬
```sql
-- debut_date 값을 기준으로 정렬 (기본 ASC)
SELECT * FROM member
	ORDER BY debut_date;
```
- ASC -> 오름차순(기본값)
- DESC -> 내립차순
```sql
-- height 컬럼 값이 164 이상인 데이터를 조회하여 
-- height 값 기준 내림차순 정렬하고 동일한 값이라면 debut_date 값 기준 오름차순 정렬
SELECT * FROM member
  	WHERE height >= 164
	ORDER BY height DESC, debut_date;
```

## LIMIT 출력 개수 제한
```sql
SELECT * FROM member
	LIMIT 3;    		-- 상위 3건만 조회

SELECT * FROM member
	LIMIT 3, 2; 		-- 3번째 데이터부터 2건만 조회
	LIMIT 2 OFFSET 3; 	-- 위와 동일
```
- LIMIT 시작, 개수
- 처음부터 N까지의 데이터만 가져옴
- LIMIT와 OFFSET 조합으로도 출력 개수 제한 가능

## DISTINCT 중복 데이터 제거
```sql
-- addr 의 모든 컬럼 값을 중복을 제거하여 조회
SELECT DISTINCT addr
	FROM member;
```
DISTINCT를 열 이름 앞에 붙이면 중복된 값은 1개만 출력

## GROUP BY 그룹화
```sql
-- mem_id가 같은 데이터를 그룹으로 묶음
-- 그룹핑된 데이터에서 mem_id와 amount의 합계를 구함
SELECT mem_id, SUM(amount) AS "합계"
	FROM buy
  	GROUP BY mem_id
  	ORDER BY mem_id;
```

## 집계 함수
- SUM() 컬럼의 합계
- AVG() 컬럼의 평균
- MIN() 컬럼의 최소값 반환
- MAX() 컬럼의 최대값을 반환
- COUNT() 행의 개수**(NULL 값 포함)**
- COUNT(DISTINCT) : 행의 개수 **(중복 제외, NULL값 비포함)**
- STDEV() 표준 편차
- VARIANCE() 분산

```sql
-- 집계 함수 안에서 연산도 가능
SELECT mem_id, SUM(amount*price) AS "총 금액"
	FROM buy
    GROUP BY mem_id
    ORDER BY mem_id;
```
## HAVING 그룹 조건
```sql
-- mem_id 를 기준으로 그룹화
-- 그룹화된 데이터를 기준으로 amount*price 합계가 1000 이상인 그룹만 남김
-- 조건에 걸러진 그룹에서 amount*price 의 합계를 조회
SELECT SUM(amount*price) AS "총 금액"
	FROM buy
    GROUP BY mem_id
    HAVING SUM(amount*price) >= 1000;
```
- 집계 함수에 대해서 조건 제한하는 편리한 개념
- 반드시 GROUP BY절 다음에 나와야 함

## ROLLUP
- 총합 또는 중간합계가 필요할 때 사용
- GROUP BY절과 함께 WITH ROLLUP문 사용


## JOIN
- 여러 테이블에서 가져온 레코드를 조합하여 하나의 테이블이나 결과 집합으로 표현
- 그냥 합치는게 아니라, `ON`을 통해서 조건을 걸어주기


## 내장함수
### 문자열 함수
- LENGTH() 문자열 길이
- CONCAT() 전달받은 문자열을 모두 결합하여 하나의 문자열로 반환
	- 전달받은 문자열 줄 하나라도 NULL이 존재하면 NULL 반환
- LOCATE() 문자열 내에서 찾는 문자열이 처음으로 나타나는 위치
	- 찾는 문자열이 문자열 내에 없으면 0 반환
	- **MYSQL은 시작 인덱스가 1부터임**
- LEFT() 문자열 왼쪽부터 지정한 개수만큼의 문자를 반환
- RIGHT() 문자열 오른쪽부터 지정한 개수만큼의 문자를 반환
- LOWER() 소문자로
- UPPER() 대문자로
- REPLACE() 문자열에서 특정 문자열을 대체 문자열로 교체
- TRIM() 문자열 앞뒤 or 양쪽에 모두 있는 특정 문자를 제거
	- BOTH 양 끝에 존재하는 특정 문자 제거
	- LEADING 전달 받은 문자열 앞에 존재하는 특정 문자 제거
	- TRAILING 전달 받은 문자열 뒤에 존재하는 특정 문자 제거
	- 지정자 명시 안하면 BOTH로 됨
	- 제거할 문자 명시 없으면 공백 제거 
```mysql
SELECT TRIM(LEADING "@@@" FROM "@@@wrwr@@@")
-- wrwr
```
- FORMAT() 숫자 타입의 데이터를 세 자리마다 쉼표를 사용하는 형식으로 변환
	- 문자열로 반환됨
	- 두번째 인수는 반올림할 소수 부분의 자릿수
- FLOOR() 내림
- CEIL() 올림
- ROUND() 반올림
- SQRT() 양의 제곱근
- POW() 밑수와 지수를 전달하여 거듭제곱
- EXP() 인수로 지수를 전달받아 e의 거듭제곱 계산
- LOG() 자연로그 값을 계산
- SIN() 사인값
- COS() 코사인값
- TAN() 탄젠트값
- ABS() 절대값
- RAND() 0.0보다 크거나 같고 1.0보다 작은 하나의 실수를 무작위 생성
- NOW() 현재 날짜와 시간 반환
	- 'YYYY-MM-DD HH:MM:SS' 또는 YYYYMMDDHHMMSS형태로 반환
- CURDATE() 현재 날짜 반환
	- 'YYYY-MM-DD' 또는 YYYYMMDD형태로 반환
- CURTIME() 현재 시각 반환
	- 'HH:MM:SS' 또는 HHMMSS형태로 반환
- DATE() 전달받은 값에 날짜 정보 반환
- MONTH() 월
- DAY() 일
- HOUR() 시간
- MINUTE() 분
- SECOND() 초
- MONTHNAME() 월에 해당하는 이름
- DAYNAME() 요일
- DAYOFWEEK() 해당 주에서 몇번째 날인지 반환 1-7사이
	- 일요일 = 1, 토요일 = 7
- DAYOFMONTH() 해당 월에서 몇 번쨰 날인지 반환 0부터 31 사이
- DAYOFYEAR() 해당 연도에서 몇번째 날인지 반환 1-366사이
- DATE_FORMAT() 전달받은 형식에 맞춰 날짜와 시간 정보 문자열로 반환
