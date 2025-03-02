# 바닐라 라우팅

# 라우터 개념 기초

## 서비스 구경하기

- 지도 서비스와 라우팅
    

## URL과 Location

- **URL**: 브라우저 주소창에 보이는 주소. 웹 애플리케이션에서 라우팅의 주요 진입점이 됨.
    
- **Location**: 브라우저의 현재 위치를 나타내며, JavaScript의 `window.location`과 유사함.
    
    - 예시: `window.location.pathname;`은 현재 경로를 반환함.
        
    - **URLSearchParams**: 이 API를 사용하면 URL의 쿼리 파라미터 정보를 쉽게 얻을 수 있음.
        
        ```
        const params = new URLSearchParams(window.location.search);
        const color = params.get("color");
        ```
        

## History API

### History stack

- 사용자가 브라우저에서 이동한 기록을 담는 스택. 사용자가 페이지를 탐색할 때마다 브라우저는 현재 URL을 히스토리 스택에 저장함.
    
- **History API**: JavaScript의 History API를 사용하면 이 스택을 조작할 수 있으며, 이를 통해 페이지를 다시 로드하지 않고도 URL을 업데이트할 수 있음.
    

### 주요 메서드:

1. **`history.pushState()`**: 새로운 URL을 히스토리 스택에 추가.
    
    ```
    window.history.pushState({color: 'blue'}, "", "?color=blue");
    ```
    
2. **`history.replaceState()`**: 히스토리 스택의 현재 항목을 새로운 값으로 대체.
    
3. **`popstate` 이벤트**: 사용자가 '뒤로가기' 또는 '앞으로가기' 버튼을 눌렀을 때 발생하는 이벤트. 이 이벤트를 활용해 이전 또는 다음 상태로 화면을 렌더링할 수 있음.
    
    ```
    window.addEventListener("popstate", (event) => {
        if (event.state) {
            document.body.style.backgroundColor = event.state.color;
        }
    });
    ```
    

## 클라이언트 측 라우팅

- 클라이언트 측 JavaScript를 사용해 브라우저의 히스토리 스택을 제어하는 방식.
    
- **SPA (단일 페이지 애플리케이션)** 구조에서는 전체 페이지를 새로 로드하지 않고, 필요한 부분만 다시 렌더링함.
    
- 브라우저는 이를 통해 사용자가 '뒤로가기' 또는 '앞으로가기' 버튼을 눌러 이전 화면으로 돌아가거나 다음 화면으로 이동할 수 있게 함.
    

### 예시

```
const newUrl = '/new-page';
const newState = { additionalInformation: 'Some data' };
const newTitle = 'New Page';

history.pushState(newState, newTitle, newUrl);
```

위 코드를 통해 브라우저 히스토리에 새로운 상태를 추가할 수 있으며, 페이지를 새로 로드하지 않음.

또한 `popstate` 이벤트를 사용해 뒤로가기 또는 앞으로가기를 처리할 수 있음:

```
window.addEventListener('popstate', (event) => {
    document.querySelector("div").innerHTML = JSON.stringify(event.state);
});
```

## 바닐라 자바스크립트로 간단한 라우터 구현

- 1단계: 첫 페이지 로딩 시 라우터 호출
    
- 2단계: 라우트 정의 및 기본적인 라우터 함수 만들기
    
- 3단계: 링크 클릭 시 페이지 전환 처리
    
- 4단계: popstate 이벤트 핸들링 추가하기
    

### 기본 HTML

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Router Example</title>
</head>
<body>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
    </nav>

    <div class="content">
        <!-- 여기에 라우터에 의해 동적으로 내용이 변경될 예정 -->
        <h1>Welcome!</h1>
    </div>

    <script src="router.js"></script> <!-- 여기에 자바스크립트 라우터 코드를 연결 -->
</body>
</html>

```

### 1단계: 첫 페이지 로딩 시 라우터 호출

페이지가 처음 로드될 때 현재 URL에 맞는 페이지가 보이도록 설정.

```
router();  // 첫 페이지 로딩 시 라우터 호출
```

- 브라우저가 처음 로딩될 때, 현재 URL에 맞는 페이지를 바로 렌더링하기 위해 `router` 함수를 호출함.
    

### 2단계: 라우트 정의 및 기본적인 라우터 함수 만들기

먼저, 간단한 경로와 그에 대한 처리를 정의한 후,  
경로에 따라 적절한 페이지를 처리하는 기본적인 라우터 함수를 작성.

```
const routes = {
    '/': () => '<h1>Home Page</h1>',
    '/about': () => '<h1>About Page</h1>',
    '/contact': () => '<h1>Contact Page</h1>',
};

function router() {
    const path = window.location.pathname;
    const route = routes[path];
    const contentDiv = document.querySelector('.content');
    contentDiv.innerHTML = route(); // 해당 경로에 맞는 HTML을 렌더링
}

window.addEventListener('popstate', router);

document.querySelectorAll('a').forEach(anchor => {
    anchor.addEventListener('click', (event) => {
        event.preventDefault();
        const href = event.target.getAttribute('href');
        window.history.pushState({}, '', href);
        router();
    });
});

router();  // 첫 페이지 로딩 시 라우터 호출

