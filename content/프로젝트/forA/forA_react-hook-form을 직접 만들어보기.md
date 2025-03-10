---
title: forA_react-hook-form을 직접 만들어보기
created: 2025-02-12 23:52
updated: 2025-02-12 23:52
tags:
  - 개발
  - 프로젝트
  - 리팩토링
categories: 프로젝트
aliases: 
description: ""
status: draft
---
## 문제 찾기
다른 서비스도 마찬가지겠지만, 포에이의 주요기능들은 대부분 커뮤니티와 리뷰 등에 대한 작성과 정보 제공을 중심으로 이루어지기 때문에 폼을 이용할 수 있는 것들이 많다.

보통 이러한 폼을 관리하기 위해서 대부분 리액트를 쓰는 사람 입장에서는 상태로 관리하게 될 것이다.
왜냐하면 각 필드의 값이 유효한지 검증하고, 검증에 따라 적절한 처리를 해주면 사용자 경험에 더 좋기 때문에 대개 useState를 사용하게 된다.

하지만 문제는 이러한 필드가 한두개면 괜찮지만, 이게 점점 늘어난다면?
![](https://i.imgur.com/gziwdIp.png)
지금은 세개만 있는데도 같은 api에 들어가는 필드의 값인데도 뭔가 각각 관리되는 것처럼 보이며, 실제로도 따로 관리를 해야 한다.


각각의 setter함수가 생기고 또 이를 제어하기 위해서는 각각의 state에 대해서 관리를 하는 코드가 계속 들어가기 때문에 코드는 점점 늘어날 수밖에 없고, 가독성이 떨어지는 코드를 보면서 킹받지 않을 수 없다.

## React-hook-form의 등장
`React-hook-form`은 이러한 많아지는 각 폼의 상태들을 효과적으로 관리하기 위한 수단을 제공한다.
바로 폼 자체를 추상화시켜 하나의 `useForm()`이라는 폼 안에 각 필드의 값을 모두 관리할 수 있도록 하는 것이다.

이러한 폼을 관리할 수 있는 상태 관리 라이브러리의 경우 `redux` 또한 제공하고 있고, `Formix`라는 것도 있다. 하지만 React-hook-form이 그렇게 각광받는 이유가 무엇일까?

바로 **빠르기 때문**이다.

![](https://i.imgur.com/TSsuipy.png)

`Formix`, `Redux Form`, `React-Hook-Form`에서 제공하는 성능 측정을 했을 때, `React-Hook-Form`이 `Formix`보다 1.5배정도 빠르고, 심지어 `Redux Form`보다는 4배 이상 빠르다.

[참고 링크](https://github.com/react-hook-form/performance-compare)

이렇게 빠른 이유 중 하나는, 비제어 컴포넌트의 장점을 살리는 방식으로 `Form`을 사용하고 있기 때문에 그렇다.

>비제어 컴포넌트와 제어 컴포넌트의 차이는 여기서 볼 수 있다.
 [[비제어 컴포넌트와 제어 컴포넌트]]

<iframe width="560" height="315" src="https://www.youtube.com/embed/rIKMY5azC3A?si=rbP-Z5ifrr8Crm2f" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
제작자가 올린 영상 또한 비제어 컴포넌트의 특성을 살려 렌더링이 일어나지 않는다는 부분을 강조한 영상을 `React-hook-form`의 중앙에 넣어놓았다.

![](https://i.imgur.com/dFzgdXT.png)

이미 `React-hook-form`은 Weekly Download와 유지보수가 매우 활발히 되고 있다는 점에서 이미 GOAT 반열에 올라와 있지만 이번에는 이를 쓰기 보다는 하나하나씩 만들어가면서 보다 React-hook-form을 더 잘 이해하는 시간을 가져보려 한다.

## 약식 구현을 위한 필요 기능 추가하기
 뭐든지 라이브러리를 구현한다고 하면 무조건 이걸 처음부터 끝까지 써야 하는게 아니다. 그러면 이거 하나 만드느라 몇년이 걸릴 수 있다.
 핵심은 내가 쓰는 **핵심 기능만을 빠르게 만들면서 원리를 보다 깊게 이해하는 것**이다.
 
 따라서 일부 구현을 위해 기존 소스코드를 간단하게 보자.
 나는 주로 사용하는 `useForm`의 `register`,  `reset`, `getValues` 정도의 메서드를 만들어 보려고 한다. 
### useForm 소스코드 살펴보기
먼저 `useRef`만 사용한다는 사실만으로 만들기보단, 먼저 해당 코드가 어떻게 움직이는가 코드를 봐야했다.
```d.ts
export declare function useForm<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues extends FieldValues | undefined = undefined>(props?: UseFormProps<TFieldValues, TContext>): UseFormReturn<TFieldValues, TContext, TTransformedValues>;
```

정의에서는 제네릭에 세 가지 인수를 넣는데, 가장 많이 쓰는 것은 처음 가지는 `TFieldValues`이다. 해당 제네릭을 통해서 필드가 가져야 하는 값에 대해 정의하고 이에 대해 다른 메서드에서 이 타입을 참조하여 필드 값에 알맞은 값이 들어오거나 하는 행위가 일어났을 때 적절히 타입을 해주어 휴먼 에러를 보다 견고하게 방어하고자 설계되어있다.

```ts
export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>(
  props: UseFormProps<TFieldValues, TContext> = {},
): UseFormReturn<TFieldValues, TContext, TTransformedValues> {
  const _formControl = React.useRef<
    UseFormReturn<TFieldValues, TContext, TTransformedValues> | undefined
  >(undefined);
  const _values = React.useRef<typeof props.values>(undefined);
  const [formState, updateFormState] = React.useState<FormState<TFieldValues>>({
    isDirty: false,
    isValidating: false,
    isLoading: isFunction(props.defaultValues),
    isSubmitted: false,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    submitCount: 0,
    dirtyFields: {},
    touchedFields: {},
    validatingFields: {},
    errors: props.errors || {},
    disabled: props.disabled || false,
    defaultValues: isFunction(props.defaultValues)
      ? undefined
      : props.defaultValues,
  });

  if (!_formControl.current) {
    _formControl.current = {
      ...(props.formControl ? props.formControl : createFormControl(props)),
      formState,
    };
  }

  const control = _formControl.current.control;
  control._options = props;

  React.useEffect(
    () =>
      control._subscribe({
        formState: control._proxyFormState,
        callback: () => updateFormState({ ...control._formState }),
        reRenderRoot: true,
      }),
    [control],
  );

  React.useEffect(
    () => control._disableForm(props.disabled),
    [control, props.disabled],
  );

  React.useEffect(() => {
    if (control._proxyFormState.isDirty) {
      const isDirty = control._getDirty();
      if (isDirty !== formState.isDirty) {
        control._subjects.state.next({
          isDirty,
        });
      }
    }
  }, [control, formState.isDirty]);

  React.useEffect(() => {
    if (props.values && !deepEqual(props.values, _values.current)) {
      control._reset(props.values, control._options.resetOptions);
      _values.current = props.values;
      updateFormState((state) => ({ ...state }));
    } else {
      control._resetDefaultValues();
    }
  }, [props.values, control]);

  React.useEffect(() => {
    if (props.errors) {
      control._setErrors(props.errors);
    }
  }, [props.errors, control]);

  React.useEffect(() => {
    if (!control._state.mount) {
      control._setValid();
      control._state.mount = true;
    }

    if (control._state.watch) {
      control._state.watch = false;
      control._subjects.state.next({ ...control._formState });
    }

    control._removeUnmounted();
  });

  React.useEffect(() => {
    props.shouldUnregister &&
      control._subjects.state.next({
        values: control._getWatch(),
      });
  }, [props.shouldUnregister, control]);

  _formControl.current.formState = getProxyFormState(formState, control);

  return _formControl.current;
}

```
훅으로 들어가보면, `useEffect`를 많이 사용하고 있음을 알 수 있다.
여담이지만 해당 코드를 보면서 무엇이 더 좋은 코드인가에 대해 생각해볼 수 있는 시간이었다. 단순히 하나의 `useEffect`에 모든 로직을 끼워넣기 보다는 역할별로 `useEffect`를 하나씩 사용하는 편이 훨씬 가독성과 유지보수에 좋아 보였다. 이렇게 역할별로 `useEffect`를 나누는 것은 `모던 리액트 딥다이브`같은 곳에서도 지향하는 코드 습관이라고 나와있었는데, 모범 답안과 같은 코드를 보니까 왜 그런지 더 깊게 깨달았다.

아무튼 다시 훅 이야기를 하자면, 여기서는 폼 자체에서 가져야 하는 속성들 `formState`라는 state 하나에 객체로 넣어 사용하고 있다.
또한 이 state를 컨트롤 하기 위해서 `_control` 이라는 useRef를 사용하고, `_values`라는 ref로 필드의 값들을 관리한다.

그 아래는 폼 초기화와 이를 다양하게 폼과의 상호작용이 이루어질 수 있도록 다양한 요소들이 담겨있는데,
- `useEffect`를 사용하여 폼 상태 변경 감지 및 업데이트
- `control._reset()`을 호출하여 `props.values`가 변경될 때 폼을 초기화
- `props.errors`를 감지하여 `_setErrors()`로 에러 업데이트
- 마운트되었을 때 ref 객체에 상태 업데이트
- `getProxyFormState()`로 `formState`를 Proxy로 감싸 반환
등의 로직을 담고 있다.

이렇게 하나하나 모든 상태들을 따로 useEffect로 관리하는 이유는 `useRef`는 조작해도 리렌더링을 일으키지 않으므로 하나하나 패턴을 사용해서 직접 관리해주고 있음을 알 수 있다.

근데 이걸 하나하나 다 구현하자니 타입만 해도 수십개까지 늘어나다 보니 나는 여기서 어떻게 구현해야 할까 벌써부터 막막함이..
### 필요한 기능 생각해보기
하나하나 구현하는 것은 개발 시간을 기하급수적으로 늘리기 때문에 내가 어떤 기능이 필요한 지에 대해 핵심적인 기능을 미리 적으면서 정리한다.
####  `register`로 입력 필드를 `ref`에 저장
`react-hook-form`은 `register` 함수를 통해 각 입력 필드의 `ref`를 저장하고 관리한다. 이를 통해 **React의 상태(`useState`)를 사용하지 않고도 입력 값을 추적**할 수 있다.


```tsx
const { register } = useForm();

<input {...register("username")} />
```

🤨  어떻게?
-  `register("username")`을 호출하면 내부적으로 `ref`를 만들어 input에 전달
-  `onChange`, `onBlur` 등의 이벤트 핸들러도 함께 연결됨.
-  폼 상태는 `setState` 없이`ref`를 직접 참조하여 연결

#### 핵심적 훅인 `useForm`
`useForm`은 폼 상태를 관리하는 핵심 함수이다.
해당 함수에서 폼에 필요한 모든 메서드들을 받아 객체분해할당한 뒤 사용하는게 best practice이다.
```tsx
export default function App() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>()
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input defaultValue="test" {...register("example")} />
      <input {...register("exampleRequired", { required: true })} />
      {errors.exampleRequired && <span>This field is required</span>}
      <input type="submit" />
    </form>
  )
}
```

🤨 어떻게?
- `useRef`를 활용해 input 필드들을 저장 → **리렌더링 없이 값 추적 가능**.
- `onChange`에서 `state`를 사용하지 않고 **DOM 요소(`ref`)를 직접 수정**하여 값을 업데이트하기
- 

#### `handleSubmit`으로 폼 데이터 가져오기
`handleSubmit`은 `register`에 저장된 값들을 모아서 **폼 데이터를 한 번에 처리**하는 역할을 한다. 해당 역할을 통해 `handleSubmit`에서는 useForm에서 계속 기록하고 있던 `useRef` 객체 안의 값들을 `onSubmit`에 넘겨준다.

```tsx
const { register, handleSubmit } = useForm();

const onSubmit = (data) => console.log(data);

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register("username")} />
  <button type="submit">제출</button>
</form>

```

🤨 어떻게?

-  `handleSubmit`이 실행되면 `register`로 저장된 `ref` 값을 모두 가져옴.
-  `onSubmit(data)`에 `{ username: "입력값" }` 형태로 전달됨.

➡️ **값을 실시간으로 관리하는 것이 아니라, 필요할 때(`handleSubmit`) 가져와서 처리하는 방식!**  
➡️ 불필요한 리렌더링이 발생하지 않음.

### 차례차례 보면서 구현해보기
소스코드를 보면서 구현하는게 나을 것 같아서 소스코드를 조금 더 자세히 살펴봤다.

![](https://i.imgur.com/3onukNu.png)
~~그만 알아보자~~
1500줄짜리 함수를 보셨나요.. 라이브러리는 차갑다.

어차피 소스코드를 따라한다 하더라도 내가 원하는 스케일의 코드까지 줄이기 위해서는 여기서 많은 과정이 생략되기 때문에 최대한 간단하게 가는 방법으로 직접 생각해보기로 했다.
