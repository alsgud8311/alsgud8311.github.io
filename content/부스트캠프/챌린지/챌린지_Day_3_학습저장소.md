# 체크리스트
- 트리 형태 데이터 구조 설계 및 구현
	- 요구조건 분석
	- 데이터 타입 선택
	- 각 속성 선택
- Parser 설계 및 구현
- 세부기능 function 설계
	- displayJSON()
	- elementByAttribute()
	- reportByClass()
- 성능 테스트

# 트리 형태 데이터 구조 설계
XML 샘플은 HTML, Andoid Layout, Property List의 형태가 주어졌다.
지원하는 XML 태그 스펙부터 살펴보았다.

## 요구조건 분석
- 도입부(Prolog)
	- 앞이 ?로 시작 `<?xml>`
	- XML에 대한 정보
- 주석(Comment)
	- 앞이 !로 시작 `<!DOCTYPE>`
	- 주석으로 처리, 저장X
- 요소 (Element)
	- 모든 요소는 시작 태그로 시작해서 종료 태그로 끝남
	- 시작 태그와 종료 태그 사이에 다른 값(content)이나 element를 포함 가능
	- 값이 없어도 되는 `</br>`과 같은 태그들도 있음(자체종결태그)
	- 시작태그 `>`좌측 부분에 태그의 속성 명시 가능

'XML'과 '트리 형태 데이터 구조'를 보고 가장 처음 생각났던 것은 리액트의 가상돔(virtual DOM)이다. 가상 DOM은 실제 DOM의 가벼운 복사본으로 메모리 상에 존재하며, JavaScript 객체 형태로 존재하기 때문에 이러한 구조를 생각하면서 데이터 구조를 설계하면 되겠다 생각했다. 여기서 주어진 데이터 구조만 좀만 변형하면 될 것 같다.

## 내부 데이터 구조 설계
### 조건으로 주어진 데이터 구조
- `prolog` 항목 : Map
    - XML 메타 데이터를 기록한다.
    - `{ "version" : "1.0" , "encoding" : "utf-8" }`
- `elements` 항목 : Array
    - 최상위 태그 요소부터 위에서 아래로 순서대로 태그 단위로 기록한다.
- `element` 태그 : Map
    - `element` 항목에 태그 이름
    - attributes 항목 : Array
        - 태그의 모든 속성을 attribute 구조로 저장한다.
- `attribute` 속성 : Map 
    - `name` 속성 이름
    - `value` 속성 값

위와 같은 정보를 포함하는 데이터 구조라고 했으니 여기서 해당 element의 이름이나 트리 구조를 명확히 알 수 있도록 children을 넣어주면 될 것 같다.
..라고 생각했으나 다음 배경지식에서 스택이 나온걸 보아 의도는 스택을 통해서 어떻게 트리구조를 표현하는지에 대해서도 중요하게 보는 것 같다. 자료구조의 활용도 중요하니 이번엔 스택을 최대한 활용해보기로 했다.
### XML class
XML 클래스는 prolog가 있는 XML도 있고 없는 XML도 있다.
이러한 부분을 고려하여 설계를 해야할 것 같다.
해당 XML은 루트가 아닌, 해당 문서 자체를 포괄하기 때문에 따로 노드를 넣어줄 때는 루트만 넣어주고 루트 안에 다른 element들이 들어가면 될 것 같다.

```js
export class XML {
  constructor(prolog = []) {
    this.prolog = prolog;
    this.root = null;
    this.nodes = {};
  }
}

```

### Root 클래스
루트에는 모든 Element들과 각 태그별로 수를 관리한다.
해당 Elements에는 모든 Map 형태로 된 모든 Element들을 관리하는데, 여기서 서브트리에 대한 문제가 생긴다.
재귀함수가 아닌 스택으로 표현하기 위해서는 하위 트리를 구분하는 무언가가 있어야 한다.
그렇기 때문에 똑같이 < 문자열을 추가해서 구분하면 어떨까? 생각했다. 위에서 하나씩 다시 뽑으면 닫히는 태그에서 시작해서 열리는 태그로 끝나니까 이걸 조건문으로 걸어놓으면 무한루프에 빠질 일이 없다고 생각했다.

```js
class Root {
  constructor(name, content = "", attributes = []) {
    this.name = name;
    this.content = content;
    this.attributes = attributes;
    this.elements = [];
  }
}
```

### Element Map
Element는 각 요소만의 속성, 태그 안의 값들을 관리한다.
서브트리에는 하위 서브트리를 포함하며, Node 클래스로 되어있다.
해당 클래스의 element 속성에는 element의 이름과 attrbutes 속성이 있어 `속성이름: 속성값` 으로 된 attributes들을 저장한다.
일단은 함수로 구현해보았다.

```js
function initElement(name, content, attributes) {
  return {
    name: name,
    content: content,
    attributes: attributes,
  };
}
```