```

- **routes 객체**: 경로를 키로, 해당 경로에서 실행할 함수를 값으로 가짐. 각 페이지에서 보여줄 내용을 함수로 정의했음.
    
- **router 함수**: 현재 경로(`window.location.pathname`)를 확인하고, routes 객체에서 해당 경로에 맞는 함수를 찾아 실행함. 경로가 없으면 "404 Not Found" 메시지를 출력함.
    
- 404 페이지는 경로가 없는 경우 어떻게 처리할 수 있을지 ?
    

### 3단계: 링크 클릭 시 페이지 전환 처리

HTML `<a>` 태그를 클릭할 때 페이지가 새로고침 없이 전환되도록 처리해보자.  
이 부분은 라우팅의 핵심적인 기능.

```
document.querySelectorAll('a').forEach(anchor => {
    anchor.addEventListener('click', (event) => {
        event.preventDefault(); 
        const href = event.target.getAttribute('href');
        window.history.pushState({}, '', href);  
        router(); 
    });
});
```

- **`event.preventDefault()`**: `<a>` 태그의 기본 동작인 페이지 리로드를 막음.
    
- **`window.history.pushState()`**: 새로운 경로를 히스토리 스택에 추가하면서 URL을 변경하지만, 페이지는 새로 로드되지 않음.
    
- **router 호출**: URL이 변경된 후, 해당 경로에 맞는 페이지가 즉시 렌더링되도록 `router` 함수를 호출함.
    

#### 고민 포인트

- 클릭 시 URL은 변경되지만, 새로고침 없이 페이지가 변경되는 이유 생각해보기.
    
- `pushState`와 `router` 함수의 관계를 이해하는 것이 중요.
    

---

### 4단계: popstate 이벤트 핸들링 추가하기

브라우저의 '뒤로가기/앞으로가기' 버튼을 눌렀을 때도 올바른 페이지가 렌더링되도록 `popstate` 이벤트 리스너를 추가.

```
window.addEventListener('popstate', router);
```

- **popstate 이벤트**: 사용자가 '뒤로가기' 또는 '앞으로가기' 버튼을 클릭할 때 발생하는 이벤트.
    
- 이 이벤트가 발생할 때마다 `router` 함수를 호출해, 현재 경로에 맞는 페이지가 표시되도록 함.
    

### 전체 흐름 요약

이제 각 부분을 단계적으로 이해했으니, 코드를 통합해서 전체적인 흐름을 다시 보자:

```
const routes = {
    '/': () => console.log('Home Page'),
    '/about': () => console.log('About Page'),
    '/contact': () => console.log('Contact Page'),
};

function router() {
    const path = window.location.pathname;
    const route = routes[path];
    if (route) {
        route();
    } else {
        console.log('404 Not Found');
    }
}

window.addEventListener('popstate', router);

document.querySelectorAll('a').forEach(anchor => {
    anchor.addEventListener('click', (event) => {
        event.preventDefault();
        const href = event.target.getAttribute('href');
        window.history.pushState({}, '', href);
        router();
    });
});

router();  // 첫 페이지 로딩 시 라우터 호출
```

# React Router 요약

리액트 라우터는 SPA에서 클라이언트 측 라우팅을 쉽게 관리할 수 있도록 도와줌.  
간단히 react rounter에 대해서 배워보자.

## React Router v6 예제

```
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}

function Home() {
  return <h1>Home Page</h1>;
}

function About() {
  return <h1>About Page</h1>;
}

function Contact() {
  return <h1>Contact Page</h1>;
}
```

---

# Next.js 파일기반 라우터

Next.js는 **파일 기반 라우팅**을 사용해서, 디렉토리 구조만으로도 라우팅을 쉽게 설정할 수 있음.  
특별한 설정 없이도 폴더와 파일 이름에 따라 페이지가 자동으로 매핑되기 때문에, 간단하면서도 강력한 라우팅 시스템을 제공.

## 기본 파일 기반 라우팅

- **`pages` 디렉토리**: `pages` 폴더 안에 파일을 추가하면 해당 파일 이름이 바로 URL 경로가 됨.
    

예를 들어, `pages/about.js` 파일을 추가하면 `/about` 경로에서 이 페이지가 렌더링됨.

```
// pages/about.js
export default function About() {
  return <h1>About Page</h1>;
}
```

- **동적 라우팅**: 대괄호를 사용하여 동적 경로를 생성할 수 있음.
    
- 예를 들어, `pages/[id].js`는 `/post/1`과 같은 URL에서 데이터를 받아 처리할 수 있음.
    

```
// pages/[id].js
import { useRouter } from 'next/router';

export default function Post() {
  const router = useRouter();
  const { id } = router.query;

  return <h1>Post ID: {id}</h1>;
}
```

## Link 컴포넌트

Next.js에서는 페이지 간 이동을 위해 `Link` 컴포넌트를 사용함. 이 컴포넌트는 클라이언트 사이드 네비게이션을 처리하여 페이지를 새로 고침하지 않고 URL을 변경할 수 있음.

```
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <Link href="/about">Go to About</Link>
    </div>
  );
}
```

## `useRouter` 훅

Next.js에서 제공하는 `useRouter` 훅을 사용하면 현재 경로 정보에 접근하고, 프로그래밍적으로 페이지를 이동할 수 있음.

```
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const goToAbout = () => {
    router.push('/about');
  };

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={goToAbout}>Go to About</button>
    </div>
  );
}
```