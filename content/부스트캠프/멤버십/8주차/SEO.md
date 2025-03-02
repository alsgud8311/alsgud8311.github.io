### 🍀 검색 엔진이란?

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/d1ee97ec-857a-44cb-8841-02db3f6b8dd9/d47668e3-7383-45a7-af54-84d11f8d2ddf.png)

- 사용자가 입력한 **키워드**에 맞는 검색 결과를 제공하는 프로그램 또는 웹 서비스.
- 주요 검색 엔진: **Google, Naver, Daum, Bing, Yahoo** 등.

### 🍀 **검색 엔진의 동작 과정**

![how-search-engines-find-and-rank-results.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/ecf077bd-d412-4ce3-94af-1cb9c08dc100/how-search-engines-find-and-rank-results.png)

검색 엔진은 **크롤링 → 인덱싱 → 랭킹** 단계를 거쳐 검색 결과를 생성합니다.

1. **크롤링 (Crawling)**
    - **정의**: 검색 엔진이 웹페이지 내용을 수집하는 과정.
    - **방법**: 검색 엔진 로봇(크롤러 또는 스파이더)이 링크를 따라 새 페이지를 발견하고 기존 페이지 변경 사항을 확인.
    - **예시**: 사서가 새 책을 찾아 도서관에 등록하는 것과 유사.
2. **인덱싱 (Indexing)**
    - **정의**: 수집한 정보를 분석해 데이터베이스에 저장하고 분류하는 과정.
    - **내용**: 웹페이지의 텍스트, 이미지, 비디오 등을 주제별로 분류.
    - **예시**: 사서가 책을 주제별로 분류하고 도서 목록을 만드는 과정.
3. **랭킹 (Ranking)**
    - **정의**: 검색어와 가장 관련성 높은 결과를 상위에 노출하는 과정.
    - **기준**: 알고리즘에 따라 수백 가지 요소를 평가해 순위를 결정.
    - **예시**: 사서가 방문객의 질문에 가장 적합한 책을 추천하는 과정.

**요약**

검색 엔진은 크롤링으로 데이터를 수집하고, 인덱싱으로 데이터를 분류하며, 랭킹을 통해 사용자가 입력한 검색어에 가장 적합한 결과를 제공하는 시스템입니다.

### 🍀 검색 엔진 최적화(SEO)란?

- **SEO(Search Engine Optimization)**
    
    웹사이트가 **크롤링 → 인덱싱 → 랭킹** 과정에서 더 잘 발견되고 높은 순위에 노출되도록 최적화하는 작업.
    
- **목적**
    
    웹 페이지를 검색 엔진 결과에서 **상위에 노출**시키는 것.
    
- **비유**
    
    우리의 웹사이트(책)를 도서관에서 가장 눈에 띄는 곳에 배치하도록 돕는 작업.
    

**요약**

검색 엔진의 작동 원리를 이해하고, 이를 기반으로 웹사이트를 최적화해 더 많은 사용자에게 도달하는 것이 SEO의 핵심입니다.

### 🍀 SEO의 중요성

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/4680ec46-86d5-4473-ad12-3c0d3912880c/image.png)

1. **웹사이트 가시성 향상**
    - 검색 결과 상위에 노출되면 더 많은 방문자를 유도할 수 있으며, 이는 잠재 고객 증가로 이어집니다.
2. **타겟 고객 직접 도달**
    - 특정 키워드를 검색하는 사용자는 이미 해당 제품이나 서비스에 관심이 있는 잠재 고객입니다.
    - 검색 상위 노출은 높은 전환율로 연결됩니다.
3. **비용 효율성**
    - SEO는 초기 투자 이후 지속적인 광고비가 필요하지 않습니다.
    - 유기적 노출로 검색 광고 비용 없이도 장기적인 마케팅 효과를 얻을 수 있어, 특히 예산이 제한된 기업에 유리합니다.

**요약**

SEO는 **가시성, 고객 접근성, 비용 효율성**의 측면에서 효과적인 디지털 마케팅 전략입니다.

### 🍀 SEO 방법들 (크롤링, 인덱싱, 랭킹 단계별)

매우 다양한 방법들이 있다. 밑의 것들은 일부!

**1. 크롤링 최적화**

검색 엔진이 웹사이트를 효율적으로 탐색하도록 돕는 작업.

- **사이트맵 설정**
    - XML 형식으로 모든 페이지를 제공해 사이트 구조를 쉽게 이해.
    - `/sitemap.xml` 파일에서 `<loc>` 태그로 경로 지정.
    - 네이버와 구글에 제출해 효율적 크롤링 지원.
- **robots.txt 설정**
    - 크롤러에게 특정 페이지 크롤링 허용/제한 지시.
    - 검색 엔진 크롤링 효율화.
