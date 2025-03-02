# Join이란?
JOIN은 데이터베이스 내의 **여러 테이블**에서 가져온 레코드를 조합하여 하나의 테이블이나 결과 집합으로 표현해 준다.
관계형 데이터베이스에서는 가장 많이 쓰이는 기능으로, 집합의 개념으로 이해하고 보면 쉽다

![](https://i.imgur.com/ubMaryV.png)

## INNER JOIN
![](https://i.imgur.com/T8Vp6Vh.png)
조인하는 테이블의 ON절의 조건이 일치하는 결과만 출력한다.
교집합이라고 생각하면 편하다

> mysql에서는 JOIN, INNER JOIN, CROSS JOIN이 같은 의미로 사용 된다

### 기본 구문
```sql
select a.userid, name
from users as a inner join history as b
on a.userid = b.userid
where a.userid = "1"
```
두 개의 테이블을 비교할 때는 각 테이블을 식별하는 변수? 를 as로 지정한 뒤에 조인을 할 때 접근자를 통해서 각 테이블을 식별할 수 있도록 한다!

### 함축 구문
```sql
select a.userid, name
from users a, history b
where a.userid = b.userid and a.userid ="1"
```


## LEFT/RIGHT OUTER JOIN

![](https://i.imgur.com/yq2y9Eg.png)
![](https://i.imgur.com/rX0UgX8.png)
두 테이블이 합쳐질 때 왼쪽/오른쪽을 기준으로 방향을 정하고, 정한 방향의 컬럼은 모두 가져온다
한마디로 on 조건에서 설정한 조건에서 한 방향의 데이터를 다 가져온다는 소리다
OUTER JOIN은 LEFT/RIGHT OUTER JOIN, FULL OUTER JOIN이 있다.
대부분 LEFT OUTER JOIN을 많이 사용하는데, 왼쪽을 방향으로 잡는 이유는 데이터를 읽는 구조 등의 연관이 있다.

처음에 조인할 때 쓸 테이블을 왼쪽에 두고 LEFT JOIN하는 방식으로 하게 되면 데이터 또한 왼쪽 -> 오른쪽으로 엑세스하기 때문에 일반적으로 우리가 글을 읽는 방식처럼 위 -> 아래의 순서대로 데이터를 읽게 된다. 그렇기 때문에 보다 일반적인 방식으로 LEFT JOIN을 사용하여 가장 많은 열을 가져와야 할 테이블을 왼쪽에 우선적으로 적어준다

### 기본 구문(LEFT JOIN)
```sql
-- 예) 1학년 학생의 이름과 지도교수명을 출력하라. 단, 지도교수가 지정되지 않은 학생도 출력되게 하라.

SELECT STUDENT.NAME, PROFESSOR.NAME 
FROM STUDENT LEFT OUTER JOIN PROFESSOR -- STUDENT를 기준으로 왼쪽 조인
ON STUDENT.PID = PROFESSOR.ID 
WHERE GRADE = 1
```

### 기본 구문(RIGHT JOIN)
```sql
-- 예) 1학년 학생의 이름과 지도교수명을 출력하라. 단, 지도교수가 지정되지 않은 학생도 출력되게 하라.

SELECT STUDENT.NAME, PROFESSOR.NAME 
FROM STUDENT RIGHT OUTER JOIN PROFESSOR -- PROFESSOR를 기준으로 오른쪽 조인
ON STUDENT.PID = PROFESSOR.ID 
WHERE GRADE = 1
```

### 3중 조인
3개의 테이블을 조합해야 할 때는 outer join을 연속으로 3번 사용하면 된다.
```sql
-- 3개의 테이블을 join하고 한국에대한 정보만 뷰로 생성해라

create view allView as 
( 
    select A.Name, A.CountryCode 
    from city A 
    left join country B 
    on A.countrycode = B.code -- 테이블 2개 조인 완료
    left join countrylanguage C 
    on B.code = C.countrycode -- 테이블 3개 조인 완료
    where A.countrycode in ('KOR'); 
)
```
## FULL OUTER JOIN
![](https://i.imgur.com/KsP0LXn.png)

full outer join은 두 테이블의 합집합이다.
하지만 full outer join같은 경우 대부분 db가 지원하지 않기 때문에 `Union`을 활용하여 간접적으로 구현한다.
```sql
-- full outer join
select * 
from topic FULL OUTER JOIN autor 
on topic.auther_id = authoer.id

-- 같은구문
(select * from topic LEFT JOIN autor on topic.auther_id = authoer.id)) 
UNION 
(select * from topic RIGHT JOIN autor on topic.auther_id = authoer.id))
```
## UNION
UNION은 여러 개의 SELECT문의 결과를 하나의 테이블이나 결과 집합으로 표현할 때 사용한다.

> ⚠️ 이 때 각각의 SELECT문으로 선택된 필드의 개수와 타입은 모두 같아야 하며, 필드의 순서 또한 같아야 한다.
  ⚠️ 기본 집합 쿼리에는 중복 제거가 자동 포함되어 있다.

```sql
SELECT 필드이름 FROM 테이블이름
UNION
SELECT 필드이름 FROM 테이블이름
```

## UNION ALL
UNION은 DISTINCT 자동 포함이라 중복되는 레코드를 제거하기 때문에, 중복되는 레코드까지 모두 출력하고 싶다면 ALL 키워드를 붙이면 된다.

```sql
SELECT 필드이름 FROM 테이블이름
UNION ALL
SELECT 필드이름 FROM 테이블이름
```

## EXCLUSIVE JOIN
![](https://i.imgur.com/xtQFPFY.png)

EXCLUSIVE LEFT JOIN은 A의 여집합과 같은 느낌이다. 
조건에 해당하는 것을 제외하고 특정 테이블에 있는 레코드만 가져온다.
EXCLUSIVE JOIN도 LEFT/RIGHT가 나뉘어져 있는데, 방향에 따라 한쪽의 데이터만 가져온다
```sql
SELECT * 
FROM table1 A LEFT JOIN table2 B
ON A.ID_SEQ = B.ID_SEQ 
WHERE B.ID_SEQ IS NULL -- 조인한 B 테이블의 값이 null만 출력하라는 말은, 조인이 안된 A 레코드 나머지값만 출력하라는 말
```

## SELF JOIN
자체 조인(SELF JOIN)은 테이블 자기 자신을 조인하는 것이다.
![](https://i.imgur.com/usk4Gfy.png)

```sql
SELECT E.NAME as Name, M.NAME as Secret_Santa
FROM Santa E, Santa M -- inner join
WHERE E.Santa_Color = M.Color;
```


## DRIVING TABLE
 JOIN시 먼저 엑세스돼서 ACCESS PATH를 주도하는 테이블
 어디의 데이터부터 출발해서 값을 찾느냐에 따라 성능을 좌지우지한다.
 
 대표적인 예로
 - (조건을 만족하는)5000만건의 데이터 A 테이블 
 - (조건을 만족하는)1000건의 데이터 B 테이블 
 
 이 두개가 있을 때 조인 과정에서 A테이블에 먼저 엑세스하면 5000만번을 탐색하고
 B테이블에 엑세스하면 1000번의 엑세스만으로 탐색이 완료된다는 차이를 든다.
따라서 우리는 조인을 할 때 보다 적은 데이터의 양이 들어갈 확률이 높은 테이블에 대해서 드라이빙 테이블로 설정해야 할 필요성이 있다.(물론 관계도 고려해야겠지만)

### DRIVING TABLE의 결정 규칙

규칙 기반 옵티마이저(Rule-Based Optimizer)에서는 연산자, 인덱스 유무, 조건절 형태 등 정해진 규칙의 우선순위에 따라 실행 계획을 생성한다.
- ﻿﻿인덱스를 이용한 액세스 방식이 전체 테이블 액세스 방식보다 우선순위가 높음
- ﻿﻿조인 칼럼에 대한 인덱스가 양쪽 테이블에 모두 존재할 때, 우선순위가 높은 테이블을 선택
- ﻿﻿조인 칼럼에만 인덱스가 존재하는 경우에는 인덱스가 없는 테이블을 먼저 선택하여 조인 수행
- ﻿﻿만약 조인 테이블의 우선순위가 동일하지않다면, FROM 절에 나열된 테이블의 역순으로 수행

하지만 최근에는 비용기반 옵티마이저(Cost-Based Optimizer)를 채택한다.
비용기반 옵티마이저는 쿼리를 수행하는데 소욕되는 예상 비용을 바탕으로 실행 계획을 생성한다.

실행 계획은 인덱스를 기준으로 나뉜다. 
인덱스가 있을 경우 인덱스가 있는 테이블은 데이터 조회 시 풀 스캔이 일어나지 않기 때문에 인덱스가 있는 테이블을 DRIVEN TABLE로 두면 드라이빙 테이블이 드리븐 테이블에 대해서 반복적으로 풀 스캔을 하지 않아 더 빠르기 때문이다.
따라서 인덱스의 유무를 기준으로 결정 규칙을 나눠보면

- 두 칼럼 모두 각각 인덱스가 있을 경우
	- 레코드 건수에 따라 적은 레코드 수를 가진 테이블을 드라이빙 테이블로
- 한 칼럼에만 인덱스가 있는 경우
	- 인덱스가 없는 테이블의 반복된 풀 스캔을 막기 위해 인덱스가 없는 테이블을 드라이빙 테이블로 선택
- 두 칼럼 모두 인덱스가 없을 경우
	- 스캔되는 레코드 수에 따라 적절한 드라이빙 테이블 선택
	- 드리븐 테이블을 풀스캔

으로 동작하게 된다.

## 참조
https://inpa.tistory.com/entry/MYSQL-%F0%9F%93%9A-JOIN-%EC%A1%B0%EC%9D%B8-%EA%B7%B8%EB%A6%BC%EC%9C%BC%EB%A1%9C-%EC%95%8C%EA%B8%B0%EC%89%BD%EA%B2%8C-%EC%A0%95%EB%A6%AC
https://devuna.tistory.com/36
