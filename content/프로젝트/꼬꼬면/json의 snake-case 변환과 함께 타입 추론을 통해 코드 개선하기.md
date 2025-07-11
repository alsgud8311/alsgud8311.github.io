---
title: json의 snake-case 변환과 함께 타입 추론을 통해 코드 개선하기
created: 2025-07-11 10:57
updated: 2025-07-11 10:57
tags:
  - 타입스크립트
  - 개발
categories: 
aliases: 
description: ""
status: draft
---
# JSON의 스네이크 케이스에서 카멜 케이스로 변환과 함께 타입 추론을 통해 코드 개선하기

## 들어가며

API 서버와 클라이언트 간의 데이터 통신에서 네이밍 컨벤션의 차이는 흔히 마주치는 문제이다. 특히 백엔드에서는 snake_case를, 프론트엔드에서는 camelCase를 사용하는 경우가 많기 때문에 사전에 미리 말을 해놓지 않으면 어느샌가 API 명세에는 무수한 스네이크 케이스를 마주할 수 있다.

물론 이렇게 되지 않기 위해 1차적으로 프론트-백간의 소통을 통해 이러한 프로퍼티들에 대해서 사전에 협의를 하는 것도 좋은 습관이라고 생각한다(이번에 배웠다).

하지만 나의 경우, 이전까지 작업한 것도 많았을 때에 코드 리뷰를 통해서 `컨벤션이 제대로 통일되지 않기 때문에 한번 매핑을 해주면 좋다` 라는 리뷰를 받았지만 백엔드 역시 다른 작업할 것들이 태산이기 때문에 따로 바꾸지 못했다. 따라서 프론트엔드에서 한번 매핑해서 스네이크 케이스를 카멜 케이스로 변환한 뒤 사용하기로 했었는데, 코드 중복의 문제를 비롯한 여러 문제를 마주해서 이를 조금 더 개선할 수 있는 방향을 찾았고, 이에 타입 안정성을 유지하면서도 코드 중복을 최소화하는 방법을 소개한다.

## 기존 방식의 문제점

### 문제 1: 타입 중복 정의

기존에는 API 응답과 클라이언트 사용을 위해 동일한 데이터 구조를 두 번 정의했었다. 
사실 타입을 제대로 다루지 못했기 때문에 일어난 일이라고 생각한다.

```typescript
// 예시
// API 응답용 타입
interface UserInfoResponse {
  user_id: number;
  user_name: string;
  created_at: string;
  profile_image: string;
}

// 클라이언트 사용용 타입
interface UserInfo {
  userId: number;
  userName: string;
  createdAt: string;
  profileImage: string;
}
```

이렇게 되니 결국 `types` 디렉토리에 정리해놓았던 타입들이 점점 많아지면서 API Response와 클라이언트용을 구별하기 어려웠고, 굳이 이를 위해 `client.ts` / `server.ts` 등으로 파일을 나누어 정리하는 방식을 사용한다 하더라도 어디에서 무슨 타입인지 추적하기 위해서는 결국 두 타입이 나뉘어져 있기 때문에 대부분 이곳저곳 들춰보는 일이 잦았고, 이에 사용하는데 불편함을 겪었다. 

### 문제 2: 런타임 변환 로직의 복잡성

위 문제와 연결되는 문제로, 클라이언트 사용용 타입을 위해 각 타입마다 별도의 변환 함수를 작성해야 했다.

```typescript
function convertUserApiToUser(apiUser: UserApiResponse): User {
  return {
    userId: apiUser.user_id,
    userName: apiUser.user_name,
    createdAt: apiUser.created_at,
    profileImage: apiUser.profile_image,
  };
}
```
결국 이러한 런타임 변환 로직 함수의 경우 모든 `api Response`에 대해서 작성해야 했기 때문에, 코드 자체가 너무 많아지는 문제 또한 생겼다.

### 문제 3: 유지보수성 저하

무엇보다 이러한 방식의 가장 문제는 유지보수성이 급격하게 떨어진다는 점이다. 
API 응답 구조가 변경될 때마다 두 개의 타입과 변환 함수를 모두 수정해야 했고, 각 타입을 수정하는 과정에 실수가 하나 있으면 이를 추적하기 위한 리소스가 들어가면서 개발 효율성을 떨어뜨렸다.


### As-is와 To-be
위에 말했던 내용이 As-is고, To-Be는

```ts
interface UserApiResponse {
  user_id: number;
  user_name: string;
  user_profile: {
    profile_image: string;
    created_at: string;
  };
}

// 클라이언트 타입은 자동으로 추론
type User = CamelCasedProperties<UserApiResponse>;
// 결과: { userId: number; userName: string; userProfile: { profileImage: string; createdAt: string; } }

```
이처럼 유틸리티 타입을 통해 자동으로 추론할 수 있도록 만들어 기존 타입 명시에 필요했던 코드를 50% 줄이는 것이다.
## 해결 방안: 타입 레벨 변환

### 핵심 아이디어