- **적절한 오류 페이지 제공**
    - 깨진 링크를 방지하고 사용자와 검색 엔진에 품질 높은 오류 페이지 제공.

**2. 인덱싱 최적화**

검색 엔진이 콘텐츠를 제대로 분석하고 데이터베이스에 저장하도록 돕는 작업.

- **타이틀과 메타 데이터 설정**
    - `<title>`: 페이지 핵심 주제를 명확히 전달.
    - `<meta>`: 페이지에 대한 추가 정보 제공.
- **시맨틱 태그 사용**
    - 콘텐츠 구조를 명확히 정의해 검색 엔진이 정보의 중요도를 파악.
    - 예: `<article>`, `<section>`, `<header>` 등.

**3. 랭킹 최적화**

검색 결과 상위 노출을 위한 신뢰도와 사용자 경험 개선.

- **HTTPS 사용**
    - HTTPS 사이트는 구글에서 가산점을 받음.
    - 사용자에게 안전하다는 신뢰를 제공.
- **모바일 최적화**
    - **모바일 우선 인덱싱** 적용.
    - 모바일 기기에서 잘 작동하는 웹사이트가 검색 순위에서 유리.
- **페이지 로딩 속도 최적화**
    - 로딩 속도가 빠를수록 사용자 경험과 순위가 향상.
- **SSR 사용**
    - SSR(Server-Side Rendering)은 검색 엔진 크롤링과 SEO에 유리.
    - CSR(Client-Side Rendering)은 크롤링 효율이 낮음.

**요약**

SEO는 **크롤링**, **인덱싱**, **랭킹** 단계에서 각각 최적화를 통해 웹사이트의 가시성을 높이고, 검색 엔진에서 상위 노출될 수 있도록 돕는 작업입니다.

### 🍀 측정 방법

1. **SEO는 좋지만 퍼포먼스 측정이 어렵다**
    - SEO를 개선했더라도 실제 퍼포먼스를 정량적으로 확인하는 것이 중요하다.
2. **검색 엔진 최적화 가이드라인**
    - Google과 같은 주요 검색 엔진의 공식 가이드라인을 참고해 SEO를 점검한다.
3. **Lighthouse**
    - 구글에서 제공하는 오픈 소스 도구로 웹사이트의 성능, 접근성, SEO 등을 자동으로 분석 가능.
    - 주요 점수 항목:
        - Performance (성능)
        - Accessibility (접근성)
        - Best Practices (최적화)
        - SEO (검색 엔진 최적화)
4. **Google Search Console**
    - 구글이 내 페이지를 어떻게 인덱싱하는지 확인 가능.
    - 검색 엔진에서 내 페이지가 잘 노출되고 있는지 확인하고, 문제를 진단할 수 있는 유용한 도구.

### 🍀 React의 SEO 한계 및 해결 방법

![6571e57ff2a4ea837bf83219_seo + react-p-1080.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/3a8982d2-e2fb-44d7-aae8-b303a5c496ee/c5086d23-8535-4195-be13-ba7dc1cb2c1a.png)

1. **크롤링 봇과 HTML 구조**
    - 크롤링 봇은 HTML 본문과 메타 정보를 분석하여 페이지 주제, 구조, 연관된 페이지, 스팸 여부 등을 판단합니다.
    - React는 SPA(Single Page Application) 방식으로, 모든 페이지가 하나의 HTML 파일만을 사용하고 JavaScript로 동적 콘텐츠를 렌더링합니다. → 이로 인해 검색 엔진 최적화(SEO)에 불리합니다.
2. **SPA와 SEO 문제점**
    - 크롤러는 JavaScript를 실행하지 못하거나, 실행이 제한적인 경우가 많습니다. → CSR(Client-Side Rendering) 환경에서는 초기 HTML만 읽고, 동적 콘텐츠는 인식하지 못해 SEO 점수가 낮아질 가능성이 높습니다.
3. **SEO 문제 해결 방법**
    - **SSR/SSG (Pre-rendering)**
        - **SSR (Server-Side Rendering)**: 요청 시 서버에서 HTML을 생성하여 제공 (예: Next.js).
        - **SSG (Static Site Generation)**: 빌드 시점에 정적 HTML 파일을 생성.
        - 라이브러리 사용: **react-snap** 등으로 빌드 시점에 미리 렌더링.
    - 동적 메타 정보 관리
        - React는 DOM의 body만 조작하지만, 검색 엔진은 **head 태그의 정보**도 참고합니다.
        - **React-Helmet-Async**를 사용해 head 내부의 메타 정보를 동적으로 변경하고 SEO 점수를 향상.
