## NOSQL이란?
Not Only SQL의 약자. 
RDBMS의 한계를 극복하기 위해 만들어진 데이터베이스로, RDBMS와 같이 고정된 스키마나 JOIN이 존재하지 않는 다소 자유로운 데이터베이스.

| SQL                                   | NOSQL         |
| ------------------------------------- | ------------- |
| 정해진 규격이 존재함<br>(Schema, Table-Column) | 정해진 규격이 따로 없음 |
| JOIN이 가능                              | JOIN 불가능      |
| 트랜잭션 사용                               | 트랜잭션 안됨       |
| 분산처리 어려움                              | 분산처리 쉬움       |

## 장점
앞에서도 말했듯이 RDBMS에는 어느정도 한계가 있다.
복잡도와 용량적인 측면에서 한계를 가지고 있으며, 활용에도 제약이 깐깐하기 때문에 이러한 점은 장점이면서도 단점으로 다가온다.

NoSQL은 유연성과 확장성이 더 뛰어나기 때문에 많은 경우 SQL보다 선호됩니다. NoSQL 시스템 사용의 주요 이점은 개발자가 기존 관계형 데이터베이스의 오버헤드 없이 데이터를 빠르고 쉽게 저장하고 액세스할 수 있다. 따라서 개발을 함에 있어서 기본 데이터 스토리지 구현에 대한 걱정 없이 기능 및 코어 비즈니스 로직을 더 빠르게 제공하는 데 집중할 수 있다.

이를 정리해보면
- 유연성 : 스키마 선언 없이 필드의 추가 및 삭제가 **자유로운 Schema-less 구조**
- 확장성 : 스케일 아웃에 의한 **서버 확장이 용이**
- 고성능 : 대용량 데이터를 처리하는 **성능**이 뛰어나다
- 가용성 : 여러 대의 백업 서버 구성이 가능하여 장애 발생 시에도 **무중단 서비스가 가능**
등의 장점을 가진다. 

