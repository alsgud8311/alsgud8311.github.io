aws 배포를 하게됐다
이전까지는 프론트만 배포하는걸 해봤었는데, 프론트와 서버를 합친 풀스택으로 프로젝트를 배포해보는 좋은 경험을 얻게 되었다.
서버는 express, db는 mysql, 클라이언트는 서버사이드 렌더링 + 클라이언트 사이드 렌더링으로 된 프로젝트로, 내가 실질적으로 서버를 가동시켜야 하는 것은 mysql과 express가 있었다.
mysql같은 경우는 mysql-server를 통해 쉽게 db를 계속 돌릴 수 있었다.
하지만 express의 경우 한번도 안해봤다는게 문제,,,라서 나중에라도 까먹을까봐 배포한 과정을 적어놓으려 한다.
거두절미하고 스타트
## 인스턴스 생성 과정에서
인스턴스 생성 과정에서는 생성 후에 미리 탄력적 ip(elastic ip)를 만들어 할당해놓자.
나중에 만들지 않으면 다시금 접속하는 과정이 귀찮다.

ec2 콘솔의 메뉴에서 `Elastic IP addressses -> Allocate Elastic IP address` 를 통해 고정적으로 IP를 할당해준다. 설정하지 않을 경우 인스턴스 재실행마다 ip가 바뀔 수 있기때문에 고정적인 ip를 사용하는 것이 낫다
![](https://i.imgur.com/bFiJ458.png)

탄력적 IP가 만들어졌으면 `Actions -> Associate Elastic IP Address` 를 통해 인스턴스에 할당해준다.

## ssh 연결하기
ssh 연결은 ec2 인스턴스를 사용한다면 꼭 필요하다
매번 aws 들어가서 할 것도 아니고 애초에 설정 자체가 어렵지 않다
ec2 생성할 때 만든 키페어를 가지고
```shell
ssh -i 키페어.pem Username@PublicIP
```
를 통해 연결해준다.
![](https://i.imgur.com/O8ONpKJ.png)
그럼 이런 식으로 연결이 된다

## 첫 연결 시 locale 설정
의 경우 이 링크를 참고

## Mysql-server
도 이 링크를 참고

## 원격 저장소에서 clone
```shell
git clone 레포지토리 주소
```
나는 private repository로도 한번 만들어 봤는데, 이러한 레포지토리를 clone하기 위해서는 계정 정보 인증이 필요하다.

나는 access token을 부여해서 해당 토큰을 비밀번호로 사용하는 방식을 택했다.

`settings -> Developer settings -> Personal access tokens -> Fine-grain tokens`에 들어가 새롭게 토큰을 발급해주고, 적당한 권한을 설정해준 뒤에 git clone할 때 유저네임을 입력 후 비밀번호 입력란에 발급된 토큰을 입력해주면 clone할 수 있다.

## mvm, nodejs 설치
mvm(node.js 버전 매니저)를 이용해서 node와 딸려오는 npm을 다운로드 할 수 있다.

```shell
# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# download and install Node.js (you may need to restart the terminal)
nvm install 20

# verifies the right Node.js version is in the environment
node -v # should print `v20.17.0`

# verifies the right npm version is in the environment
npm -v # should print `10.8.2`
```

## NGINX 설치 및 실행
```zsh
$ sudo apt-get update
$ sudo apt-get install nginx
아래는 잘 설치되었나 버젼 확인하는것
$ sudo nginx -v
공식 NGINX 리포지토리에서 미리 빌드된 우분투 패키지 설치
$ sudo wget https://nginx.org/keys/nginx_signing.key
```
- `nginx stop`: 빠른 종료
- `nginx quit`: 정상종료
- `nginx reload`: 구성파일 다시 로드
- `nginx reopen`: 로그파일 다시열기
- `nginx restart`: 재시작

nginx를 설치하고 제대로 작동을 시키기 위해서는 nginx의 환경을 설정해줘야 한다.
```shell
sudo vi /etc/nginx/sites-available/default
```
nginx.conf를 통해 Include된 서버 설정 관편 파일을 vi 에디터를 통해 수정해준다.
```shell
server {
	listen 80 default_server;
	listen [::]:80 default_server;
	...
	server_name 서버이름

	location / { 
		# First attempt to serve request as file, then
		# as directory, then fall back to displaying a 404.
		proxy_pass http://127.0.0.1:3000;
		proxy_http_version 1.1;
	}
...
}
```

 - `server_name 서버이름;`
	- 이 서버 도메인으로 들어오는 요청을 처리한다.
	- 해당 도메인으로 접근할 때 Nginx가 이 설정을 사용한다
- `location / { ... }`
	- `location /`은 모든 루트 경로 (`/`)로 들어오는 요청을 처리
-  `proxy_pass http://127.0.0.1:3000;`
	- 들어오는 요청을 `127.0.0.1:3000`으로 프록시(전달)한다
	- 나는 서버를 돌릴 때 3000 포트로 돌렸기 때문에 3000포트로 프록시를 전달하도록 했다
-  `proxy_http_version 1.1;`
	- Nginx가 프록시 요청을 보낼 때 HTTP 1.1 버전을 사용하도록 지정
변동 사항을 적용시키기 위해서는 재시작 해준다.
```shell
sudo systemctl restart nginx
```

## pm2 설치
pm2는 프로세스 관리자로 Node.js로 만들어진 프로그램의 프로세스를 편리하게 관리할 수 있도록 도와주며 아래와 같은 기능을 제공한다.
- 프로그램 종료시 자동 재시작
- 코드 변경 시 프로세스 재시작
- 로그 화면 지원
먼저 전역적으로 Pm2 사용을 위해 설치해준다.
``` shell
$ npm install pm2 -g
```
슬만한 명령어는 이정도가 있다
- `pm2 start` [name] : 시작
- `pm2 list` : 목록
- `pm2 stop id|name|namespace|all|json|stdin` : 종료
- `pm2 delete id|name|namespace|all|json|stdin` : 제거
- `pm2 start [name] --watch` : 코드 변경시 프로세스를 재시작
- `pm2 log `: 로그 확인

