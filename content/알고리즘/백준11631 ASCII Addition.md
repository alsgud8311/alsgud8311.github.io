---
title: 백준11631 ASCII Addition
created: 2025-02-09 16:12
updated: 2025-02-09 16:12
tags:
  - 백준
  - 알고리즘
categories: 
aliases: 
description: ""
status: draft
---
### 문제
아.. 이거 전에 모 코테에서 본 문제와 비슷한 문제
그 때 제대로 풀지 못해서 멘붕 왔었는데 이번엔 제대로 풀어본다.

![](https://i.imgur.com/xQr9x8I.png)

아스키 아트는 칠해지는 부분이 x로 되어 있고, 총 7개의 row와 5개의 column으로 되어 있다.
`a+b`의 형태로 아스키 아트가 주어지면 이를 인식하고 이에 대한 두 수의 합을 다시 아스키 코드로 나타내야 한다.
```js
const fs = require("fs");

const INPUT_FILE = process.platform === "linux" ? "/dev/stdin" : "./inputs.txt";
const input = fs.readFileSync(INPUT_FILE).toString().trim().split("\n");

const asciiPatterns = [
  `xxxxx\nx...x\nx...x\nx...x\nx...x\nx...x\nxxxxx`,
  `....x\n....x\n....x\n....x\n....x\n....x\n....x`,
  `xxxxx\n....x\n....x\nxxxxx\nx....\nx....\nxxxxx`,
  `xxxxx\n....x\n....x\nxxxxx\n....x\n....x\nxxxxx`,
  `x...x\nx...x\nx...x\nxxxxx\n....x\n....x\n....x`,
  `xxxxx\nx....\nx....\nxxxxx\n....x\n....x\nxxxxx`,
  `xxxxx\nx....\nx....\nxxxxx\nx...x\nx...x\nxxxxx`,
  `xxxxx\n....x\n....x\n....x\n....x\n....x\n....x`,
  `xxxxx\nx...x\nx...x\nxxxxx\nx...x\nx...x\nxxxxx`,
  `xxxxx\nx...x\nx...x\nxxxxx\n....x\n....x\nxxxxx`,
  `.....\n..x..\n..x..\nxxxxx\n..x..\n..x..\n.....`,
];

const asciiToCharMap = {};
asciiPatterns.forEach((pattern, index) => {
  asciiToCharMap[pattern] = index === 10 ? "+" : index.toString();
});

const ROWS = 7;
const COLS = 5;

const splitInput = [];
for (let i = 0; i < input[0].length; i += COLS + 1) {
  const block = [];
  for (let j = 0; j < ROWS; j++) {
    block.push(input[j].slice(i, i + COLS));
  }
  splitInput.push(block.join("\n"));
}

const expression = splitInput.map((block) => asciiToCharMap[block]).join("");
const [a, b] = expression.split("+").map(BigInt);

const result = (a + b).toString();

const charToAsciiMap = Object.fromEntries(
  asciiPatterns.map((pattern, index) => [
    index === 10 ? "+" : index.toString(),
    pattern,
  ])
);

const resultAscii = Array(ROWS).fill("");
for (const char of result) {
  const asciiBlock = charToAsciiMap[char].split("\n");
  for (let i = 0; i < ROWS; i++) {
    resultAscii[i] += (resultAscii[i] ? "." : "") + asciiBlock[i];
  }
}

console.log(resultAscii.join("\n"));

```
응 다 노가다로 아스키 맵 만들면 그만이야~