4. **결론**
    - React의 SPA 방식은 SEO에 불리하지만, **SSR/SSG** 방식으로 정적 HTML 파일을 생성하거나 **React-Helmet-Async**로 메타 정보를 동적으로 관리하면 SEO 문제를 해결할 수 있습니다.

### 🍀 Meta 태그 정리

![img1.daumcdn.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/b6d84d26-6f07-40c4-9b76-c8b04e39f780/2a04106e-d2ac-4a71-811f-ef232e7cbb15.png)

**1. Meta 태그란?**

웹페이지의 요약 정보를 제공하며, **SEO(검색 엔진 최적화)**, **소셜 미디어 공유**, **브라우저 동작** 등에 중요한 역할을 합니다.

주요 Meta 태그로 **Title**, **Description**, **Viewport** 등이 있습니다.

1. **주요 메타 태그**
    
    1. **Meta Title**
        
        - 페이지의 제목을 정의.
            
        - 저희들이 흔히 쓰던 `<title>내 웹사이트 제목</title>` 이 부분이 Meta Title 태그입니다. 다른 메타 태그들처럼 <meta name=””> 이렇게 쓰이지는 않네요 ㅎㅎ
            
            ```jsx
            <title>내 웹사이트 제목</title>
            ```
            
    2. **Meta Description**
        
        - 웹페이지 요약 정보를 제공.
        - 구글 검색 결과에서 URL 아래 표시.
        
        ```jsx
        <meta name="description" content="귀여운 영재의 팬클럽 사이트입니다.">
        ```
        
    3. **Meta Keywords** (거의 사용되지 않음)
        
        - 과거에 사용되던 키워드 태그. 현재는 SEO에 영향 없음.
        
        ```jsx
        <meta name="keywords" content="HTML, 메타 태그, SEO">
        ```
        
    4. **Robots Meta 태그**
        
        - 검색 엔진 크롤러의 동작을 제어.
        - 예: 페이지를 인덱싱하지 않고 링크만 크롤링
        - 값
            - `index`: 페이지를 인덱싱 허용 (기본값).
                
            - `noindex`: 페이지 인덱싱 금지.
                
            - `follow`: 페이지 내 링크를 크롤링 허용 (기본값).
                
            - `nofollow`: 페이지 내 링크 크롤링 금지.
                
            - `noarchive`: 검색 결과에서 캐시 페이지 표시 금지.
                
            - 페이지를 인덱싱하지 않고 링크를 따라가도록 설정
                
                ```jsx
                <meta name="robots" content="noindex, follow">
                ```
                
            - 페이지와 링크 모두 크롤링하지 않음
                
                ```jsx
                <meta name="robots" content="noindex, nofollow">
                ```
                
            - 페이지를 인덱싱하고 링크도 크롤링 (기본값)
                
                ```jsx
                <meta name="robots" content="index, follow">
                ```
                
            - 특정 검색 엔진에만 적용 (예: Googlebot)
                
                ```jsx
                <meta name="googlebot" content="noindex, nofollow">
                ```
                
    5. **Open Graph 메타 태그**
        
        - 소셜 미디어에서 링크 공유 시 제목, 이미지, 설명 등을 설정.
        - [🍀 open graph](https://www.notion.so/open-graph-14777ba9a1b6806ca1c0f79c4827e72c?pvs=21) → 밑의 이 부분에 따로 적었으므로, 자세한 설명은 생략!
    
    **f. Twitter 메타 태그**
    
    ```jsx
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="페이지 제목">
    <meta name="twitter:description" content="페이지 설명">
    <meta name="twitter:image" content="<https://example.com/image.png>">
    ```
    
    - 트위터에 최적화된 링크 공유 태그.
    - `twitter:card`: 카드 스타일 (`summary`, `summary_large_image` 등).
    
    **g. Viewport 메타 태그**
    
    - 반응형 웹에서 화면 크기에 맞게 콘텐츠를 조정.
        
    - 이 태그가 없으면 모바일 브라우저가 페이지를 기본 크기로 렌더링하여 사용자가 확대/축소해야 할 수 있다.
        
        ```jsx
        <meta name="viewport" content="속성1=값1, 속성2=값2">
        ```
        
        ```jsx
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ```
        
        - 속성과 값
            - width: 페이지의 너비
                - `device-width`: 디바이스의 화면 너비와 동일하게 설정
            - height: 페이지의 높이
                - 이 속성은 드물게 사용되며, 대부분 디바이스 높이는 자동 조정된다
            - initial-scale: 페이지의 초기 확대/축소 비율을 설정
                - 1.0은 100% 크기, 2.0은 200% 확대
            - maximum-scale: 사용자가 페이지를 확대할 수 있는 최대 비율
                - 1.0은 100% 크기로 확대 불가
            - maximum-scale: 사용자가 페이지를 축소할 수 있는 최소 비율
                - 0.5는 50% 축소 가능
            - user-scalable: 사용자가 페이지를 확대/축소할 수 있는지 여부 결정
                - yes 가능, no 불가능
        - 항상 `width=device-width`와 `initial-scale=1.0`을 포함하자. 이는 반응형 웹디자인의 기본 설정이다.
    
    **h. Charset 메타 태그**
    
    - 문서의 문자 인코딩 방식을 정의한다. UTF-8은 전 세계 언어를 지원하는 표준 인코딩이다.
        
        ```jsx
        <meta charset="UTF-8">
        ```
        
    
    **i. Author 및 기타 정보**
    
    - Author: 페이지 작성자 정보를 정의한다.
        
        ```jsx
        <meta name="author" content="존잘경일">
        ```
        
    - Theme-Color: 모바일 브라우저에서 주소 표시줄 색상을 지정한다.
        
        ```jsx
        <meta name="theme-color" content="#ffffff">
        ```
        

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/f7af7a40-10cf-4899-8954-85e47428e7d0/image.png)

