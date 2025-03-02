---
title: optimistic Update 리팩토링
created: 2025-02-25 16:02
updated: 2025-02-25 16:02
tags:
  - 개발
  - 리팩토링
  - 낙관적업데이트
  - OptimisticUpdate
  - useMutation
categories: 
aliases: 
description: ""
status: draft
---

![](https://i.imgur.com/cXkKQBY.png)
포에이에는 병원 목록 API에서 회원이 해당 병원을 즐겨찾기 할 수 있는 기능이 존재한다.

하지만 현재 구현되어있는 로직의 문제점이 있다.
1. 즐겨찾기를 눌렀을 때, API를 보내고, 그 API가 성공으로 Promise가 돌아왔을 때 아무것도 하지 않는다. 결국 다시 병원 목록을 fetch하지 않기 때문에 즐겨찾기가 제대로 성공했는지는 다시 나갔다가 들어와서 fetch가 이루어질 때 확인해야 한다
2. 즐겨찾기 api가 작동했을 때 다시 `invalidateQueries`로 기존의 병원 목록을 불러오게 되면 네트워크 비용이 증가한다. 요청이 성공했다는 것은 곧 해당 즐겨찾기 필드의 값만 변했을 뿐인데 이를 위해 다시금 api를 호출하는 행위는 비효율적이라고 생각한다
이와 같은 문제였기 때문에 Optimistic Update, 즉 낙관적 업데이트를 통한 즐겨찾기 기능 제어를 하려고 한다.

이러한 Optimistic Update의 경우 tanstack query에서도 제공하는 기능이다.
tanstack query의 useMutation을 이용해서 어떤 방식으로 기존의 값을 가져와서 즉시 업데이트하고, 만약에 업데이트가 실패하면 어떻게 할지 등의 방식을 제공한다.
```js
useMutation({
  mutationFn: updateTodo,
  // When mutate is called:
  onMutate: async (newTodo) => {
    // Cancel any outgoing refetches
    // (so they don't overwrite our optimistic update)
    await queryClient.cancelQueries({ queryKey: ['todos', newTodo.id] })

    // Snapshot the previous value
    const previousTodo = queryClient.getQueryData(['todos', newTodo.id])

    // Optimistically update to the new value
    queryClient.setQueryData(['todos', newTodo.id], newTodo)

    // Return a context with the previous and new todo
    return { previousTodo, newTodo }
  },
  // If the mutation fails, use the context we returned above
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(
      ['todos', context.newTodo.id],
      context.previousTodo,
    )
  },
  // Always refetch after error or success:
  onSettled: (newTodo) => {
    queryClient.invalidateQueries({ queryKey: ['todos', newTodo.id] })
  },
})
```
여기에서 이루어지는 과정은
- mutate가 호출되자마자
	- 같은 데이터를 가져오는 쿼리가 실행 중이라면, 먼저 취소(`cancelQueries`)하여 **낙관적 업데이트를 방해하지 않도록** 하기
	- 이전 데이터를 저장하여, 에러 시에 복구할 수 있도록 변수에 할당
	- 낙관적 업데이트 수행
	- context 반환(후에 error가 있을 때 쓰임)
- 서버 요청이 실패했을 경우
	- context로 넘겨줬던 데이터를 가져와서 기존 데이터로 복구
- 서버 요청이 실패하거나 성공했을 때 항상 수행
	- 새롭게 데이터 페칭
의 과정을 거친다.


```js
const { mutate } = useMutation({
        mutationFn: () =>
            postBookmark({
                hospitalId: hospital.hospitalId,
                bookmark: !hospital.isBookmarked,
            }),
        onMutate: async () => {
            await queryClient.cancelQueries({
                queryKey: [
                    'hospitalList',
                    location?.latitude,
                    location?.longitude,
                ],
            });

            const previousHospitalList = queryClient.getQueryData<{
                pageParams: number[];
                pages: { hospitalList: Hospital[]; paging: any }[];
            }>(['hospitalList', location?.latitude, location?.longitude]);

            if (previousHospitalList) {
                queryClient.setQueryData(
                    ['hospitalList', location?.latitude, location?.longitude],
                    {
                        ...previousHospitalList,
                        pages: previousHospitalList.pages.map((page) => ({
                            ...page,
                            hospitalList: page.hospitalList.map((h) =>
                                h.hospitalId === hospital.hospitalId
                                    ? { ...h, isBookmarked: !h.isBookmarked }
                                    : h,
                            ),
                        })),
                    },
                );
            }

            return { previousHospitalList };
        },
        onError: (err, variables, context) => {
            if (context?.previousHospitalList) {
                queryClient.setQueryData(
                    ['hospitalList', location?.latitude, location?.longitude],
                    context.previousHospitalList,
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    'hospitalList',
                    location?.latitude,
                    location?.longitude,
                ],
            });
        },
    });
```

mutation 하나만 해도 줄이 엄청나다...
이제는 좋아요를 누르거나 스크랩을 하는 등 `mutation`을 실행하자마자 해당 요청이 정상적으로 실행됨을 가정하고 ui가 업데이트되며, 만약 에러가 발생했을 경우에는 다시금 업데이트 시켜놨던 ui를 이전 ui로 바꿈으로써 낙관적 업데이트를 구현하였다.
