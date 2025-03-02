## 미션

- NCloud 에 테스트용 VPC 작성
- 서브넷 * 2 작성 (퍼플릭, 프라이빗)
- 각 서브넷에 인스턴스 2 개 설치
- private 인스턴스 접속
- private 인스턴스 인터넷 업데이트 및 mysql 설치
- 스샷 제출!

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/e38e7aad-5ec6-442f-8c61-c603fe2723ee/35ce6f1d-b2bc-4162-85c7-3c908d743b22/image.png)

VPC 생성

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/e38e7aad-5ec6-442f-8c61-c603fe2723ee/5c9f6a75-0ae2-4db6-8129-b2106f2c2a72/image.png)

public subnet, private subnet, gateway subnet 생성

### gateway 설정을 안해도 mysql-server 설치가 되는 이유…?

- gateway 설정을 하지 않아도 mysql-server가 설치가 된다.
- ping은 안된다.
- 뭔가 내부적으로 apt 패키지 설치는 접근할 수 있게 해주는 건가..?
- gpt의 답변

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/e38e7aad-5ec6-442f-8c61-c603fe2723ee/0408b160-606f-4b0a-8cf7-76cbd99647ef/image.png)

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/e38e7aad-5ec6-442f-8c61-c603fe2723ee/9125a26b-97ac-4ec7-84c6-dffb8b2773b7/image.png)

공인 IP 두개를 사용해서 public 서버에 하나, 공인 NGW Subnet에 하나 할당해서 해결.

공인 NGW를 생성하고, route table에 가서 아웃바운드에 추가해주면 된다.

뭔가 수업때는 공인 IP 하나만 사용하는 느낌이였는데 이게 맞나..?

## **리소스 정리**

- **사용한 리소스는 잊지 말고 꼭 정리해 준다!**