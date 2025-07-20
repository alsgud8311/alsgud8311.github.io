---
title: yarn workspace에서의 의존성 호이스팅 문제 해결하기
created: 2025-07-16 14:02
updated: 2025-07-16 14:02
tags: []
categories: []
aliases: []
description: ""
status: "draft" # draft, in-progress, completed
---
## 문제 발생 과정
현재 내 프로젝트 환경의 경우, yarn workspace를 사용함과 동시에 Yarn berry 버전을 사용하여 pnp를 이용한 의존성 관리를 하고 있었다. 
근데 이번 프로젝트에서는 추가적으로 웹뷰를 개발하여 알림을 적용해보자는 제안이 와 react-native를 통해 웹뷰를 개발하려고 하였다.

하지만 환경을 설정하는 과정에서 react-native의 경우 의존성이 Pnp로 관리되지 못한다는 공식문서의 경고를 보고 react-native 프로젝트만 따로 node-modules를 통해 의존성을 관리하려고 하였다.
```yml
// ./apps/native-package/
nodeLinker: node-modules
```
이 과정에서 watchman 라이브러리를 실행시키려는 과정에서 자신의 의존성에 있는 패키지를 찾아 실행시키려는데, 해당 패키지의 경우 루트의 `node_modules` 를 찾아 resolve하려는 문제가 있었다.

## 해결
metro는 react-native에서 사용되는 번들러로, 
모노레포 구조에서는 metro 설정을 따로 해주어야 한다.

```js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;

```
코드를 보면 프로젝트 루트의 node_modules부터 찾고 , 이후에 모노레포 루트단에 있는 `node_modules`를 찾는것을 볼 수 있다. 이러한 metro 설정을 통해 의존성 패키지들이 있는 디렉토리를 명시적으로 다시 지정해주면 된다.