TypeScript의 템플릿 리터럴 타입과 조건부 타입을 활용하여 컴파일 타임에 snake_case를 camelCase로 변환하는 유틸리티 타입을 구현하고, 해당 타입을 사용하여 변환해주는 함수를 만들기로 했다.
이상적으로라면 기존의 매핑함수 대부분을 제거할 수 있게 되고, 유지보수성 또한 크게 향상되는 결과를 얻을 수 있었다.

### 구현 상세
#### 1. 문자열 케이스 변환 타입
```typescript
type CamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<CamelCase<U>>}`
  : S;
```

해당 타입은 typescript의 유틸리티 타입인 `Infer` 를 이용했다.
infer를 통해서 스네이크 케이스가 적용된 부분을 추론하고, 이를 카멜케이스로 변환하는 타입을 반환할 수 있도록 하였으며, 재귀적으로 동작하면서 스네이크 케이스가 적용된 모든 부분들을 카멜케이스로 변환할 수 있도록 하였다.

#### 2. 객체 프로퍼티 변환 타입
```typescript
type CamelCasedProperties<T> = {
  [K in keyof T as K extends string ? CamelCase<K> : K]: T[K] extends object
    ? T[K] extends Array<any>
      ? CamelCasedProperties<T[K][number]>[] // 배열 처리
      : CamelCasedProperties<T[K]> // 객체 재귀 처리
    : T[K]; // 기본 타입 그대로 반환
};
```

객체 프로퍼티 변환 타입을 작성하면서 고려해야 할 점은 값이 배열인 경우와 객체인 경우가 있었다.
이 또한 분기처리를 통해서 
- 키가 문자열인 경우: CamelCase로 변환
- 값이 배열인 경우: 배열 요소에 대해 재귀적으로 변환
- 값이 객체인 경우: 객체에 대해 재귀적으로 변환
- 기본 타입인 경우: 그대로 유지
로 나누어 타입을 반환할 수 있도록 하였다.

#### 3. 런타임 변환 함수
```typescript
export function mapToCamelCase<T extends object>(
  obj: T
): CamelCasedProperties<T> {
  // 배열 처리
  if (Array.isArray(obj)) {
    return obj.map((item) => mapToCamelCase(item)) as CamelCasedProperties<T>;
  }

  // 객체 처리
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );

    const value = (obj as any)[key];

    acc[camelKey] =
      typeof value === "object" && value !== null
        ? mapToCamelCase(value)
        : value;
    return acc;
  }, {} as any) as CamelCasedProperties<T>;
}
```
사실 타입을 작성하는게 어렵고, 런타임 변환 함수를 작성하는 과정은 쉬웠다.
그냥 배열/객체의 경우를 나누어 
- 배열의 경우 : 재귀적으로 각 객체 배열에 대해서 매핑
- 객체의 경우 : `Object.reduce` 를 통해 새로운 키값 쌍을 만들어냄
으로 처리하면 됐다.

## 개선된 사용 방법
### Before: 중복 타입 정의
```typescript
// API 응답 타입
interface UserApiResponse {
  user_id: number;
  user_name: string;
  user_profile: {
    profile_image: string;
    created_at: string;
  };
}

// 클라이언트 사용 타입 (중복!)
interface User {
  userId: number;
  userName: string;
  userProfile: {
    profileImage: string;
    createdAt: string;
  };
}
```

### After: 단일 타입 정의
```typescript
// API 응답 타입만 정의
interface UserApi {
  user_id: number;
  user_name: string;
  user_profile: {
    profile_image: string;
    created_at: string;
  };
}

// 클라이언트 타입은 자동으로 추론
type User = CamelCasedProperties<UserApiResponse>;
// 결과: { userId: number; userName: string; userProfile: { profileImage: string; createdAt: string; } }

//이런 식으로 매핑하면 된다
axios.get("url").then((response) => response.data).then(mapToCamelCase)
```
확실히 기존 API 호출보다 훨씬 깔끔해지고 애초에 타입 하나만 만들어주면 추론을 통해 카멜케이스로 바꿔주니 타입을 중복으로 선언하지 않아도 됐다.
## 개선 효과

### 1. 코드 중복 제거
- 타입 정의 50% 감소
- 변환 함수 중복 제거

### 2. 유지보수성 향상
- API 스키마 변경 시 한 곳만 수정
- 타입 불일치 에러 원천 차단

### 3. 개발 경험 향상
- 자동 완성 및 타입 추론 지원

## 마무리

타입 레벨에서 타입스크립트의 활용도를 높여 런타임에서 안전하고 효율적인 코드를 작성할 수 있었다. 특히 API 응답 처리와 같은 반복적인 작업에서 이런 접근 방식은 DX를 크게 향상시킨 작업이라고 느꼈다. 이와 동시에 기본기가 왜 중요한지 알게 됐다. 기존의 타입스크립트의 활용도를 높이면 됐을 일을 활용도의 부족으로 단순하게만 사용하고 있었다는 사실을 깨달으면서 나름의 반성도 할 수 있었다.