**요약**

Meta 태그는 **SEO**와 **사용자 경험**을 최적화하는 데 필수적입니다. Title과 Description을 비롯해, Open Graph와 Viewport 태그는 웹페이지의 검색 및 공유 가시성을 크게 향상시킵니다.

### 🍀 open graph

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/140a092d-8544-4010-9d25-032693b88a27/image.png)

- 콘텐츠 링크를 SNS에서 미리보기 형태로 제공하는 프로토콜.
    - 2010년 페이스북이 발표했으며, 트위터, 링크드인 등에서도 채택해 소셜 미디어 UX를 개선. → 링크 공유 시 나타나는 제목, 설명, 이미지 등이 Open Graph 태그로 생성됩니다.

**Open Graph 태그의 특징**

1. **소셜 미디어에 특화된 프로토콜**
    - 웹페이지 링크 공유 시 미리보기를 생성.
    - 사용자 유입과 전환율을 증가시켜 SEO에 간접적인 효과를 제공.
2. **SEO와의 관계**
    - SEO 점수에 직접 영향을 주지는 않지만, 웹사이트의 **가시성**과 **사용자 클릭률**을 높이는 데 기여.

**주요 Open Graph 태그**

- `og:title`: 페이지 제목
- `og:description`: 페이지 요약 설명
- `og:url`: 페이지 URL
- `og:image`: 공유될 이미지 URL
- `og:image:alt`: 이미지에 대한 설명
- `og:site_name`: 웹사이트 이름
- `og:type`: 콘텐츠 유형 (예: `article`, `website` 등)
- `article:author`: 작성자 정보
- `article:section`: 카테고리 정보
- `article:tag`: 태그 정보

**사용 예시**

- 오픈 그래프 태그의 종류는 매우 많다. `og:title` `og:description` `og:url` `og:image` `og:type` …
    
- property 속성에다가 넣는다. (일반 meta 태그는 name 속성에 값을 준다)
    
    ```jsx
    <!-- 일반 meta 태그 -->
    <meta
          name="description"
          content="Easy and convenient way to check real-time cryptocurrency price change along with the live charts"
    />
        
    <!-- 오픈 그래프 태그 -->
    <meta
          property="og:description"
          content="Easy and convenient way to check real-time cryptocurrency price change along with the live charts"
    />
    ```
    
    ```jsx
    <head>
      <meta property="og:title" content="My Awesome Page" />
      <meta property="og:description" content="This is the best page ever!" />
      <meta property="og:url" content="<https://www.example.com/page>" />
      <meta property="og:image" content="<https://www.example.com/image.jpg>" />
      <meta property="og:image:alt" content="An awesome example image" />
      <meta property="og:site_name" content="Example Site" />
      <meta property="og:type" content="article" />
      <meta property="article:author" content="<https://www.example.com/author/john-doe>" />
      <meta property="article:section" content="Technology" />
      <meta property="article:tag" content="Open Graph, SEO, React" />
    </head>
    ```
    

**요약**

Open Graph는 소셜 미디어에서 링크 공유 시 **가시성**과 **전환율**을 높여주는 태그입니다. 주요 태그를 활용해 링크의 제목, 설명, 이미지 등을 적절히 설정하면 사용자 경험을 대폭 개선할 수 있습니다.

### 🍀 react-helmet-async

**1. react-helmet-async란?**

- `<head>` 내의 **title**, **meta 태그** 등을 동적으로 관리할 수 있는 라이브러리.
- **react-helmet**의 비동기 문제를 해결한 포크 버전으로, **서버 사이드 렌더링(SSR)** 환경에서도 안정적으로 작동.

