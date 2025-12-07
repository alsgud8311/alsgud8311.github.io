### 주체(Principal)와 객체(Resource)

접근 통제 시스템의 기본적인 구성 요소입니다.
- **주체 (Principal):** 접근하려는 **사람** 또는 **시스템** (예: User, Role, System).
- **객체 (Resource):** 접근 대상이 되는 **자원** (예: AWS Resource - S3 Bucket, EC2 Instance, Secret).

### 접근 통제 모델

|**모델**|**설명**|**적용 대상**|**특징**|
|---|---|---|---|
|**RBAC** (Role-Based Access Control)|역할(Role)을 기반으로 권한을 부여.|부서, 그룹 단위|사람마다의 권한 관리 복잡성을 해소.|
|**ABAC** (Attribute-Based Access Control)|주체, 객체, 환경 등의 속성(Attribute)을 기반으로 접근 통제.|특정 등급, 태그 기반 (예: `정보부서`에 속한 사람들)|더 세밀하고 유연한 정책 설정 가능.|

## AWS IAM (Identity and Access Management)

AWS에서 **최소 권한 원칙**을 기반으로 접근을 관리하는 핵심 서비스

> 최소 권한 원칙 정보보안 개념으로, 작업을 완료하는데 꼭 필요한 데이터, 리소스, 애플리케이션에만 접근할 수 있도록 하는 원칙으로 malware와 같은 공격에 대해 대비할 수 있는 수단이 된다.

### 주체 (Principal)와 객체 (Resource)

|**구분**|**AWS 구성 요소**|**설명**|
|---|---|---|
|**주체**|**User, Group, Role**|AWS 환경에서 활동하는 실질적인 엔티티.|
|**객체**|**Resource**|접근 대상이 되는 AWS 서비스의 자원.|
|**접근 방식**|**Policy**|주체가 객체에 접근할 때 가지는 **권한 명세**.|

### IAM 구성 요소

- **User:** 개별적인 사람을 위한 영구적인 자격 증명.
- **Group:** User들의 집합으로, Group에 Policy를 적용하여 일괄 관리.
- **Role:** 사람/시스템에 부여되어 **임시 자격 증명**을 제공.
    - **시스템(EC2, Lambda 등):** **Instance Profile**을 통해 Role을 부여하여 다른 Resource에 접근할 수 있게 함.
    - **Access Key (API User):** 애플리케이션 등에서 AWS API 접근 시 사용. **보안 사고 방지**를 위해 Role 사용 권장.
    - **Role의 임시 자격 증명:** **Access Key, Secret Key, Session Token**의 세 가지 요소로 구성되며, **최대 12시간**마다 자동 갱신.

### Root Account

- **최상위 권한**을 가지므로 **권한 통제가 불가**하며, 일상적인 작업에 사용하는 것은 **권장하지 않음**.
- ⭐ 모든 작업은 IAM User로 수행해야 함. 이전처럼 루트 계정으로 하는 일은 더는 하지말자 ⭐

### Multi-Account 전략: Organizations

대기업처럼 다수의 Account를 관리할 때 사용되는 AWS 서비스

- **Organization:** 다수의 AWS Account를 중앙에서 관리하는 상위 개념.
- **Organization Unit (OU):** Account들을 논리적으로 그룹화(폴더와 유사)하여 관리. 최대 5단계까지 구성 가능.
- **SCP (Service Control Policy):** Organization 또는 OU에 적용되어 **최대 허용 권한**을 정의. SCP는 **Account에도 적용**되며, **하위 Account에 상속**됨.

### 클라우드 ABAC (Tag 기반 정책)

- 같은 그룹의 Resource에 **Tag**를 부여하고, 이 Tag를 기반으로 정책 통제.
- **IAC (Infrastructure as Code)** 도구 (CDK, Terraform, Pulumi 등)를 사용하여 태깅 일관성을 유지하고 관리 복잡성을 줄임. IAC 도구 없이는 현실적으로 태그 관리가 어렵다.

### 다른 Account 접근 (Cross-Account Access)

