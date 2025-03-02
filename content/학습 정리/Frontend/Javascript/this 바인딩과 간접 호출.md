this는 자신이 속한 객체 또는 자신이 생성할 인스턴스를 가리키는 자기 참조 변수(self-referencing variable)이다. this는 C++이나 자바와 같은 클래스 기반 언어에서 클래스가 생성하는 인스턴스를 가리키는데, 자바스크립트의 경우 특이 케이스로, 함수가 호출되는 방식에 따라 this에 바인딩될 값, 즉 this 바인딩이 동적으로 결정된다.

함수의 호출 방식은
1. 함수 호출
2. 메소드 호출
3. 생성자 함수 호출
4. apply/call/bind 호출
로 나누어지는데, 이러한 함수의 호출 방식에 따라 this 바인딩이 그때그때 결정된다는 의미기도 하다.

> 바인딩이란?
> 식별자와 값을 연결하는 과정

```js
var foo = function () {
  console.dir(this);
};

// 1. 함수 호출
foo(); // window
// window.foo();

// 2. 메소드 호출
var obj = { foo: foo };
obj.foo(); // obj

// 3. 생성자 함수 호출
var instance = new foo(); // instance

// 4. apply/call/bind 호출
var bar = { name: 'bar' };
foo.call(bar);   // bar
foo.apply(bar);  // bar
foo.bind(bar)(); // bar
```

그러면 각각의 함수 호출하는 방식에 따라서 binding이 어떻게 이루어지는지 파헤쳐보자

## 일반 함수 호출
일반 함수에서 this를 가리키는 경우 전역 객체를 가리킨다.

> 전역 객체란?
> 모든 객체의 유일한 최상위 객체

Browser-side에서는 window를, Server-side(Node.js)에서는 global 객체를 가리키게 된다.
```js
// in browser console
this === window // true

// in Terminal
node
this === global // true
```

사실 this는 객체의 프로퍼티나 메서드를 참조하기 위한 자기 참조 변수로 쓰이기 때문에,