## 단점
하지만 이렇게 유연성과 같은 장점은 단점으로도 작용할 수 있는 점이 있다.
스키마가 없기 때문에 그만큼 유연하지만, 유연한 만큼 데이터베이스 일관성에 약하다.
추가적으로 
- key값에 대한 입출력만 지원
- 스키마가 정해져 있지 않아, 데이터에 대한 규격화가 되어 있지 않다.
- 데이터가 여러 컬렉션에 중복되어 있어서 데이터를 **UPDATE 하는 경우 모든 컬렉션에서 수행**해야하기 때문에 느리다.
- 데이터 중복으로 인한 수정 작업의 번거로움
![](https://i.imgur.com/UZWsSBv.png)

## NoSQL의 기술 요소
#### 기술 요소
- BASE
- (Basically Available, Soft State, Eventually Consistent)
#### 기술 요소 상세
**Basically Available(가용성)**
![](https://blog.kakaocdn.net/dn/VoGEi/btrmgJc8ylA/eASXClupzZr4n9jOTBIZWk/img.png)

Master 서버에 장애 발생 시에도 여러 Slave 서버로 인해 무중단 서비스가 가능함

**Soft State(소프트 상태)**

![](https://blog.kakaocdn.net/dn/VCgVg/btrmhZzvs5a/u4Vf2vb95KScglJ41lZfl0/img.png)

각각의 데이터가 도달한 시점에 데이터가 갱신됨

**Eventually Consistent(결과적 일관성)**

![](https://blog.kakaocdn.net/dn/rIkdf/btrmhtASzmH/O6lknKCfk6J9bKWvjPtQu0/img.png)

복제 메커니즘에 의해 모든 서버에 데이터 복제가 동시에 실행될 수 없음
시스템 부하 및 네트워크 속도에 따라 서버에 복제하는 시간이 다를 수 있으나 최종적으로는 모든 서버에 데이터가 복제됨
특징 : 데이터 가용성과 데이터 처리 성능이 향상되도록한다
중점 사항 : 서비스 가용성


## Key-Value Database
- Key와 Value으로 구성된 배열구조의 데이터베이스로 가장 단순한 구조
- **저장과 조회** 라는 가장 간단한 원칙에 충실한 데이터베이스
### 특징
- 기본적인 패턴으로 Key, Value가 하나의 묶음으로 저장되는 구조이기 때문에 속도가 빠르며 분산 저장에 용이하다
- 값에 모든 데이터 타입이 허용가능하다.
	- 대신 모든 데이터 타입을 허용하는 만큼 데이터 입력 단계에서 검증 로직을 제대로 구현해야 한다
- Key는 중복될 수 없고 이 Unique Key에 각각 하나의 Value를 가지고 있는 형태가 된다. 데이터를 조회 및 입력할 때, Key를 가지고 접근할 수 있다.

### 활용

1. 성능 향상을 위해 RDBMS 에서 캐싱 (Redis)
2. 장바구니 같은 웹애플리케이션에서 일시적인 속성 추적
3. 이미지나 오디오 파일 같은 대용량 객체 저장

### 종류
- Redis
- AWS DynamoDB
- Riak


## Document Database

Document Database 또는 Document-Oriented Database는 위의 Key-Value Database와 같이 데이터 저장에 Key-Value Type를 사용한다.

- 하지만 Key-Value Database와의 중요한 차이는 **Document Database는 값을 문서로 저장함**
	- **문서란** **semi-structured entity이며 보통 JSON이나 XML 같은 표준 형식**
- 값을 저장하기 전에 schema를 별도로 정의하지 않으며, 문서를 추가하면 그게 바로 schema가 된다.
- 각 문서별로 다른 필드를 가질 수 있으며, 따라서 개발자가 애플리케이션에서 데이터를 입력하는 단계에서 컬럼과 필드의 관리가 제대로 이루어지도록 보장하는 것이 매우 중요하다.  
    - 예를 들어 필수 속성(Null을 허용하지 않는 속성)에 대한 관리도 애플리케이션 레벨에서 관리가 이루어져야 한다.

예시로 MongoDB의 AirBnB DataSet의 일부를 보자. 다음과 같은 JSON 형태의 문서로 관리된다.

```json
{  
"_id": "10006546",  
"listing_url": "https://www.airbnb.com/rooms/10006546",  
"name": "Ribeira Charming Duplex",  
"summary": "Fantastic duplex apartment with three bedrooms, located in the historic area of Porto, Ribeira (Cube)...",  
"house_rules": "Make the house your home...",  
"property_type": "House",  
"calendar_last_scraped": {  
    "$date": {  
       "$numberLong": "1550293200000"  
        }  
    },  
"amenities": [  
    "TV",  
    "Cable TV",  
    "Wifi",  
    "Kitchen",  
    "Paid parking off premises",  
    "Smoking allowed",  
    "Microwave"  
    ]  
}
```
### 활용
**Document Database** 는 다음과 같은 목적으로 주로 활용된다.  
    1. 대용량 데이터를 읽고 쓰는 웹 사이트용 백엔드 지원  
    2. 제품처럼 다양한 속성이 있는 데이터 관리  
    3. 다양한 유형의 메타데이터 추적  
    4. JSON 데이터 구조를 사용하는 애플리케이션  
    5. 비정규화된 중첩 구조의 데이터를 사용하는 애플리케이션


### 종류
- MongoDB  
- CouchDB  
- Couchbase


## Column Family Database

컬럼 패밀리 데이터베이스는 대용량 데이터, 읽기와 쓰기 성능, 고가용성을 위해 설계되었다. 
구글의 Big Table, 페이스북은 Cassandra가 있다.

### 특징
- Relation Database와 동일한 용어를 사용하여 스키마 정의
- 컬럼 수가 많으면 관련된 컬럼들을 컬렉션으로 묶음
- Document Database와 마찬가지로 미리 정의된 스키마를 사용하지 않아 개발자가 데이터를 입력하는 시점에 원하는 대로 컬럼을 추가
- 테이블간 조인 지원 안함
- 일반적으로 비정규화 되어 있으며 한 객체에 관련된 모든 정보를 가능한 매우 너비가 넓은 단일 Row에 넣어서 보관함
- 여러대로 구성된 클러스터에서 운영 되므로 데이터가 적다면 document나 key-value database가 나음

![](https://miro.medium.com/v2/resize:fit:1400/0*dlH4j-lgJcWU2WlT.jpg)

### 활용
1. 데이터베이스에 쓰기 작업이 많은 애플리케이션  
2. 지리적으로 여러 데이터 센터에 분산되어 있는 애플리케이션  
3. 복제본 데이터가 단기적으로 불일치하더라도 큰 문제가 없는 애플리케이션  
4. 동적 필드를 처리하는 애플리케이션  
5. 수백만 테라바이트 정도의 대용량 데이터를 처리할 수 있는 애플리케이션

### 종류
- Hbase  
- Cassandra  
- GCP BigTable  
- Microsoft Azure Cosmos DB**