## Parser 설계 및 구현
어떻게 이러한 태그들이 뒤섞여 있는 많은 예외에서 잘 태그를 걸러내고, 알맞게 구조 안에 넣는 것이 아마 가장 큰 문제일 것 같다. 
나 또한 이를 어떻게 하면 좋을까 생각했는데, 현재 생각난 단계를 말해보자면
### 작동 방식 설계
1. readfileSync로 파일 통채로 읽기
2. < 앞과 >뒤에 무조건 \n 붙이기
3. 줄바꿈 기준으로 split하기
4. split해서 받은 배열을 돌면서
	1. `<!`로 시작할 경우 무시
	2. `<?`로 시작할 경우 새로운 Root 인스턴스 생성
	3. 이 외에 `<`로 시작하는 경우
		1. 새로운 element의 시작과 동시에 하위 element임을 구분하는 '<' 를 elements 배열에 함께 추가
		2. 자체종결성을 가진 경우 -> 해당 element를 바로 집어넣음
		3. element 안 텍스트인 경우 -> content에 추가
		4. 여는 태그와 닫는 태그가 따로 존재할 경우 -> 다음 배열이 똑같은 `<구분자` 와 같을 때까지 하위 element임을 구분하는 '<'를 추가하고 배열 돌기
		5. 나가면서 '>' 를 배열에 추가
를 구상했다.
따로 태그를 통해 구분하게 된다면 보다 나중에 꺼내서 JSON 형식이 아니라 다시금 XML 형식으로도 바꿀 수도 있기 때문에 활용성을 높이고자 태그를 추가했다.
elements에는 각 element들의 자식부모 관계를 보다 명확히 보고자 stack 변수를 따로 두어 어디에서 괄호를 닫을지 판단한 후 괄호를 닫았다.

### HTML 파일 실행결과
![](https://i.imgur.com/gTiVNgk.png)

![](https://i.imgur.com/IgQ6DQ7.png)

### Android Layout 실행 결과
![](https://i.imgur.com/6Yil37O.png)

![](https://i.imgur.com/9sqxpUG.png)

### Property List 실행결과
![](https://i.imgur.com/uXYRYOA.png)
![](https://i.imgur.com/huPfNZw.png)

![](https://i.imgur.com/WNt6nv3.png)

모두 구현을 성공했다!
![](https://i.imgur.com/NbbjzG3.png)

## 세부 기능 설계 및 구현
사실 세부기능은 뭐 별거 없다.
만들어진 데이터를 가지고 원하는 값만 뽑아내면 되므로 그리 어렵지 않았다.
### displayJSON() 구현
`저장한 데이터 구조를 표준 JSON 형식으로 변환해서 문자열로 리턴한다.`
JSON 형식으로 변환하는 것은 JSON.stringify를 이용하면 손쉽게 문자열로 변환할 수 있다.
클래스를 돌면서 값들을 모두 return시켜주면 모두 합쳐진 문자열을 받을 수 있다.
```js
export function displayJSON(xml) {
  return JSON.stringify(
    xml,
    (key, value) => {
      if (value instanceof Map) {
        return Object.fromEntries(value);
      }
      if (value instanceof Root) {
        return {
          name: value.name,
          content: value.content,
          attributes: value.attributes.map((attr) => {
            if (attr === "<" || attr === ">") return attr;
            else return Object.fromEntries(attr);
          }),
          elements: value.elements,
        };
      }
      return value;
    },
    2
  );
}
```


![](https://i.imgur.com/jKNoXns.png)
![](https://i.imgur.com/snIXx6k.png)
![](https://i.imgur.com/EwvRtNe.png)
HTML문을 사용해서 실행시켜봤다.
정상적으로 작동한다!
### elementByAttribute() 구현
`파싱한 트리에서 attribute.name 값을 기준으로 모든 element를 찾아서 배열로 리턴한다.`
해당 함수에 대한 설명은 다소 모호한 부분이 있다. 슬랙에서도 보니 사람마다 해석하는 바가 조금씩 다른 것 같다.
내 기준에서 attribute.name값을 기준으로 모든 element를 찾는다는 말은 **모든 element 중에서 해당 attribute.name값을 포함하는 element를 모두 찾아서 배열로 리턴**한다고 이해했다.
```js
export function elementByAttribute(xml, attribute) {
  const elements = xml.root.elements;
  let result = [];
  for (const elem of elements) {
    if (typeof elem === "string") continue;
    if (elem.attributes.length === 0) continue;

    for (const attr of elem.attributes) {
      if (attr.get("name").includes(attribute)) {
        result.push(elem);
        break;
      }
    }
  }
  return result;
}
```
그래서 그냥 해당 element들을 돌면서 attribute의 이름이 포함되면 배열에 담아 리턴하는 방식으로 구현했다.
```js
function main() {
  let file = fs.readFileSync("./test.txt").toString();
  file = clearSpace(file);
  file = addSpace(file).split("\n");

  let xml, root;
  let stack = [];

  for (const line of file) {
    [root, stack, xml] = preprocessing(line, root, xml, stack);
  }

  // console.log(displayJSON(xml));
  console.log(elementByAttribute(xml, "android"));
  // console.log(reportByClass(xml));
}

main();
```
main 함수를 따로 만들어 여기에서 모든 전처리와 함수 사용이 이루어지도록 했다.

![](https://i.imgur.com/JybJz5o.png)

android attribute 이름을 포함한 모든 element들을 잘 가지고 오고 있음을 볼 수 있다.

### reportByClass() 구현
`파싱한 트리에서 element 종류별로 개수를 카운트해서 리턴한다.`
나는 처음에 데이터 구조를 만들 때 어차피 개수를 따로 카운트하여 xml 클래스의 nodes 객체에 담아두었기 때문에 구현하는데 큰 어려움이 없었다.

```js
export function reportByClass(xml) {
  return xml.nodes;
}
```

![](https://i.imgur.com/f1D4e5l.png)
잘 가져오고 있음을 볼 수 있다.
이거 개수 세는 것도 참 힘들었지만 나름 하면서 전처리 과정을 보다 잘 이해할 수 있었기에 훌륭한 과제였다!
