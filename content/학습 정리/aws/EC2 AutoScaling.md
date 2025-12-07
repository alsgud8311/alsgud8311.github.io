
![](https://i.imgur.com/YDv1bVk.png)


### 시작하기 전

> 특정 인스턴스를 트래픽에 따라 새로 띄울려면 이에 따른 템플릿이 필요함 CloutFormation을 통해 오토 스케일링 그룹을 위한 AMI(Amazon Machine Image) 생성한 다음 로드밸런서 뒤에서 인스턴스를 자동 확장

### 시작 템플릿 생성하기

EC2 Auto Scaling을 구성하는 3가지 주요 구성 요소

- **시작 템플릿(Launch Template):** 시작 템플릿은 시작 요청을 템플릿화하는 방법을 허용하는 EC2 Auto Scaling의 기능입니다. 이를 통해 인스턴스를 시작할 때마다 지정할 필요가 없도록 시작 매개변수를 저장할 수 있습니다. 예를 들어 시작 템플릿에는 일반적으로 인스턴스를 시작하는 데 사용하는 특정 Amazon 머신 이미지, 인스턴스 유형, 스토리지 및 네트워킹 설정이 포함될 수 있습니다. 각 시작 템플릿에 대해 하나 이상의 번호가 지정된 시작 템플릿 버전을 생성할 수 있습니다. 각 버전에는 다른 시작 매개변수가 있을 수 있습니다.
- **Auto Scaling 그룹:** Auto Scaling을 위해 EC2 인스턴스는 그룹으로 구성되어 확장 및 관리 목적으로 논리적 단위로 취급될 수 있습니다. 그룹을 생성할 때 최소, 최대 및 원하는 EC2 인스턴스 수를 지정할 수 있습니다.
- **조정 정책(Scaling Policies):** 조정 정책은 Auto Scaling에서 조정 시기와 방법을 알려줍니다. 조정은 일정에 따라 요청 시 수동으로 수행하거나 Auto Scaling을 사용하여 특정 수의 인스턴스를 유지할 수 있습니다.

Auto Scaling은 시간별, 일별 또는 주별 사용량 변동을 경험할 수 있는 예측할 수 없는 수요 패턴이 있는 애플리케이션에 적합합니다. 이를 통해 비용을 관리하고 필요하지 않은 시간에 용량의 과잉 프로비저닝을 제거할 수 있습니다. Auto Scaling은 또한 비정상 인스턴스를 찾아 해당 인스턴스를 종료하고 확장 계획에 따라 새 인스턴스를 시작할 수 있습니다.

Auto Scaling이 이러한 그룹을 생성할 때 정의한 지표에 응답함에 따라 EC2 인스턴스의 수를 축소 또는 축소할 수 있습니다.

- 그룹이 설정한 크기 아래로 떨어지지 않도록 각 Auto Scaling 그룹의 최소 인스턴스 수를 지정할 수 있습니다. (인스턴스가 비정상인 경우에도)
- 그룹이 설정한 크기를 초과하지 않도록 각 Auto Scaling 그룹의 최대 인스턴스 수를 지정할 수 있습니다.
- 원하는 용량을 지정하여 Auto Scaling 그룹이 항상 보유해야 하는 정상 인스턴스 수를 지정할 수 있습니다. (자세한 정보는 [여기서](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-maintain-instance-levels.html)  확인하실 수 있습니다)
- Auto Scaling이 이전 지점에서 언급한 원하는 목표 용량을 수정하도록 조정 정책을 지정할 수 있습니다. 애플리케이션에 대한 수요가 증가하거나 감소하면 인스턴스를 시작하거나 종료합니다.

### 시작 템플릿 생성하기

- 시작 템플릿 고급 설정에서 CloudWatch 세부 모니터링을 활성화하면 CloudWatch가 1분 간격으로 Auto Scaling 그룹의 인스턴스를 모니터링

### 타겟 그룹 생성

- 로드 밸런싱 → 대상 그룹 선택
- 타겟 타입 → 인스턴스
- VPC 확인
- HealthCheck 라우트 확인
- Advanced Health Check Settings → 세부 임계값 설정
- 시작 템플릿 생성됨

### 로드 밸런서 & 오토 스케일링 그룹 생성

> 시작해야 할 EC2 인스턴스의 수와 시작 위치를 정의할 수 있도록 오토 스케일링 그룹을 생성

- Auto Scaling 그룹 생성
- 이전에 만들어 뒀던 템플릿 선택
- Configure settings 중 네트워크 구성
    - VPC: 이전에 launch template에서 선택한 VPC를 **선택** (대부분 Default)
    - Availability Zones and subnets: auto scaling group이 확장 시 호스트를 생성하는 데 사용할 subnet을 **선택** (default VPC를 사용하는 경우 아래와 같이 4개의 subnet)
    - Availability Zone distribution: **Balanced only**

> 오토 스케일링의 모범 사례는 **프라이빗 서브넷(Private subnet)만 선택하는 것.** 인스턴스는 로드 밸런서 뒤에 위치하므로 퍼블릭(Public) IP 주소가 필요없음.

- 로드 밸런싱(Load balancing) 및 헬스 체크 지정:
    - a. _Load balancing_: **Attach to a new load balancer**
    - b. _Load balancer type_: **Application Load Balancer**
    - c. _Load balancer name_: `[본인 이니셜]-Application-Load-Balancer`
    - d. _Load balancer scheme_: **Internet-facing**
    - e. _Networking mapping_: 이전 단계에서 선택한 모든 가용영역(Availability Zone)과 서브넷이 표시되어야 합니다. (가용영역당 여러 서브넷이 있는 경우 여기서 선택할 수 있습니다)
    - f. _Listeners and routing_: Port를 80으로 유지하고 "Default routing (forward to)" 드롭다운에서 **ABC-Target-Group | HTTP**를 선택합니다. - 타겟 그룹은 로드 밸런서가 트래픽을 분산할 인스턴스를 찾는 곳입니다. 오토 스케일링 그룹이 이 그룹에 자동으로 인스턴스를 등록하도록 설정하고 로드 밸런서에도 연결됩니다.
    - g. _Health checks & Additional settings_: 기본값으로 두고 **Next**를 선택합니다.
- _Group Size_: 아래 설정은 scaling 정책이 트리거되지 않는 한 그룹 크기를 EC2 인스턴스 1개로 유지하는게 좋음
    - Desired capacity: `1`
- _Scaling_:
    - Min desired capacity: `1`
    - Max desired capacity: `5`
    - **Target tracking scaling policy** 선택
    - Metric type: **Average CPU utilization**
    - Target Value: `25` (빠르게 실행되는걸 테스트하기위한 용도)

> 주로 몇퍼센트정도를 스케일아웃하는 퍼센티지로 삼을까?

- 알림 추가:
    - 선택한 이메일 주소와 같은 엔드포인트로 알림을 보내도록 오토 스케일링 그룹을 구성
    - 인스턴스 시작 성공, 인스턴스 시작 실패, 인스턴스 종료, 인스턴스 종료 실패 등 지정된 이벤트가 발생할 때마다 알림
- 태그 추가
    - **Add tag** 버튼을 선택하고 다음을 구성합니다:
        - Key: `Name`
        - Value: `[본인 이니셜] - Auto Scaling Group`
        - 설정을 검토한 다음 **Create Auto Scaling group**을 선택합니다. 이제 오토 스케일링 그룹, 타겟 그룹 및 로드 밸런서를 생성했습니다.
            - EC2 콘솔에서 오토 스케일링 그룹이 생성한 새 인스턴스가 "[본인 이니셜] - Auto Scaling Group"이라는 이름 태그와 함께 곧 표시됩니다. (인스턴스를 보려면 화면을 새로 고쳐야 함)
            - 왼쪽 메뉴의 "Load Balancing" 아래에서 **Load Balancers**를 선택하면 로드 밸런서가 프로비저닝됨

![](https://i.imgur.com/JDrG3W2.png)


### 로드 밸런서 보안 그룹 생성

- 로드 밸런서가 프로비저닝될 때 VPC의 "Default security group"으로 설정됨. 퍼블릭 DNS를 통해 로드 밸런서에 접근할 수 있도록 하기 위해 인바운드 트래픽(Inbound traffic)을 포트 80에서 인터넷으로부터 허용하는 보안 그룹을 생성하고 연결해야 함

> 모범 사례로, 로드 밸런서에서 나가는 트래픽이 "Auto Scaling security group"을 사용하는 호스트로만 전송되도록 제한하는 아웃바운드 규칙(Outbound rule)도 생성하는게 좋다

**Create security group** 버튼을 선택합니다.

1. Basic details:
    a. _Security group name_: `[본인 이니셜]-SG-Load-Balancer`
    b. _Description_: `[본인 이니셜]-SG-Load-Balancer`
    c. _VPC_: VPC 선택 (대부분 "Default VPC")
    
2. 인바운드 규칙(Inbound rule):
    a. **Add rule** 버튼 클릭
    b. _Type_: `HTTP`
    c. _Source_: Custom: `[공인 IP 주소 뒤에 /32를 붙여 입력]` - 이 사이트에서 로컬 IP를 확인할 수 있습니다: [AWS Check IP](https://checkip.amazonaws.com/)
    
3. 아웃바운드 규칙(Outbound rule):
    a. "Type"이 **All traffic**인 규칙을 **HTTP**로 변경합니다.
    b. "Destination" 아래에서 **Custom**을 선택하고 필드에서 **[본인 이니셜]-Auto Scaling SG**를 "Destination"으로 선택합니다. 힌트: 사용 가능한 보안 그룹을 보려면 목록을 아래로 스크롤하세요.
    c. 보안 그룹 구성이 아래 이미지와 비슷해야 합니다. 완료되면 **Create security group**을 선택합니다.
    
4. 새로운 "Load Balancer Security group"을 로드 밸런서에 연결:
    a. EC2 서비스 페이지 왼쪽 메뉴에서 "Load Balancing"을 찾아 **Load Balancers**를 선택합니다. 생성한 로드 밸런서를 선택(State가 "Active"인지 확인)
    b. 로드 밸런서 "Details" 페이지에서 **Security** 탭을 선택한 다음 **Edit** 버튼을 선택합니다.
    c. **[본인 이니셜] - Auto Scaling SG** 이름의 보안 그룹을 제거하고 "Security groups" 드롭다운에서 **[본인 이니셜]-SG-Load-Balancer**를 선택합니다.
    

> 현재는 인바운드가 내 주소로만 설정, 아웃바운드는 HTTP만 나갈 수 있게 해서 오토 스케일링 그룹 쪽으로 트래픽이 잘 가도록 설정된 상태

![](https://i.imgur.com/UVCYdFH.png)

### Auto Scaling Security Group에 인바운드 규칙 추가하기

> 새로운 "Load Balancer Security Group"에서 "Auto Scaling Security Group"으로만 트래픽을 허용하는 규칙을 설정해야 합니다. 이는 웹 호스트가 인터넷에서 직접 액세스되는 것을 방지하는 보호 계층 중 하나가 될 것입니다.

1. 인바운드 규칙 추가하기
    a. EC2 서비스 페이지 왼쪽 메뉴의 "Network & Security" 아래에서 **Security Groups**를 선택합니다.
    b. "Auto Scaling Security Group"을 선택
    c. **Inbound Rules** 탭을 선택하고 **Edit inbound rules** 버튼을 클릭한 다음 **Add rule** 버튼을 클릭합니다.
    d. "Type" 드롭다운에서 **HTTP**를 선택합니다. "Source"에서 **Custom**을 선택하고 필드에 **[본인 이니셜]-SG-Load-Balancer**를 "Source"로 지정합니다.
    - SG-Load-Balancer의 인바운드 → 모든 HTTP
    - 오토 스케일링 그룹에 그대로 로드 밸런스의 트래픽이 오도록 해당 보안 그룹을 인바운드 규칙으로 설정
2. 로드 밸런서 체크
    - 왼쪽 메뉴에서 **Load Balancers**를 선택하여 로드 밸런서 페이지로 돌아갑니다. "Description" 탭에서 DNS 이름을 **복사**하여 웹 브라우저에 **붙여넣기**
    - 해당 사이트에서 부하 테스트 확인


현재 아키텍처

![](https://i.imgur.com/lxasCV5.png)


이름 있는게 로드 밸런서 → 로드 밸런서로 부하가 몰리면 오토스케일링 그룹으로 설정해둔 이미지들이 자동으로 뜨면서 로드 밸런서에서 부하를 분산시켜 놔줌