**2. 사용 이유**

- **React의 SPA 특성**:각 페이지별로 `<title>`과 `<meta>` 태그를 설정하기 어려워 SEO에 불리.→ `react-helmet-async`로 페이지별 **title과 meta 태그 관리**.
- **SEO 강화**:검색 엔진이 각 페이지 정보를 정확히 크롤링할 수 있도록 지원.

**3. 사용 방법**

1. **HelmetProvider로 앱 감싸기**
    
    `index.js` 또는 `main.js`에서 `<HelmetProvider>`로 앱을 감싼다.
    
    ```jsx
    import { HelmetProvider } from "react-helmet-async";
    
    root.render(
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    );
    
    ```
    
2. 페이지별 Helmet 사용 각 페이지에서 `<Helmet>`으로 **title과 meta 태그 설정**.
    
    ```jsx
    import { Helmet } from 'react-helmet-async';
    
    const HomePage = () => (
      <div>
        <Helmet>
          <title>Home - My Website</title>
          <meta name="description" content="Welcome to My Website" />
          <meta property="og:title" content="Home - My Website" />
          <meta property="og:description" content="This is the home page" />
          <meta property="og:url" content="<https://www.mywebsite.com/>" />
          <meta property="og:type" content="website" />
        </Helmet>
        <h1>Home Page</h1>
      </div>
    );
    
    export default HomePage;
    ```
    
