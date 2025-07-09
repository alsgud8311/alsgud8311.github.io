---
title: effective query key
created: 2025-07-08 21:32
updated: 2025-07-08 21:32
tags:
  - 리팩토링
  - 개선일지
  - 개발
  - 프로젝트
categories:
  - 개발
  - 프로젝트
aliases: 
description: ""
status: draft
---
## 문제
Tanstack Query를 사용하면서 모든 사람들이 한 번씩은 겪는 불편함이다.

> 이 쿼리키를 다 기억해놔야 해? 

```ts
  // 데이터 조회 (useQuery)
  const {
    data: users,
    isLoading,
    error,
    isError,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    cacheTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 3, // 실패시 3번 재시도
    refetchOnWindowFocus: false, // 윈도우 포커스시 refetch 비활성화
  });
```

실제로 우리는 Tanstack Query를 통해서 쿼리 키를 관리할 때, 문자열을 그대로 넣기도 한다.
하지만 이는 점점 관리하는 쿼리 키가 많아지면 많아질수록 내가 어떤 쿼리 키를 썼는지도 까먹고 다른 쿼리 키를 사용할 수도 있으며, 심한 경우 메모장에 사이트 비밀번호 기록해 놓듯이 따로 기록해놓기도 한다.
하지만 이러한 방식의 경우 점점 유지보수하기가 불편해진다는 단점이 있다.

그렇다면 이를 어떻게 우아하게 관리할 수 있을까? 

https://tkdodo.eu/blog/effective-react-query-keys
`Tanstack-query`의 메인테이너인 Dominik라는 분은 이러한 문제에 대해서 Query Key를 구조화하는 
`Query Key Factory`를 제시한다.

```js
const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
}
```

이렇게 쿼리 키를 작성할 경우, 쿼리 키를 한번에 관리할 수 있을 뿐만 아니라, `fuzzy matching`을 하는 `tanstack query` 의 성격에 맞게 활용할 수도 있다.

### TanStack Query에서의 Fuzzy Matching란
TanStack Query에서 `fuzzy Matching`은 의미 그대로 '흐릿한 매칭'이다. 무조건 똑같은 쿼리에 대해서 매칭하는 것이 아니라, 흐릿하게 보고 같아보이는 쿼리에 대해서는 매칭시키는 구조이다.
반대 개념으로 **exact matching(정확한 매칭)** 이 있다.

희미하다는 의미가 무슨 의미인지 감이 제대로 오지 않을 수도 있다.
이럴 때는 부분적인 공통적 쿼리에 대한 매칭정도라고 생각하면 이해가 편하다.

앞에 오늘 공통적인 쿼리가 있다면, 그 뒤의 쿼리들 또한 모두 매칭에 걸리는 쿼리가 된다.

```ts
// 부분 매칭 (TanStack Query 기본 방식)
['user'] → ['user', 1], ['user', 1, 'profile'] 매치됨

// 정확한 매칭
['user', 1] → 정확히 ['user', 1]만 매치됨

// 조건부 매칭
predicate: (query) => query.state.isStale
```
다른 방식도 있지만, 이번엔 특히 `fuzzy Matching`에 대해서 query key factory를 사용해서 해보려고 한다.


## Query Key Factory로 보완하기
나 또한 Query Key Factory가 한 곳에서 쿼리 키를 관리하기 때문에 훨씬 유지보수성이 좋으며, 만약에 모든 쿼리들을 초기화시키고 싶을 때 위 예시의 `all()` 이나 `list(filter)` 와 같이 특정 쿼리 키 범위에 따라서 invalidate 시킬 수 있는 로직 또한 간편하게 관리할 수 있기 때문에 해당 방식을 채택했다.

```ts
const interviewKeys = {
  all: ["interview"],
  byInterviewId: (id: number): QueryKey => [...interviewKeys.all, id],
  byInterviewIdAndQuestionId: (id: number, questionId: number) =>
    [...interviewKeys.byInterviewId(id), questionId],
};
```

그럼 내가 현재 관리하고 있는 Interview라는 도메인에 대해서 키는 이렇게 관리할 수 있다. 하지만 이 쿼리 키는 타입에 대해서 정확히 명시되어있지 않기 때문에 린트 에러가 떴다. 따라서 기존의 쿼리 키 팩토리를 조금 고치면서 타입을 보완했다.

## 쿼리 키 매칭과 타입 안정성 추가하기
```ts
type QueryKey = readonly (string | number)[];

type QueryKeyFactory<T> = {
  readonly all: QueryKey;
} & {
  [K in keyof T]: T[K] extends (...args: any[]) => QueryKey
    ? (...args: Parameters<T[K]>) => QueryKey
    : QueryKey;
};

type InterviewMethods = {
  byInterviewId: (id: number) => QueryKey;
  byInterviewIdAndQuestionId: (id: number, questionId: number) => QueryKey;
};
const interviewKeys: QueryKeyFactory<InterviewMethods> = {
  all: ["interview"] as const,
  byInterviewId: (id: number): QueryKey => [...interviewKeys.all, id] as const,
  byInterviewIdAndQuestionId: (id: number, questionId: number): QueryKey =>
    [...interviewKeys.all, id, questionId] as const,
};
```

쿼리 키의 경우는 가장 기본적인 `all`은 readonly로 하였고, string혹은 number 타입만 쓰니 Query Key의 경우는 union 타입으로 해주고, `QueryKeyFactory` 의 경우에는 제네릭을 받도록 하였다.
제네릭은 한 객체로 되어 있으며, `T[K]` 가 함수로 되어 있으면 그냥 그대로 내보내고, 해당 객체의 키값과 해당 키값에 대응되는 파라미터를 받아서 QueryKey를 반환하도록 타입을 보완했다.
