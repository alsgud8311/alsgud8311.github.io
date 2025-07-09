# 가상머신 리눅스 - 체크리스트
- 가상 환경 설치하기
	- ssh 설정해서 원격 접속
	- 사용자 추가하기
	- 생성된 사용자로 scrap 디렉토리 생성
	- scrap 디렉토리 권한 변경
- 미션 과제 실행하기
	- nodejs 설치
	- nodejs를 이용하여 미션 파일 실행

# 가상 환경 설치하기
가상환경 설치는 UTM이라는 가상머신을 설치한 후에 리눅스(우분투)를 설치한다.
```
Ubuntu 다운 -> UTM 다운 -> UTM 실행하여 Ubuntu 설치 -> UTM을 통한 Ubuntu 실행
```
https://mirror.kakao.com/ubuntu-releases/noble/
그냥 우분투를 다운로드 받으면 엄청 오래 걸린다는데 다행히도 어떤 분이 미러사이트의 존재를 알려주셨다
https://velog.io/@zihooy/M1-Mac-UTM-Linux-Ubuntu
해당 벨로그를 참고해서 가상환경을 설치했다. 
![](https://i.imgur.com/92le2CK.png)
설치가 된 후 로그인하여 여러가지 명령어들을 실행해보았다.
## SSH 연결
### 저장소 업데이트

```shell
	sudo apt update
```

### openssh-server 설치

```shell
	sudo apt install openssh-server
```

### ssh 실행 상태 체크

```shell
	sudo systemctl status ssh
```

### 방화벽

사용하는 서버 PC에 방화벽이 존재한다면 방화벽에 ssh를 추가해주어야 한다.

#### 방화벽 사용 확인

방화벽을 사용하고 있으면 아래 명령어 결과에 active, 사용하지 않으면 inactive가 결과로 나타난다.

```shell
	sudo ufw status
```

나는 방화벽이 없어 방화벽 추가만 해뒀다.

#### 방화벽 추가

```shell
	sudo ufw allow ssh
```

#### 방화벽 리로드

```shell
	sudo ufw reload
```

### iterm에서 연결
iterm(터미널)을 키고 
```shell
ssh username@ip주소
```
를 치고 우분투와 연결하였다.

```shell
ip a
```
를 우분투에서 치고 inet 옆의 ip주소를 사용하면 된다.

![](https://i.imgur.com/cJCNQzx.png)
ssh 연결이 되었다!

기세를 몰아 서버 유저 추가까지 해봤다
```shell
 1. 지정된 경로에 유저 생성
 sudo useradd mh -d /home
 2. 패스워드 설정
 sudo passwd 유저ID
 3. 유저 추가 확인하기
 sudo  vi etc/passwd
```

![](https://i.imgur.com/lyOnUBA.png)
/home 경로에 mh가 정상적으로 추가되었다.
사용자를 추가한 다음 터미널에 켜져 있는 원래 있던 유저를 끄고 새롭게 만든 유저로 연결시켜 주었다.
![](https://i.imgur.com/y3Bfjkf.png)

scrap 폴더를 mh 사용자에서 만들려고 했는데 권한 문제가 발생하여 
`sudo chown -R mh /home` 명령어로 권한을 부여했다. (sudo 빼서 한번 실패)
![](https://i.imgur.com/bcDQUsx.png)

### 접근 권한 바꾸기
`chmod 764 scrap` 명령어를 통해서 해당 폴더에 대해 권한을 부여했다.
764 권한의 경우 8진수로 된 명령어로, 각 숫자가 의미하는 바는 권한을 주는 대상이다. 764의 경우는
- 소유자(owner): 읽기(r), 쓰기(w), 실행(x) 권한 (7 = 4+2+1)
- 그룹(group): 읽기(r), 쓰기(w) 권한 (6 = 4+2)
- 기타 사용자(others): 읽기(r) 권한 (4)
로 권한을 부여하겠다는 것이다.


![](https://i.imgur.com/KE7gfkV.png)

### 시간 변경
ubuntu 내의 시간을 `hwclock -w`와 `timedatectl set-timezone Asia/Seoul` , `rdate -s time.bora.net`명령어를 실행하여 서울의 시간으로 맞춰주었다. 
![](https://i.imgur.com/yQx4oih.png)

![](https://i.imgur.com/Yas62Nr.png)
터미널에서도 똑같이 잘 뜬다.

# 미션 과제 실행하기
## 우분투에 Nodejs 설치하기
curl을 설치하고 `sudo apt install nodejs`를 통해 nodejs를 다운받았다.
설치하면서 npm 또한 다운로드 받아주었다.
![](https://i.imgur.com/m39x8iG.png)

이후 `vim mission_1.js` 를 통해 터미널의 우분투에서 js 파일을 만들고 코드를 복사하여 실행시켰다.
정상적으로 결과가 나오는 것을 볼 수 있다.
![](https://i.imgur.com/R8vk3Aa.png)

# 쉘 스크립트 - 체크리스트
- 리눅스 쉘 스크립트 명령어 연습
- 쉘 스크립트 과제 설계 & 구현
	- 케이스1 설계 & 구현
	- 케이스2 설계 & 구현
	- 케이스3 설계 & 구현
- crontab 설정 및 동작 방식

## 쉘 스크립트 과제 설계
### 케이스 1 설계
#### cpu 사용률 가져오기
```shell
# 현재 CPU 사용률 계산
CPU_USING=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
```
CPU 사용률의 경우 top을 통해 조회가 가능하다.
파이프대로 말하자면
- top을 통해 조회해서 나온 결과 중에서 첫번째 줄을 다음 파이프로 넘긴다
- `grep`을 통해 Cpu(s)를 포함한 뒤의 문자열들을 가져와 다음 파이프로 넘김
- sed를 통해 id(사용하지 않는 cpu의 비율)의 값을 정규표현식을 통해 걸러낸다.
- 해당 값을 100에서 빼서 현재 사용중인 cpu의 비율을 계산한다.
#### 웹훅 실행
- 해당 cpu 사용률이 만약 70%가 될 경우, cpu가 연속으로 70%이상일 때를 기록하는 변수를 잡고, 1분마다 실행되므로 3을 넘게 되면 웹 훅을 실행하도록 설계산
```sh
# 횟수 초과(3번) + CPU 사용률이 또 70%가 넘었을 경우 웹훅 실행
if [ $CPU_USING -gt $ACTIVE_CPU_THRESHOLD ] && [ $CPU_THRESHOLD_COUNT -ge $THRESHOLD_COUNT ]; then
    curl -X POST -H 'Content-type: application/json' --data '{"text":"J238 CPU is now ALARM: usage is over 70%"}' $WEBHOOK_URL
elif [ $CPU_USING -gt $ACTIVE_CPU_THRESHOLD ]; then
    CPU_THRESHOLD_COUNT=$((CPU_THRESHOLD_COUNT + 1))
    echo "$CPU_THRESHOLD_COUNT $(awk '{print $2}' "$LOG") $(awk '{print $3}' "$LOG") $(awk '{print $4}' "$LOG")" > "$LOG"
else
    CPU_THRESHOLD_COUNT=0
        echo "$CPU_THRESHOLD_COUNT $(awk '{print $2}' "$LOG") $(awk '{print $3}' "$LOG") $(awk '{print $4}' "$LOG")" > "$LOG"

fi
```
- 횟수의 경우 로그에 저장하고 계속해서 가져오는 방식으로 설계
- 횟수를 초과하지 않았지만 사용률이 기준보다 이상이면 카운트 올리기
- CPU 사용률이 70% 아래로 떨어지면 다시 카운트를 0으로 되돌리기


### 케이스 2 설계
#### 가상 메모리 사용률 가져오기
```sh
# 현재 메모리 사용률 계산
MEMORY_USING=$(free | grep Mem | awk '{print $3/$2 * 100}')
```
파이프대로 설계했을 때
- free를 통해 조회해서 나온 결과를 파이프로 보냄
- Mem을 포함하는 row만 뽑아내어 다음 파이프로 보냄
- awk를 통해 $3(현재 사용중인 메모리)/$2(총 메모리) 에 100을 곱해서 비율을 계산한다.
#### 웹훅 실행
- 해당 메모리의 active 메모리 사용량이 50%가 될 경우, 메모리가 연속으로 50%이상일 때를 기록하는 변수를 잡고, 1분마다 실행되므로 3을 넘게 되면 웹 훅을 실행하도록 설계
- free 명령어를 통해서 현재 메모리의 사용률에 대해 알 수 있다.
```sh
# 누적횟수 초과(3번) + 메모리 사용률이 또 50%를 넘겼을 때 웹훅 실행
if [ $MEMORY_USING -gt $ACTIVE_MEMORY_THRESHOLD ] && [ $MEMORY_THRESHOLD_COUNT -ge $THRESHOLD_COUNT ]; then
    curl -X POST -H 'Content-type: application/json' --data '{"text":"J238 MEMORY is now ALARM: usage is over 50%"}' $WEBHOOK_URL
elif [ $MEMORY_USING -gt $ACTIVE_MEMORY_THRESHOLD ];then
    MEMORY_THRESHOLD_COUNT=$((MEMORY_THRESHOLD_COUNT + 1))
        echo "$(awk '{print $1}' "$LOG") $MEMORY_THRESHOLD_COUNT $(awk '{print $3}' "$LOG") $(awk '{print $4}' "$LOG")" > "$LOG"
else
    MEMORY_THRESHOLD_COUNT=0
        echo "$(awk '{print $1}' "$LOG") $MEMORY_THRESHOLD_COUNT $(awk '{print $3}' "$LOG") $(awk '{print $4}' "$LOG")" > "$LOG"
fi
```
- 횟수의 경우 로그에 저장하고 계속해서 가져오는 방식으로 설계
- 횟수를 초과하지 않았지만 사용률이 기준보다 이상이면 카운트 올리기
- CPU 사용률이 70% 아래로 떨어지면 다시 카운트를 0으로 되돌리기

### 케이스 3 설계
#### 네트워크 RX, TX 사용량 가져오기
RX,TX는 가져오는게 까다로워 이걸 함께 가져오기보다는 따로 가져와서 계산을 했다.
```shell
ACTIVE_RXTX_THRESHOLD_MB=10485760

PREV_RX_USED=0
PREV_TX_USED=0

# RXTX_LOG 파일이 존재하는지 확인하고, 존재하면 이전 RX/TX 값을 읽음
if [ -f "$RXTX_LOG" ]; then
    PREV_RX_USED=$(awk '{print $1}' "$RXTX_LOG")
    PREV_TX_USED=$(awk '{print $2}' "$RXTX_LOG")
fi

# 현재 RX/TX 사용량 계산 (MB 단위로 변환)
RX_USING=$(ifconfig | grep 'RX' | grep bytes | head -n 1 | awk '{print $5}')
TX_USING=$(ifconfig | grep 'TX' | grep bytes | head -n 1 | awk '{print $5}')

# RX/TX 사용량 차이 계산
RX_DIFF=$((RX_USING - PREV_RX_USED))
TX_DIFF=$((TX_USING - PREV_TX_USED))
RXTX_DIFF=$((RX_DIFF + TX_DIFF))

if [ $RXTX_DIFF -gt $ACTIVE_RXTX_THRESHOLD_MB ]; then
    echo "두 값이 임계치 이상입니다"
    echo "$RX_DIFF, $TX_DIFF"
else
    echo "이하임"
    echo "$RXTX_DIFF"
fi

# 현재 RX/TX 사용량을 로그 파일에 저장
echo "$RX_USING $TX_USING" > "$RXTX_LOG"
```
사실상 RX/TX 계산이 까다로워서 대부분의 코드를 차지했다.
주요 로직은
- 미리 0으로 초기화시켜놓고 로그에서 RX,TX 가져오기
- RX/TX 각각 차이를 계산하여 더한 다음, 10MB보다 큰지 확인
- 마지막에는 새로 가져온 RX/TX 값을 로그로 기록하기
로 설계했다.
`ifconfig` 명령어를 사용하면 RX/TX의 byte값을 뽑아올 수 있어 해당 명령어로 파이프를 보내
- RX/TX 라인 뽑아서 옆으로 보내기
- bytes 가 포함된 부분을 뽑아서 옆으로 보내시
- 해당 줄에서 다른 lo(가상 이더넷 장치라고 한다.)를 제외해야 해서 첫 줄만 뽑아서 파이프로 보내기
- bytes로 표현된 숫자만 추출 (5번째)
로 하였다. 
위 코드는 if else문 연습과 제대로 작동하는지 확인하기 위해 잠깐 만들어 놓았다.
#### 웹훅 실행
- 네트워크 RX, TX 사용량이 1분당 10MB이상 사용되었다면, 웹 훅을 보내도록 설계
- 해당 조건은 한번 이상 기준량을 초과하면 바로 웹훅을 보내야 하므로 따로 카운트를 만들지 않음
```sh
# 이전보다 10MB 이상 더 크게 차이날 때 웹훅 실행
if [ $RXTX_DIFF -gt $ACTIVE_RXTX_THRESHOLD_MB ]; then
    curl -X POST -H 'Content-type: application/json' --data '{"text":"J238 NETWORK RX/TX  is now ALARM: usage per Minute is over 10MB"}' $WEBHOOK_URL
fi
```

### Crontab 동작 방식 확인

`crontab -e`를 통해 내가 만든 쉘스크립트를 매 분마다 실행시켜 줄 수 있도록 앞에 `* * * * *`를 붙였다. 
1분정도 지나고 다시 로그를 보니 RX/TX가 바뀐 것을 보아 정상적으로 작동되고 있음을 알 수 있었다.


Stress를 설치하여 메모리와 CPU 부하 테스트를 진행한 결과 로직대로 잘 움직여 3번 이상부터는 알람이 간 것을 확인했다!
![](https://i.imgur.com/HDTGAsU.png)