3. SSR 환경에서 사용 (예: Express) 서버에서 `<title>`과 `<meta>` 태그를 미리 렌더링하여 SEO 강화.
    
    ```jsx
    const helmetContext = {}; // Helmet 컨텍스트 생성
    const html = renderToString(
      <HelmetProvider context={helmetContext}>
        <App />
      </HelmetProvider>
    );
    
    const { helmet } = helmetContext;
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          ${helmet.title.toString()} <!-- Title 렌더링 -->
          ${helmet.meta.toString()}  <!-- Meta 태그 렌더링 -->
        </head>
        <body>
          <div id="root">${html}</div>
        </body>
      </html>
    `);
    ```
    

**4. 특징**

- **SEO 강화**: 크롤러가 페이지 정보를 정확히 가져갈 수 있도록 지원.
- **SSR 친화적**: 서버에서 메타 태그를 렌더링하여 크롤러와의 호환성을 보장.
- **SPA와 SSR 모두 적합**: React SPA 및 Next.js 등 다양한 환경에서 사용 가능.

**요약**

`react-helmet-async`는 **React SPA**와 **SSR 환경**에서 SEO를 강화하기 위한 필수 도구로, 페이지별 **title**과 **meta 태그**를 동적으로 관리할 수 있어 검색 엔진 크롤링과 사용자 경험을 동시에 개선합니다.

### 🍀 Google Search Console (GSC)

**Google Search Console**은 웹사이트의 **검색 성능**을 모니터링하고 개선할 수 있는 **무료 도구**입니다.

**장점**

- **검색 성능 확인**: 클릭수, 노출수, 검색 순위 등 분석 가능.
- **문제 해결**: 크롤링 오류, 색인 문제, 모바일 사용성 점검 및 수정.
- **링크 분석**: 외부 및 내부 링크 데이터 제공.
- **구조화 데이터 확인**: 검색 결과에 리치 콘텐츠 표시 가능.
- **무료 서비스**: SEO 최적화에 필수적.

**단점**

- **실시간 데이터 부족**: 데이터 1~2일 지연.
- **경쟁사 정보 부재**: 외부 도구로 보완 필요.
- **초보자 진입 장벽**: 기술적 이해 필요.

구글 검색에 관한 정보들이 정리되어있다.

- [https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=ko](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=ko)

**단계별 활용 예시**

**Step 1: 계정 설정 및 사이트 등록**

- Google Search Console 계정을 생성.
- 사이트 속성 추가 후 소유권 확인 (HTML 태그, DNS 설정 등 활용).

**Step 2: 초기 데이터 확인**

- 색인된 페이지와 크롤링 오류를 점검.
- 기존 성능 데이터를 검토하여 클릭률이 낮은 페이지 확인.

**Step 3: 성능 분석**

- 특정 키워드의 순위 변화를 확인.
- 클릭수가 높은 페이지와 낮은 페이지를 비교하여 문제 식별.

**Step 4: 오류 수정**

- 404 오류 페이지를 리디렉션하거나 삭제.
- 모바일 사용성 문제를 수정하여 SEO 점수 개선.

Step 5: 최적화 작업

- 메타 태그 수정, 키워드 조정 등으로 콘텐츠 최적화.
- 내부 링크 추가로 페이지 연결성 강화.

**Step 6: 지속적인 모니터링**

- 정기적으로 Search Console 데이터를 검토하여 새로운 문제를 식별.
- 크롤링 및 색인 요청으로 최신 콘텐츠 업데이트를 Google에 반영.

해당 링크로 들어간 후 본인 웹사이트의 도메인을 입력하면된다.

- [https://search.google.com/search-console/welcome](https://search.google.com/search-console/welcome)

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/0ebd9e5b-6b8a-46d5-80ad-19f1599f5cae/image.png)

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/23ef6501-9d14-4c9b-8812-4459b6605118/image.png)

- 도메인 주소가 아닌, IP 주소를 등록시 안된다…
    - 그러므로 BooLock 도메인은 등록부터 안된다 ㅋㅋ
- 도메인만 지원하고 IP 주소를 지원하지 않는 이유
    - DNS 기반 인증으로 소유권 확인.
        
    - 도메인의 안정성과 IP의 가변성.
        
    - SEO 최적화 및 사용자 경험 강화.
        
    - HTTPS/SSL 표준 지원.
        
    - 구글 서치 콘솔의 검색 엔진 친화적 설계.
        
    - GPT 4o 답변
        
        ### 1. **도메인 기반 웹 관리의 표준성**
        
        - **DNS 인증 사용**
            
            구글 서치 콘솔의 도메인 속성은 DNS 인증(TXT 레코드)을 사용합니다. 이는 도메인의 소유권을 검증하기 위한 안전하고 표준적인 방법입니다.
            
            - IP 주소는 DNS 기반 소유권 인증을 지원하지 않으므로 DNS 레코드(TXT, CNAME 등)를 등록할 수 없습니다.
            - 따라서, IP 주소는 소유권 인증 과정에 적합하지 않습니다.
        - **멀티플 도메인 관리 지원**
            
            도메인 속성을 사용하면 하나의 도메인과 그 하위 도메인 전체를 관리할 수 있습니다(예: `example.com`, `www.example.com`, `sub.example.com`). 하지만 IP 주소는 특정한 하위 URL만 관리할 수 있어 구글의 관리 표준에 부합하지 않습니다.
            
        
        ---
        
        ### 2. **도메인은 안정성, IP는 가변성**
        
        - **IP 주소는 변할 수 있다**
            - IP 주소는 서버가 변경되거나 호스팅 제공업체를 변경할 때 변경될 가능성이 높습니다.
            - 반면, 도메인은 고정된 이름으로 IP가 변경되어도 계속 동일한 도메인으로 유지됩니다. 구글 서치 콘솔은 이러한 안정성을 중요시합니다.
        - **IP 주소 기반 서비스는 임시적**
            - IP 주소만 사용하는 서비스는 일반적으로 임시적이거나 개발/테스트용으로 사용되는 경우가 많습니다.
            - 구글은 정식 웹사이트의 관리와 최적화를 위해 설계된 플랫폼이기 때문에, 도메인 주소를 기준으로 사이트를 등록하도록 제한합니다.
        
        ---
        
        ### 3. **검색 엔진 최적화(SEO)와 사용자 경험**
        
        - **IP 주소는 SEO에 불리**
            - 도메인 주소는 사용자에게 친숙하고, 구글 검색 엔진이 페이지를 크롤링할 때 더 유리합니다.
            - IP 주소 기반 웹사이트는 신뢰성이 낮거나 정식 서비스가 아니라는 신호로 간주될 수 있습니다.
            - 구글은 서치 콘솔을 통해 SEO를 개선하려는 웹사이트를 지원하기 때문에, 도메인 기반 운영을 요구합니다.
        - **브랜드 정체성**
            - 도메인은 브랜드를 나타내는 중요한 요소입니다. 구글 서치 콘솔은 도메인 기반으로 작업함으로써 브랜드 인식과 신뢰도를 강화하려는 사이트를 지원합니다.
        
        ---
        
        ### 4. **HTTPS/SSL 지원 문제**
        
        - 대부분의 SSL/TLS 인증서는 도메인 이름 기반으로 발급됩니다.
            - IP 주소로 HTTPS를 지원하는 경우가 드물며, 지원되더라도 비용이 비싸고 관리가 복잡합니다.
            - 구글은 HTTPS를 강력히 권장하고 있으며, 이를 위해 도메인 기반 URL만 지원하는 방식을 채택합니다.
        
        ---
        
        ### 5. **구글 서치 콘솔의 기술적 설계와 목적**
        
        - **광범위한 도메인 관리를 지원**
            - 도메인 속성을 통해 사이트 전체 및 모든 하위 도메인에서 발생하는 데이터를 통합적으로 관리할 수 있습니다. IP 주소로는 이러한 기능을 제공하기 어렵습니다.
        - **검색 엔진 친화적 설계**
            - 구글 서치 콘솔은 검색 엔진 최적화를 위한 도구로 설계되었습니다. 검색 엔진은 도메인을 기반으로 색인을 생성하며, IP 주소 기반 웹사이트는 일반적으로 색인 생성에서 제외되거나 낮은 순위를 받을 가능성이 있습니다.

이후에 가비아에서 구매 후 [`http://boolock.site/`](http://boolock.site/) 연동한 뒤 `boolock.site` 도메인 등록하였다.

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/26cd9edf-bbab-4e38-b6b6-da11887a0420/854cd5d3-4a54-4884-9047-7b6ef4047f75.png)

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/c7e7f0d2-d8c7-49bb-a341-77c1c284ee9f/image.png)

