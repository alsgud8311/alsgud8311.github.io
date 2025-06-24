---
title: Docker에서 환경변수가 제대로 올라가지 않는 문제 고치기
created: 2025-06-23 23:26
updated: 2025-06-23 23:26
tags: []
categories: []
aliases: []
description: ""
status: "draft" # draft, in-progress, completed
---
## 문제 상황
꼬꼬면에서 환경변수가 제대로 올라가지 않는 문제가 있었다.
기존의 환경변수는 Dockerfile에서 올려서 사용할 수 있도록 했었는데, 이전까지는 환경변수를 제대로 사용하지 않았다 보니까 문제를 몰랐었는데 이제서야 알게 되었던 자신을 반성하며...

## 해결

```yaml
version: "3.8"

services:
  client:
    build:
      context: .
      dockerfile: ./apps/client/Dockerfile
      args:
        NEXT_PUBLIC_BASE_URL: ...
        NEXT_PUBLIC_API_BASE_URL: ...
    container_name: kokomen-client
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
    restart: always

  nginx:
		...
```
Compose할 때 필요한 yaml파일의 설정에서 `build`의 `args` 설정으로 환경변수를 두었고, 이를 `Dockerfile` 에서 선언한 후에 compose에서 전해준 args로 사용할 수 있도록 하였다.
```yaml
...

ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN yarn install

WORKDIR /app/apps/client
RUN yarn build

WORKDIR /app
CMD ["yarn", "client:prod"]
```

## 추가 알아 둘 것들
`NODE_ENV`는 해당 ENV가 읽히는 환경을 의미하고, `NEXT_PUBLIC` prefix가 붙은 것들은 클라이언트에서 노출되는 환경변수이다.
### NODE_ENV

- **서버 사이드에서만** 접근 가능
- Node.js 런타임 환경을 구분하는 표준 환경변수
- 값: `development`, `production`, `test` 등
- 브라우저(클라이언트)에서는 접근 불가

```javascript
// 서버 사이드에서만 동작
if (process.env.NODE_ENV === 'production') {
  // 프로덕션 환경 로직
}
```

이 NODE_ENV의 경우에는 대부분 프레임워크의 커맨드를 사용할 때, 자동으로 설정된다.
```
# Create React App
npm start      # NODE_ENV=development 자동
npm run build  # NODE_ENV=production 자동

# Express.js 등
npm run dev    # 보통 development
npm start      # 보통 production

# Next
npm run dev    # NODE_ENV=development 자동 설정
npm run build  # NODE_ENV=production 자동 설정
npm run start  # NODE_ENV=production 자동 설정
```
### NEXT_PUBLIC_ prefix

- **클라이언트(브라우저)와 서버 양쪽**에서 접근 가능
- Next.js가 빌드 시점에 클라이언트 번들에 포함시킴
- 브라우저에서 실행되는 JavaScript 코드에서 사용 가능

```javascript
// 클라이언트/서버 양쪽에서 동작
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// 브라우저의 개발자 도구에서도 확인 가능
console.log(process.env.NEXT_PUBLIC_API_URL);
```