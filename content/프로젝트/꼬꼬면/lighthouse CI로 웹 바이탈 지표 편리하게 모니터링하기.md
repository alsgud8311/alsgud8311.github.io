---
title: lighthouse CI로 웹 바이탈 지표 편리하게 모니터링하기
created: 2025-06-25 13:32
updated: 2025-06-25 13:32
tags: []
categories: []
aliases: []
description: ""
status: "draft" # draft, in-progress, completed
---
## 문제상황
현대 웹 개발에서 성능 최적화는 선택이 아닌 필수가 되었다. 특히 구글의 `Core Web Vitals`가 검색 순위 결정 요소로 포함되면서, 웹 성능 지표에 대한 지속적인 모니터링과 개선이 더욱 중요해졌다.

하지만 매번 빌드하고.. 서버 키고... 크롬 개발자도구 들어가서 lighthouse 분석하고... 이 과정에서 성능이 크게 떨어지는 지점이 있으면 핫픽스하고 하는 일련의 과정 자체가 너무 비효율적인 것 같다는 생각이 들어 Lighthouse CI를 통해 릴리즈 직전의 development 브랜치와 메인에서 각각 웹 바이탈 지표를 측정하면서 CI(Continuous Integration) 과정을 보완하려 한다.


## 해결하기
매번 측정하기 귀찮은 만큼, 처음에 필요한 페이지들을 선제적으로 PR을 올릴 때 Lighthouse CI(lhci)를 사용하여 CI 과정에서도 lighthouse지표를 볼 수 있도록 하기로 했다.
### Lighthouse CI란?
Lighthouse CI는 구글에서 개발한 오픈소스 도구로, CI/CD 파이프라인에서 Lighthouse 성능 테스트를 자동화할 수 있게 해준다. 단순히 일회성 성능 측정을 넘어서 지속적인 성능 모니터링과 성능 회귀 방지를 가능하게 한다.

### 주요 특징

**자동화된 성능 측정**: 코드 변경사항이 있을 때마다 자동으로 성능 지표를 측정

**성능 회귀 감지**: 기준값 대비 성능이 저하되었을 때 빌드를 실패시켜 성능 회귀를 방지

> 성능 회귀(performance regression)
>소프트웨어가 여전히 올바르게 작동하지만 이전보다 더 느리게 수행되거나 더 많은 메모리나 자원을 사용하는 상황

**다양한 환경 지원**: 로컬 개발환경부터 GitHub Actions, Jenkins 등 다양한 CI 환경에서 실행 가능

**풍부한 리포팅**: 성능 지표를 시각화하고 히스토리를 추적 가능


## 설정하기
### 의존성 설치
```
yarn global add lhcl

yarn add -D lhcl
```

### lighthouserc.js 설정하기
```js
module.exports = {
  ci: {
    collect: {
      startServerCommand: "yarn start",
      url: ["http://localhost:3000"],
      numberOfRuns: 5,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./lhci_reports",
      reportFilenamePattern: "%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%",
    },
  },
};
```
assertions는 내가 설정한 기준에 맞춰서 기준 이하일 경우 경고해줄 수 있도록 하였다.

upload의 경우는 filesystem을 이용해서 lhci_report로 outputDir를 설정해주면
```json
// 내가 설정한 횟수만큼 lighthouse 측정 결과가 배열에 담겨 나옴
[
  {
    "url": "http://localhost:3000/",
    "isRepresentativeRun": false,
    "htmlPath": "프로젝트 경로/설정한 날짜-report.html",
    "jsonPath": "json 경로",
    "summary": {
      "performance": "성능 지표",
      "accessibility": "접근성 지표",
      "best-practices": "웹 표준 준수 여부",
      "seo": "검색엔진 성능"
    }
  },
]
```
이런 식으로 내가 설정해놓은 결과를 볼 수 있는데, 이에 따라서 PR의 댓글로 Lighthouse 지표 측정 결과를 띄워줄 수도 있다.

### Workflow 설정
```yml
name: Lighthouse CI
on:
  pull_request:
    branches: [main, development]
  push:
    branches: [main]
permissions:
  contents: read
  issues: write
  pull-requests: write

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "yarn"

      - name: Install dependencies
        run: |
          yarn set version berry
          yarn install

      - name: Build Next.js app
        run: yarn build
        env:
          필요한 환경변수 설정

      - name: Run Lighthouse CI
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
        run: yarn lhci || echo "Failed to run Lighthouse CI"
      - name: Format lighthouse score
        id: format_lighthouse_score
        uses: actions/github-script@v7 # 최신 버전 사용
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |

            const fs = require('fs');

            // 파일 경로 수정 (실제 경로로 변경 필요)
            const results = JSON.parse(fs.readFileSync("manifest.json이 있는 경로"));
            let comments = "";

            results.forEach((result, idx) => {
                const { summary, jsonPath } = result;
                
                // details 변수를 summary 뒤에 선언
                const details = JSON.parse(fs.readFileSync(jsonPath));
                const { audits } = details;

                const formatResult = (res) => Math.round(res * 100);

                Object.keys(summary).forEach(
                (key) => (summary[key] = formatResult(summary[key]))
                );

                // 점수 색상 함수
                const score = (res) => (res >= 90 ? "🟢" : res >= 50 ? "🟠" : "🔴");

                const comment = [
                ``,
                `## 🚀 Lighthouse Report for TEST${idx+1}`,
                `### 📅 Date: ${new Date().toLocaleDateString()}`,
                `| Category | Score |`,
                `| --- | --- |`,
                `| ${score(summary.performance)} Performance | ${summary.performance} |`,
                `| ${score(summary.accessibility)} Accessibility | ${summary.accessibility} |`,
                `| ${score(summary['best-practices'])} Best Practices | ${summary['best-practices']} |`,
                `| ${score(summary.seo)} SEO | ${summary.seo} |`
                ].join("\n");

                const detail = [
                ``,
                `### 📊 Performance Details`,
                `| Metric | Score | Value |`,
                `| --- | --- | --- |`,
                `| ${score(Math.round(audits["first-contentful-paint"].score * 100))} First Contentful Paint | ${Math.round(audits["first-contentful-paint"].score * 100)} | ${audits["first-contentful-paint"].displayValue} |`,
                `| ${score(Math.round(audits["largest-contentful-paint"].score * 100))} Largest Contentful Paint | ${Math.round(audits["largest-contentful-paint"].score * 100)} | ${audits["largest-contentful-paint"].displayValue} |`,
                `| ${score(Math.round(audits["cumulative-layout-shift"].score * 100))} Cumulative Layout Shift | ${Math.round(audits["cumulative-layout-shift"].score * 100)} | ${audits["cumulative-layout-shift"].displayValue} |`
                ].join("\n");
                
                comments += comment + "\n" + detail + "\n\n";
                }); 

            // 출력 설정
                core.setOutput('comments', comments);

      - name: Comment PR
        uses: unsplash/comment-on-pr@v1.3.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          msg: ${{ steps.format_lighthouse_score.outputs.comments }}

```
이런 식으로 보고서가 출력되도록 하면 된다!
권한 입력을 안할 경우 PR 댓글 쓰는 과정에서 unsplash가 권한에서 막혀 오류가 나니 권한 설정은 주자

![](https://i.imgur.com/3zMyuTY.png)
그럼 이런 식으로 결과가 나오는 것을 볼 수 있다!

### 참조
https://tech.kakaoent.com/front-end/2022/220602-lighthouse-with-github-actions/