# Atomic Design


- Atoms(원자): 가장 작은 UI 구성 요소 (버튼, 입력 필드 등)
- Molecules(분자): 여러 원자가 모여서 이루어진 더 복잡한 요소 (입력 필드 + 버튼)
- Organisms(생물): 여러 분자가 모여서 큰 UI 컴포넌트 (폼, 네비게이션 바 등)
- Templates(템플릿): UI 컴포넌트들의 구조 (페이지 레이아웃 등)
- Pages(페이지): 템플릿에 실제 데이터를 넣어서 완성된 페이지
	
## 구성요소
### 1. **Atom(원자)**: 가장 작은 단위의 UI 요소

```
// Button.js
const Button = ({ label }) => <button>{label}</button>;
export default Button;
```

### 2. **Molecule(분자)**: 여러 Atom이 모여서 더 복잡한 요소

```
// SearchBar.js
import Button from './Button';

const SearchBar = () => (
  <div>
    <input type="text" />
    <Button label="Search" />
  </div>
);
export default SearchBar;
```

### 3. **Organism(생물)**: 여러 Molecule이 모여서 의미있는 UI 요소구성

```
// Header.js
import SearchBar from './SearchBar';

const Header = () => (
  <header>
    <h1>My App</h1>
    <SearchBar />
  </header>
);
export default Header;
```

### 4. **Template(템플릿)**: 레이아웃 구조 정의

```
// PageTemplate.js
import Header from './Header';

const PageTemplate = ({ children }) => (
  <div>
    <Header />
    <main>{children}</main>
  </div>
);
export default PageTemplate;
```

### 5. **Page(페이지)**: 템플릿에 실제 데이터를 넣어 완성된 페이지

```
// HomePage.js
import PageTemplate from './PageTemplate';

const HomePage = () => (
  <PageTemplate>
    <p>Welcome to the Crong world!</p>
  </PageTemplate>
);
export default HomePage;
```

storybook -> 컴포넌트 하나에 대해서 스토리를 넣어 테스트하듯이 함
작은 컴포넌트만 가능하기 떄문에 아토믹 디자인과 얼추 맞음

컴포넌트를 잘 나누면 
- Jest 뿐만 아니라 테스트에도 용이
- 재사용성, 생산성 향상
- 디자인 시스템과의 조화
-> 컴포넌트 디자인의 장점

단점 -> 파일이 너무 많아짐/