- STS (Security Token Service)를 사용하여 Role을 **Assume**하는 방식.
- ex ) Acc A (주체 Account)의 User a가 Acc B (Resource Account)의 Role_b를 Assume하여 B의 Resource에 접근.

### Policy 유형 및 평가 로직

### Policy 유형

|**유형**|**설명**|**관리 용이성**|
|---|---|---|
|**Managed Policy**|AWS 또는 고객이 관리하는 정책. 변경 이력 관리 가능.|높음 (재사용 및 이력 관리)|
|**Inline Policy**|특정 IAM 엔티티(User, Group, Role)에 직접 내장되는 일회성 정책. **변경 이력 관리 불가.**|낮음 (일회성, 관리 복잡)|
|**Resource-Based Policy**|Resource 자체에 연결되어 해당 Resource에 대한 접근을 제어 (예: SQS, SNS, S3, KMS).|특정 Resource에 한정됨|

### 평가의 우선순위

1. explicit deny -> 명시적으로 거부함
2. explicit Allow -> 특정 정책을 만들어서 붙이는 법
3. implicit deny -> 나에게 아무 정책이 없어서 할 수 없음

### AWS 정책 평가 순서

![](https://i.imgur.com/lt24auH.png)

1. **Explicit Deny (명시적 거부)**
    - 어떤 Deny 정책이라도 발견되면 **즉시 접근 거부 (Deny Eval)**.
2. **Organization RCP(Resource Control Policy)**
    - 전체 조직 리소스의 최대 허용 범위를 결정
3. **Organization SCP (Service Control Policy)**
    - 전체 조직의 최대 허용 범위를 결정 (기본적으로 모두 Allow 상태로 시작).
4. **Resource-Based Policy(IAM Policy)**
    - 리소스 기반 정책(S3 등과 같은 서비스에서 직접적으로 붙이는 정책)
5. **Identity-Based Policy (IAM Policy)**
    - User, Group, Role에 연결된 정책.
6. **IAM Permissions Boundary**
    - IAM 엔티티에 할당되어 **최대 권한**을 설정.
7. **Session Policy**
    - Role Assume 시 적용되는 임시 정책.

> 핵심 원칙: 명시적 거부(Deny)가 명시적 허용(Allow)보다 항상 우선하며, 최종 허용을 위해서는 어떤 Deny도 없어야 하고 최소한 하나의 Allow가 있어야 함

### IAM Identity Center

다중 Account 환경에서 중앙 집중식으로 ID와 접근 권한을 관리

- **유저/그룹:** Identity Center 내에서 별도로 관리되는 ID.
- **Permission Set:** IAM Policy들의 집합 (Policy).
- **작동 방식:** User 또는 Group에 **Permission Set**을 할당하면, Account 접속 시 해당 Permission Set에 설정된 **다른 Account의 Role**로 전환하여 접근하게 됩니다.

### KMS (Key Management Service)

암호화 키 관리 서비스입니다. KMS Key Policy는 **Inline Policy** 형태로 구성됩니다.

- **AMK (AWS Managed Key):** AWS가 정책 관리.
- **CMK (Customer Managed Key):** 고객이 정책 관리.

### 💡 Multi-Account 설계 고려사항

- **Resource Based Policy:** Multi-Account 환경에서는 다른 Account의 주체(Principal)가 접근할 수 있도록 **Resource Based Policy**에 명시적으로 `Account A:userA`와 같은 Principal을 설정해야 함
- **중앙화:** **KMS Key**나 **S3 Bucket**과 같은 중요 Resource를 한 곳에 중앙화하여 관리할지 여부를 고려해야 함

---

### AWS상에서의 인증

- AWS Identity and Access Management(IAM) 사용자는 AWS에서 생성하는 엔터티로서 AWS와 상호 작용하기 위해 그 엔터티를 사용하는 사람 또는 애플리케이션
- AWS에서 사용자는 이름과 자격 증명으로 구성

> 인증과 인가 인증 : 클라이언트가 자신이 주장하는 사용자와 같은 사용자인지를 확인 인가 : 클라이언트가 하고자 하는 직업이 해당 클라이언트에게 허가된 작업인지를 확인하는 권한 부여 상태 확인

루트 계정을 그대로 사용할 때는 루트 유저가 너무 많은 권한을 가지고 있기 때문에 이를 조율해서 쓸 수 있어야 함 IAM Role을 사용하면 사용자 권한을 공유하거나 매번 필요한 권한 부여가 불필요하게 되면서 관리가 용이해짐

### 공동 책임 모델(Shared Responsibility Model)

AWS가 제공하는 클라우드의 보안은 AWS가 책임을 지지만, 애플리케이션이나 클라우드 위 보안은 고객이 책임져야 하는 부분임

![](https://i.imgur.com/LggngYv.png)

### AWS에서의 인가

- 모든 AWS 서비스는 접근제어 정책을 기반으로 인가됨
- 매 API 호출 시, 적용된 정책을 통해 인가 수행
- 정책은 IAM 역할/사용자/그룹, AWS 리소스, 임시 자격증명 세션, OU 등에 적용 가능
- AWS Root 어카운트는 기본적으로 AWS 리소스에 대한 모든 권한을 가짐
- AWS 정책은 기본 디폴트가 Deny이고, 명시적 Allow < 명시적 Deny의 우선순위

### 요청의 성공 조건

제출된 요청이 성공하기 위해서

- IAM 보안 주체의 적법한 서명값이 포함(인증)
- AND 조건으로 Permission policy를 보고 권한 확인

### AWS 정책의 JSON 구조

```json
{
	...
	"Statement" : [
	{
		//허용 or 차단
		"Effect" : "Allow or Deny",
		// 어떤 행위를?
		"Action" : [...],
		// 어떤 리소스에 대해서?
		"Resource" : [...],
		// (optional) 어떤 조건에서?
		"Condition" : [...]
	}
	]
}

```

### IAM 정책의 종류
![](https://i.imgur.com/HGY2d4X.png)
### Identity-based Policy와 Resource-based policy

```bash
Identity-based -> 요청하는 주체에게 연결됨
Resource-based -> 요청을 받는 리소스에 연결됨
```

추가적으로 Resource-based에는 **Principal(해당 리소스에 요청을 전달할 수 있는 보안 주체)** 구문이 추가됨. 두 정책의 커버리지는 In-Account(동일 Account) & Cross-Account인지에 따라 다름

![](https://i.imgur.com/7t51RGT.png)


동일 Account -> 합집합의 형태로 검사 Cross Account -> 교집합의 형태로 검사

## IAM 주요 컴포넌트

- IAM Identities
    - IAM Users
    - IAM User groups
    - IAM Roles
- IAM Policy

## IAM Identities
![](https://i.imgur.com/kgrt3Vk.png)

1. IAM 대시보드에서 계정 별칭 만들기
2. Policies에서 정책 만들기
3. 정책을 JSON 에디터를 사용해 추가

```jsx
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "ec2:*",
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                // Env 태그의 dev값이 들어가 있는 ec2 인스턴스에 대해서 추가
                    "ec2:ResourceTag/Env": "dev"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": "ec2:Describe*",
            "Resource": "*"
        },
        {
            "Effect": "Deny",
            "Action": [
                "ec2:DeleteTags",
                "ec2:CreateTags"
            ],
            "Resource": "*"
        }
    ]
}
```

1. 엑세스 관리 - 사용자 그룹에서 그룹 생성
    
    - 그룹 생성 과정에서 직접 만든 정책을 연결시킴
2. 사용자에 가서 사용자 생성
    
    - AWS Management Console에 대한 사용자 액세스 권한 제공 체크
3. 사용자 생성 과정에서 그룹에 사용자 추가해서 이전 단계에서 만든 사용자 그룹을 연결
    
4. 생성된 IAM 사용자 로그인에서 username & password를 통해 로그인하면 EC2에서의 특정 유저에게 특정 권한을 부여해줄 수 있음
    
    ![](https://i.imgur.com/X1auS8H.png)
    
    IAM에서 권한주지 않은 인스턴스에 접근할 때
    

### IAM Policy Simulator

실제로 IAM 테스트하다가 잘못해서 인스턴스 날아가거나 하면 사고이기 때문에 이를 방지하고자 권한을 확인할 수 있는 Simulator를 제공

[policysim.aws.amazon.com](https://policysim.aws.amazon.com/home/index.jsp?#)

특정 그룹을 선택하고 이에 대해서 Action을 정의한 뒤 Run simulation을 하면 이에 대한 결과를 볼 수 있음

## AWS 정책 분류

AWS의 정책 → 권한을 제한하는 Guardrail과 권한을 부여하는 Grant로 나뉨

![](https://i.imgur.com/3y9zUz9.png)


|                 | **SCP 정책 (Organization SCPs)**                                               | **권한 경계 정책 (Permissions boundaries)**                                          | **세션 정책 (Session policies)**                                  |
| --------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| **목적**          | AWS 조직 단위에서 전체적인 보안 정책을 설정하여 **조직 내 모든 계정에 적용**                              | 사용자 또는 역할에 부여된 **권한의 범위를 제한**하고 AWS 리소스의 접근을 제한                                | AWS 리소스에 대한 **일시적인 권한을 제한**하고, 임시로 상황에 따라 권한을 조절              |
| **범위**          | AWS 조직 단위에서 전체적으로 적용됩니다.                                                     | 개별 IAM 사용자 또는 역할에 대한 설정으로, 사용자 또는 역할마다 다르게 설정 가능합니다.                           | IAM 사용자 또는 역할의 세션 동안만 적용되며, 요청이 처리되면 즉시 만료됩니다.                |
| **권한 변경 및 관리**  | AWS 조직 관리자가 조직 SCP 정책을 관리하고 조직 단위로 설정                                        | IAM 정책을 생성하고 사용자 또는 역할에 직접 연결하여 관리                                             | 사용자 또는 역할의 세션 정책은 각 세션에 대해 독립적으로 설정하고 변경                      |
| **예시**          | - 모든 조직 계정에서 특정 서비스의 사용을 금지하는 정책 설정 가능                                       | - 특정 IAM 사용자가 특정 S3 버킷에만 접근할 수 있도록 권한 제한 가능                                    | - 임시로 특정 작업을 수행하는 동안만 특정 리소스에 대한 접근을 허용하는 정책 설정 가능            |
| **적용 시점 및 지속성** | 적용 시점: **정책 설정 시점부터 조직 내 모든 계정**에 즉시 적용됩니다.지속성: 설정이 변경되거나 해제되지 않는 한 지속적으로 적용 | 적용 시점: **IAM 사용자 또는 역할 생성 또는 수정 시점부터** 즉시 적용.                                  | 적용 시점: 사용자 또는 역할이 세션을 시작할 때 즉시 적용 지속성: 세션이 종료되면 자동으로 해제       |
| 용도 및 주요 역할      | - 보안 정책 강화 <br>- 조직 전체의 권한을 일괄적으로 관리<br>- 조직의 최상위 보안 정책                      | - IAM 사용자 또는 역할에 대한 권한을 제한하여 원치 않는 액세스를 방지<br>- IAM 사용자 또는 역할의 범위를 제한하여 리소스 보호 | - 일시적으로 특정 작업에 대한 권한을 부여 <br>- 세션 동안만 필요한 권한을 설정하여 원활한 작업 수행  |
| 주의 사항           | - 신중하게 설정해야 하며, 조직 단위로 적용되므로 모든 계정에 영향을 미침                                   | - 사용자 또는 역할의 권한을 잘 이해하고 설정해야 함<br>- 권한을 제한하면 작업 수행에 제약이 생길 수 있음                | - 세션 정책이 만료되면 자동으로 권한이 해제되므로 관리가 필요함 <br>- 세션 정책을 신중하게 구성해야 함 |


## Guardrail

### 조직 SCP 정책 (Organization SCPs)

- 조직의 권한을 관리하는데 사용할 수 있는 조직 정책 유형
- 조직 내 모든 IAM 사용자 및 IAM 역할에 대해 사용 가능한 최대 권한을 중앙에서 제어

### 권한 경계 정책 (Permissions boundaries)

- 자격 증명 기반 정책(AWS 관리형, 고객 관리형, 인라인)을 통해 IAM 엔티티에 부여할 수 있는 **최대 권한을 설정**
- 엔티티에 대한 권한 경계를 설정할 경우 해당 엔티티는 자격 증명 기반 정책 및 관련 권한 경계 모두에서 허용되는 작업만 수행
- 명시적으로 허용된 넓은 범위의 권한을 특정 사용자 또는 그룹을 대상으로 **허용범위를 제약하는 방법**으로 효과적
- ex) 기존에 AWS 관리형 정책으로 권한을 많이 받았는데 여기서 권한 정책을 통해 허용 범위를 제한시켜버리기
- 자격증명 기반 정책과 권한 경계의 **교집합 부분의 정책만 허용**

### 세션 정책 (Session policies)

## Grant

### 자격증명 기반 정책 (Identity-based policies)

**AWS 관리형 정책 (AWS Managed policies): AWS에서 제공하는 글로벌 적용 가능 정책**

- 독립적인 정책이다 → 스스로 정책 이름이 포함된 ARN(Amazon Resource Name)을 가지고 있다
- ex) `arn:aws:iam::aws:policy/IAMReadOnlyAccess` 처럼 스스로 정책 이름이 포함되어 있음
- 여러 정책이 있으면 합집합 형태로 정책 평가가 됨

![](https://i.imgur.com/Z98kErq.png)

기존에 있던 AWS 관리형 정책을 그대로 부여한 경우이다. 두 개의 계정에서 모두 같은 정책을 AWS 관리형 정책으로 보유하고 있기 때문에 어느 계정에서도 설정이 가능하다.

기존에 있던 AWS 관리형 정책을 그대로 부여한 경우이다. 두 개의 계정에서 모두 같은 정책을 AWS 관리형 정책으로 보유하고 있기 때문에 어느 계정에서도 설정이 가능하다.

**고객 관리형 정책 (Customer Managed policies): 고객이 직접 생성하여 고객 계정에서만 사용 가능한 정책**

- 사용자 자신의 AWS 계정에서 관리할 수 있는 정책 → AWS 계정에 속한 다수의 보안 주체 엔티티에 추가할 수 있음
- Best Practice → AWS에서 관리하는 기존의 정책을 복사하여 시작

![](https://i.imgur.com/bTdantQ.png)

account-admins-mfa,limited-admins-mfa, EC2-access, DynamoDB-books-app 정책 모두 고객이 직접 커스텀한 정책이다

![](https://i.imgur.com/ALUwQsk.png)

AWS 관리형의 경우 앞에 추가적으로 아이콘이 붙어 있다

**인라인 정책 (In-line policies): 단일 사용자 그룹 역할에 직접 추가하는 정책 (재활용 불가)**

- IAM 자격증명(사용자, 그룹 또는 역할)에 포함되는 정책
- 자격 증명을 생성하거나 이후에 생성할 때 정책을 생성하여 자격 증명에 삽입

![](https://i.imgur.com/0uTMEQT.png)
특정 서비스에 대해서 필요한 정책들을 나열한 뒤 사용자에 연결

**실습**

![](https://i.imgur.com/BU4S9kC.png)
- AWS 관리형 정책
    - 그룹
        - Super → 그룹에 AdministratorAccess
        - Dev - > 그룹에 EC2FullAccess
    - 사용자
        - Super-Intern → AdministratorAccess를 받았지만 권한 경계를 통해 AmazonEC2FullAccess까지만 권한이 허용됨
        - Dev-Intern → 인라인 정책으로 S3 목록, 읽기에 대한 정책 허용
        - Super-Pro → AmazonEC2ReadOnlyAccess
    - 리소스 기반 정책
        - S3 → Dev-Intern으로 오는 요청을 모두 허용

### 리소스 기반 정책 (Resource-based policies)

- 지정된 보안 주체에 해당 리소스에 대한 특정 작업을 수행할 수 있는 권한을 부여하고 이러한 권한이 적용되는 조건을 정의
- 같은 계정 내라면, 리소스 기반 정책과 자격증명 기반 정책은 합집합 형태로 정책평가가 이루어짐

### 액세스 제어 리스트 (Access Control Lists, ACLs)

- 액세스를 허용할 AWS 계정이나 그룹과 액세스 유형을 정의
- 리소스에 대한 요청을 수신 → S3에서 해당 ACL을 확인해 요청자가 필요한 액세스 권한을 가지고 있는지 확인

## IAM Role

- 신뢰하는 개체에 권한을 부여하는 방법
- 역할과 사용자 모두 AWS에서 자격 증명으로 할 수 있는 것과 없는 것을 결정하는 권한 정책을 포함한다면, 역할의 경우에는 한 사람과만 연관되지 않고 해당 역할이 필요한 사람이라면 누구든지 맡을 수 있음
- 표준 장기 자격 증명이 없어서 역할 세션을 위한 임시 보안 자격 증명 제공

### RBAC(Role-Based Access Control)

- 여러 권한의 논리적인 집합들을 역할로 만들고 그룹 또는 사용자에게 연결
- 필요에 따라 역할을 부여할 수 있다

### Role Switch 구성

![](https://i.imgur.com/dphuY6s.png)
Dev-Pro가 S3 리소스 기반 정책 삭제를 위해 SuperRole을 생성하고 Dev-Pro에게 할당하여 Dev-Pro가 모든 권한을 수행

- Role을 생성 > 정책을 연결 > 생성된 연결에 대한 ARN 확인 > 새로 만든 역할을 사용하기 위해 서비스 STS 기반의 위임 정책 생성 > AssumeRole에 대한 작업 허용 > 해당하는 role의 ARN 설정 > 사용자에 권한 추가
- 권한 추가 후 추가한 Role을 기반으로 해당 계정에서 역할 전환 > 연결해놓은 Role 이름과 Account ID로 역할 전환
- 역할을 전환하면 기존에 주어진 권한은 모두 사라지고 해당 Role에 할당된 권한만 추가됨

> Amazon STS(Security Token Service) AWS 리소스에 접근이 필요한 사용자나 애플리케이션에 일시적인 보안 자격 증명 제공 STS로 임시 자격 증명을 발급받으면 Access Key, Secret Access Key, Session Token 등이 함께 발급되어 이를 기반으로 리소스에 접근할 수 있다.
> 
> ![](https://i.imgur.com/ecR4hJH.png)


### EC2 인스턴스에 Role 부여
![](https://i.imgur.com/pgO7EWL.png)

사용자가 S3에 직접 접근하는게 아닌, EC2가 대신해서 S3에 접근

- EC2에 S3 읽기 원한을 가진 Role을 생성하고 EC2에 부여
- EC2는 해당 Role을 위임(보안 > IAM 역할 수정)받아 S3에 접근


![](https://i.imgur.com/W4AKvTR.png)
EC2 인스턴스의 역할을 수정하여 해당 리소스에 접근이 가능하도록 설정

![](https://i.imgur.com/q4CPd3v.png)
인스턴스에서 aws s3 리스트를 보면 모두 접근이 가능한 것으로 보임

![](https://i.imgur.com/eCAYPs2.png)
만약에 Role이 설정 안된채로 확인하면 이와 같이 AWS에서 막힘

### IAM 사례
![](https://i.imgur.com/MJSKqHM.png)
EC2가 확장을 위해 Auto Scaling에 접근을 해서 상호작용 or Lambda가 S3에 접근해서 특정 데이터 접근

![](https://i.imgur.com/1MglIGI.png)

IAM User가 아닌 보안주체에게 임시적으로 권한 수행하여 API적인 접근에 대해서 Role을 사용하게 되면 일정 시간 이후 Timeout되는 임시 Credential을 가지고 권한 수행이 가능

### IAM 모범사례

1. AWS 계정 root 사용자 액세스 키 잠금
2. 권한 있는 사용자에게 MFA 활성화
3. 개별 IAM 사용자 만들기
4. 그룹을 사용하여 IAM 사용자에게 권한을 할당
5. 최소 권한 부여
6. 서비스 권한 제어에 역할 사용
7. 역할을 사용하여 권한 위임
8. 자격 증명을 정기적으로 교체
9. 보안 강화를 위해 정책 조건 사용
10. AWS 계정의 활동 모니터링 및 감사