- 도메인 등록 후 가비아에서 DNS 설정을 해주면 왼쪽화면이 된다.
- 등록 직후에는 검색된 파일이 없어서 구글 서치 콘솔 데이터에 아무것도 안뜬다.

**요약**

Google Search Console은 웹사이트 성능 분석과 SEO 최적화를 위한 필수 도구입니다. **도메인 기반 설정**이 요구되며, 지속적인 모니터링과 최적화로 검색 순위를 개선할 수 있습니다.

### 🍀 필자의 BooLock 사이트 적용기

1. **img의 alt 적용**

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/57b41e79-88d4-4860-9ae7-653e24b8a044/image.png)

- **문제**: 이미지에 `alt` 속성이 없어서 SEO 점수가 하락.
- **개선**: `alt` 속성을 추가해 검색 엔진이 이미지를 이해하도록 지원하고, 접근성을 개선.

**2. `index.html` meta 태그 수정**

- **수정 전**: 기본 meta 태그만 사용. SEO와 Open Graph 정보 부족.
- **수정 후**:
    - **기본 meta 태그**: `description`, `robots`, `author` 추가.
    - **Open Graph**: 페이지 제목, 설명, URL, 이미지 추가.
    - **Twitter Cards**: 트위터 공유를 위한 meta 태그 추가.
- before

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/images/boolock_logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BooLock</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="src/app/main.tsx"></script>
  </body>
</html>
```

- after

```html
<!doctype html>
<html lang="ko">
  <head>
    <!-- 기본 meta 태그 및 link -->
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/images/boolock_logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BooLock</title>
    <meta
      name="description"
      content="코딩 입문자들이 html과 css를 블록으로 쉽고 재밌게 배울 수 있는 플랫폼입니다."
    />
    <meta name="robots" content="index, follow" />
    <meta name="author" content="부스트캠프 9기 Web31팀" />
    <!-- Open Graph -->
    <meta property="og:title" content="BooLock" />
    <meta
      property="og:description"
      content="코딩 입문자들이 html과 css를 블록으로 쉽고 재밌게 배울 수 있는 플랫폼입니다."
    />
    <meta property="og:url" content="<https://boolock.site/>" />
    <meta property="og:image" content="/images/boolock_thumnail.png" />
    <meta property="og:image:alt" content="블록코딩 플랫폼 BooLock의 썸네일" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="600" />
    <meta property="og:site_name" content="BooLock" />
    <meta property="og:type" content="website" />
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="BooLock: 쉽게 배우는 블록 코딩" />
    <meta name="twitter:description" content="HTML과 CSS를 블록으로 쉽고 재미있게 배우세요!" />
    <meta name="twitter:image" content="/images/twitter_thumbnail.png" />
  </head>
  <body>
    <div id="root" aria-label="BooLock 플랫폼"></div>
    <script type="module" src="src/app/main.tsx" defer></script>
  </body>
