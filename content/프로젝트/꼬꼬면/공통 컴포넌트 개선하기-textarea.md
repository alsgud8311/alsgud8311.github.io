---
title: 공통 컴포넌트 개선하기-textarea
created: 2025-06-19 23:00
updated: 2025-06-19 23:00
tags:
  - 개발
categories:
  - 개발
  - 프로젝트
aliases: 
description: ""
status: draft
---
```tsx
interface TextareaProps
  extends Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      "size" | "children" | "dangerouslySetInnerHTML"
    >,
    TextareaVariantProps {
  ref?: RefObject<HTMLTextAreaElement>;
  autoAdjust?: boolean;
  name: string;
}

export const Textarea = ({
  className,
  variant,
  size,
  border,
  ref,
  autoAdjust = false,
  ...props
}: TextareaProps) : JSX.Element => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const currentRef = ref || textareaRef;
  useEffect(() => {
    if (
      autoAdjust &&
      currentRef &&
      currentRef.current &&
      props.value !== undefined
    ) {
      const textarea = currentRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight > 400 ? 400 : textarea.scrollHeight}px`;
    }
  }, [props.value, autoAdjust, ref]);

  return (
    <textarea
      className={cn(textareaVariants({ variant, size, border }), className)}
      ref={ref}
      placeholder="Type your text here..."
      {...props}
    />
  );
};

```
## 문제상황
textarea에서 자동으로 height가 조절될 수 있는 기능을 추가적으로 공통 컴포넌트인 textarea에 넣어줬다. 하지만 이 코드를 리뷰 받았는데
- useEffect는 부수효과를 다루는 기능이므로 예상치 못한 예외가 일어날 수 있기 때문에 최대한 지양하는 것이 좋다
- 다른 방식으로 처리 height를 처리할 수도 있을 것 같다
- `ref || textareaRef` 로 Ref를 두게 되면, ref가 주입되지 않았을 때는 `textareaRef`를 사용하는데, ref를 주입하면 textareaRef는 이 이후로 사용하지 않는 Ref가 되어 어떤 ref와도 동기화되지 않는다
라는 문제를 지적받았다.

## 개선하기
먼저 `useEffect`를 사용하는 방식 자체를 `onChange` 이벤트에 두어 굳이 `useEffect`를 사용하지 않고도 사용자의 입력이 들어올 때마다 값이 바뀔 수 있도록 하였다. 
```tsx
export const Textarea = ({
  className,
  variant,
  size,
  border,
  ref,
  autoAdjust = false,
  ...props
}: TextareaProps): JSX.Element => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const currentRef = ref || textareaRef;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      if (autoAdjust && currentRef.current) {
        const textarea = currentRef.current;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight > 400 ? 400 : textarea.scrollHeight}px`;
      }
      if (props.onChange) {
        props.onChange(e);
      }
    },
    [currentRef, autoAdjust, props.onChange]
  );

  return (
    <textarea
      className={cn(textareaVariants({ variant, size, border }), className)}
      ref={ref}
      onChange={handleChange}
      placeholder="Type your text here..."
      {...props}
    />
  );
};
```
다시금 생각해보니까 굳이 ref를 걸어놓고 이 ref의 객체에 접근하는 것이 아니라, 이벤트의 경우에는 target을 통해 이벤트가 일어난 객체에 접근할 수 있기 때문에 ref를 사용하지 않아도 됐었다.

```tsx
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      if (autoAdjust) {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight > 400 ? 400 : e.target.scrollHeight}px`;
      }
      if (props.onChange) {
        props.onChange(e);
      }
    },
    [autoAdjust, props.onChange]
  );
```
따라서 그냥 이런 식으로 타겟에 그대로 접근해서 고쳤다!
