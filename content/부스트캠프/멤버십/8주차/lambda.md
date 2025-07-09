# AWS Lambda와 API Gateway를 이용한 서버리스 구성

---

## Lambda

- 서버 없이 코드를 실행해주는 서비스
    
- 사용한 시간만큼 요금 지불
    

---

### Lambda의 특징

- 다양한 언어 지원
    
- ms 단위로 요금 부과
    

---

### 주의 사항

- CPU를 장기간 사용하는 응용에는 적합하지 않음
    
- 데이터를 저장하기 위해서 별도의 DB 필요 (Dynamo, RDS, ...)
    

---

### Lambda Function을 실행하는 주체

- Event source (Push) : S3, API GW, Cloud Watch Events
    
- Lambda Invocation (Pull) : DynamoDB, Kinesis, ...
    
- Direct Execution
    

---

### 람다 사용예

- S3 버킷에 올라온 이미지의 썸네일 자동 작성
    
- API GW를 통한 REST API 제공
    
- 클라우드 워치 이벤트를 통해 주기적으로 인스턴스 등의 리소스 정리
    

---

### Lambda에서 필요한 리소스의 권한

- IAM Role을 이용해서 부여
    
- Execution Permission: 람다가 사용할 수 있는 리소스에 대한 권한
    
- Invocation Permission: 해당 리소스가 람다를 실행할 수 있는 권한
    

---

### 배포와 버전관리

- 콘솔, IDE, CLI를 통해 배포 가능
    
- ALIAS를 이용한 버전 관리 가능
    
- [https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/aliases-intro.html](https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/aliases-intro.html)
    

---

### Lambda blue print 사용해 보기

- [https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/with-s3-example.html](https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/with-s3-example.html)
    

---

- 쉽게 람다 체험 가능
    

### case study

- [https://aws.amazon.com/ko/solutions/case-studies/localytics/](https://aws.amazon.com/ko/solutions/case-studies/localytics/)
    

---

## API Gateway + Lambda

- 람다와의 조합으로 간단히 REST 서버 구축 가능
    

---

## 기타 특징

- Layer 기능을 통해서 추가 콘텐츠와 기능을 쉽게 개발할 수 있음
    
- 사용자 정의 AMI 지원을 통해 필요하다면 다양한 언어 및 라이브러리 프레임워크를 사용할 수 있음 (ex: Swift Lambda, Rust Lambda, ...)
    
- Application 기능을 통해 서버리스 어플리케이션을 쉽게 구축할 수 있음
    

## 람다를 이용한 스프링 부트 배포

- [https://github.com/awslabs/aws-serverless-java-container/wiki/Quick-start---Spring-Boot](https://github.com/awslabs/aws-serverless-java-container/wiki/Quick-start---Spring-Boot)
    
- [https://epsagon.com/blog/aws-lambda-and-java-spring-boot-getting-started/](https://epsagon.com/blog/aws-lambda-and-java-spring-boot-getting-started/)
    

---

## API Gateway 자습서 보기

- [https://docs.aws.amazon.com/ko_kr/apigateway/latest/developerguide/welcome.html](https://docs.aws.amazon.com/ko_kr/apigateway/latest/developerguide/welcome.html)
    

---

## 퀵랩 실습

- [https://www.qwiklabs.com/focuses/10541?parent=catalog](https://www.qwiklabs.com/focuses/10541?parent=catalog)
    
- [https://www.qwiklabs.com/focuses/10176?parent=catalog](https://www.qwiklabs.com/focuses/10176?parent=catalog)
    

---

## 참고자료

- [https://aws.amazon.com/ko/lambda/](https://aws.amazon.com/ko/lambda/)
    
- [https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/welcome.html](https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/welcome.html)