</html>
```

**3. 공유 링크 미리보기 개선**

- **미리보기 이미지 등록 (가로세로 2:1)**
    
    ![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/dfc52f8d-39f2-4e2b-bb4d-c12e725a4c3e/image.png)
    
- **공유 링크 미리보기 before → after**
    

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/9d35e1fd-38a1-4bce-b2b3-04dfc1f862ae/image.png)

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/101cee61-26b0-41ed-81f4-1547a1c46083/image.png)

- 왼쪽의 밋밋한 미리보기 링크가 보이시나요?
- 반면에 Open Graph를 적용하면 오른쪽처럼 신뢰감 있고 가독성 좋은 미리보기 링크를 확인할 수 있습니다.

1. **react-helmet-async 적용**
    
    ```jsx
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </QueryClientProvider>
      </StrictMode>
    );
    
    ```
    
    - `main.tsx`에서 이렇게 App을 HelmetProvider로 감싸준다.
    - 이후 각 페이지 상단에 Helmet태그안에 meta 태그를 설정해주면 된다.
    
    ```jsx
      return (
        <>
          <Helmet>
            <title>BooLock - 홈</title>
            <meta
              name="description"
              content="코딩 입문자들이 HTML과 CSS를 블록으로 배우는 BooLock의 메인 페이지입니다."
            />
          </Helmet>
          {isPending && <Loading />}
          <div className="flex h-full w-full flex-col items-center">
            <HomeHeader isBlack={true} />
            <GuidesBox />
            <WorkspaceContainer />
            <WorkspaceModal />
          </div>
        </>
      );
    ```
    
2. **robots.txt 적용**
    
    ```
    # 모든 크롤러에게 전체 사이트 크롤링 허용
    User-agent: *
    Disallow:
    
    # 사이트맵 위치 지정
    Sitemap: <http://www.boolock.site/sitemap.xml>
    ```
    
    - 설정 내용
        - 모든 검색 엔진 크롤러가 전체 사이트를 크롤링하도록 허용.
        - 사이트맵 경로 명시: `http://www.boolock.site/sitemap.xml`
3. **라이트하우스 before -> after**
    

![390542208-95edc32c-5fea-4811-97e0-f85734475035.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/551c778e-64a4-41b8-a4f1-67cd11d8816f/390542208-95edc32c-5fea-4811-97e0-f85734475035.png)

![390541022-c7a93bc1-d454-4193-bb78-5e62d3706794.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/53787a23-833d-4223-97ad-45d76b4d684c/a0d2f958-4342-45f0-81ff-55c15dcc41cb/390541022-c7a93bc1-d454-4193-bb78-5e62d3706794.png)

**요약**

1. **alt 속성 추가**로 접근성 및 SEO 개선.
2. **meta 태그** 및 **Open Graph** 추가로 공유 링크와 SEO 강화.
3. **react-helmet-async**를 활용해 동적 meta 태그 관리.
4. **robots.txt**와 사이트맵 설정으로 검색 엔진 크롤링 최적화.
5. **라이트하우스 점수**를 개선해 성능과 SEO 완성도 향상.

BooLock은 이러한 작업을 통해 검색 엔진 및 사용자 경험을 크게 개선했습니다.

### 🍀 참고 링크

- [https://www.youtube.com/watch?v=giCR2IneTPw&list=PLxP1MBEv1X4zNAFpq7Ku2L33_V9QkRFEt&index=23](https://www.youtube.com/watch?v=giCR2IneTPw&list=PLxP1MBEv1X4zNAFpq7Ku2L33_V9QkRFEt&index=23)
- [https://www.youtube.com/watch?v=JiFPTlEMrAs&list=PLxP1MBEv1X4zNAFpq7Ku2L33_V9QkRFEt&index=22](https://www.youtube.com/watch?v=JiFPTlEMrAs&list=PLxP1MBEv1X4zNAFpq7Ku2L33_V9QkRFEt&index=22)
- [https://1point.kr/blog/insights/seo-search-engine-optimization/](https://1point.kr/blog/insights/seo-search-engine-optimization/)
- [https://velog.io/@lhj5924/사용자-친화-웹-React에서-검색엔진-최적화SEO하는-방법들](https://velog.io/@lhj5924/%EC%82%AC%EC%9A%A9%EC%9E%90-%EC%B9%9C%ED%99%94-%EC%9B%B9-React%EC%97%90%EC%84%9C-%EA%B2%80%EC%83%89%EC%97%94%EC%A7%84-%EC%B5%9C%EC%A0%81%ED%99%94SEO%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95%EB%93%A4)
- [https://velog.io/@parallelkim/리액트-SEO에-관한-모든-것](https://velog.io/@parallelkim/%EB%A6%AC%EC%95%A1%ED%8A%B8-SEO%EC%97%90-%EA%B4%80%ED%95%9C-%EB%AA%A8%EB%93%A0-%EA%B2%83)
- [https://www.npmjs.com/package/react-helmet-async](https://www.npmjs.com/package/react-helmet-async)
- [https://velog.io/@miyoni/noSSRyesSEO](https://velog.io/@miyoni/noSSRyesSEO)
- [https://jeonghwan-kim.github.io/dev/2020/08/15/react-helmet.html](https://jeonghwan-kim.github.io/dev/2020/08/15/react-helmet.html)
- [https://homebody-coder.tistory.com/entry/React의-SEO-최적화-방법-React-Helmet-Async-Prerender](https://homebody-coder.tistory.com/entry/React%EC%9D%98-SEO-%EC%B5%9C%EC%A0%81%ED%99%94-%EB%B0%A9%EB%B2%95-React-Helmet-Async-Prerender)