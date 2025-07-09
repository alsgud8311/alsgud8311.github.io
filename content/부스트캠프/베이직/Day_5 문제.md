# 학습 목표

- graphviz 문법을 이해하고, dot 형식을 지원하는 그래프 생성 도구를 짝으로 함께 설계하는 것이 목표다.
    
- 코드를 구현하기 전에 무엇을 구현해야 하는가 이해도를 높이고 해결하려는 것에 집중한다.
    

# 사전지식

- 없음.
    

# 기능요구사항

다 같이 graphviz 오픈소스와 지원하는 문법 형식에 대해 조사한다.

[graphviz 예시](https://dreampuf.github.io/GraphvizOnline/?compressed=MQZQggsgCgMgogAgGYHsBOCBCKUGcAuAxgIYC2ADlsbgJaEBQAJjQOZrHkAWCA4ggN716CEbgCuAIzYduhADZiCAUzQB9AAwDhIhAQCecpQgC8CfMQkBubSMIo56YxIVLrOhHItK5JhACIQFQA3OiMoYkIAa2IWJT83dx1xKXYuBHlFfBVVAEYtRIKEKDQURjFCfAQAbVxODiUnFAAPXXwDBqQaOUNGdPtHQj1iADsAXRtC0UixBMmRcjRQ2bn8GnxDZcnPCW9fP2LS8vwAOk7DeInJuwc0YzlWTnw2JT1NnQBfS4Qv0UlpNIyyjUACZ8nMRAB5NCMFTVWr1RotfSGYxnHp9G7GQYjcbgkToGFoACSjDeBQWhwqZMS212pj8UMJpy6cWp7mujnuLEez1ePwQn3cgu%2B7mS-1kCiBqgAnGCCsijKZzFZ%2BbSfPSQHplKQihForELld%2BrdnGJXBN%2BWLUhLMtkcppBHiECB8Ithiw4XVyA0JM1Wu1UV10Rzbtixvz3EThpUal6fX6FYHukpeiGsUNw061XsQCgxGhCEpmec2To01yeWgXm9hSJayKktMEABaAB8ztdNHdywWoRb7aj%2BGWq3WRjbHbdLGWBJUJP7E67U4mFLKFXnB1XQ-o7yAA&compressed=MQZQggsgCgMgogAgGYHsBOCBCKUGcAuAxgIYC2ADlsbgJaEBQAJjQOZrHkAWCAYmTQBsAngBU0AU3EIA3vQTyEAekUJAHo2AdloSBUCcAa43IUApFJwB2CANoDiAI3ECAvACIjpxwBoEuTh3H3CNNEIBcQ9CFAF0e2sBAFdxAF0Abn15A2ITKUsbOyc0jPdPb3Jff0Dg0PDI6LiklIQIYjQhCytbB0cGpoKvHz8AoJCEMIi0e3IaEwBrWoUsQQEW7PbMee6ikv7yocrRtkkTWrrlBEAF0cABye09WZczAFoAPnrG5qy2p1IUfE5xNEcZw3SUgeTyaizejg%2BXx%2Bf2S12Md0eKwEC1eOUcSGIUN%2B-1SgIQwKRKNaaIxWJh9AAvvQgA)

```js
#SAMPLE for Boostcamp Basic
digraph FamilyTree {
    // 노드 정의
    John [label="John", shape=circle, color=blue];
    Jane [label="Jane", shape=circle, color=blue];
    Mary [label="Mary", shape=circle, color=pink];
    Bill [label="Bill", shape=circle, color=green];

    // 에지 정의
    John -> Mary [label="mother"];
    Jane -> Mary [label="mother"];
    John -> Bill [label="father"];
    Jane -> Bill [label="father"];
}
```

- 최소 2명 이상이 하나의 형식에 대해 도전하고 같이 학습하고 설계한다.
- 어떤 형식을 기준으로 할 것인지 2명 이상이 함께 결정한다.
- 프로그래밍 요구사항을 만족하는 그래프 생성 도구를 설계한다.
- 예시에 있는 구조와 속성, 이름 등이 바뀌어도 동작하도록 설계한다.
- 전달할 데이터 구조를 어떻게 표현할 것인가 결정한다.
- 설계 후에 구현을 해도 무방하지만 구현만 해서는 안된다.
- 구현하는 경우에 설계 결과물이 프로그래밍 결과물만큼 상세하거나 많아야 한다.
    

#### 설계 결과 제출

- 해결하려는 문제와 동작 방식에 대해 이해한 내용을 요약한다.
- 설계는 데이터 구조와 데이터 흐름을 명시한 그림을 손으로 그린다.
- 손으로 그린 그림을 캡처해서 gist에 첨부한다.
- gist에 README.md 파일을 추가하고 설계 의도와 방향에 대해 간략하게 설명을 붙인다.
    

# 프로그래밍 요구사항

다음과 같이 패키지 > 파일 > 타입 > 속성 단계별로 구성된 구조를 그래프로 데이터 구조를 넘기면 `graphviz` 출력 형식 문자열로 변환하는 프로그램을 작성한다.

- 패키지는 여러 파일을 포함한다.
- 파일 하나에는 타입 하나를 포함한다.
- 타입은 고유 이름과 여러 속성을 가진다.
- 속성마다 특정 타입을 참조한다.
- System 아래에는 Integer, String 타입이 이미 존재한다.
    

#### Service 패키지

![](https://i.imgur.com/mCFsCk9.png)


![스크린샷 2024-06-28 오후 11.42.25.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/e38e7aad-5ec6-442f-8c61-c603fe2723ee/843f5b88-9cd6-42ff-8909-94324c4dfb90/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA_2024-06-28_%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE_11.42.25.png)
##### 1. Product 타입

```json
package Service

Type Product {
    sku : String
    price : Int
    title : String
}
```

##### 2. Order 타입

```
package Service

Type Order {
    orderId : String
    product : Product
}
```

# 예상결과 및 동작예시

완벽하게 동일할 필요는 없고, 스타일이나 색상을 제외하고 필수 항목만 비슷하게 채우면 된다. 패키지 > 파일 > 타입 포함 관계를 볼 수 있으면 어떤 형식으로도 가능하다.

```
digraph G {

   subgraph cluster_0 {
    style = tab;
    color=blue;
    label = "Service Package";
        subgraph cluster_1 {
            Product [shape=box style=filled color=cyan]
            sku;
            price;
            title;
            label = "Product.file";
            color=lightgrey;
        }
      
        subgraph cluster_2 {
            Order [shape=box style=filled color=cyan]
            orderId;
            product;
            label = "Order.file";
            color=lightgrey;
        }
    }
  
    subgraph cluster_9 {
        style = tab;
        label = "System Package";
        color=blue;
    
        subgraph cluster_10 {
            String [shape=box style=filled color=cyan]
            Int [shape=box style=filled color=cyan]
            label = "Source.file";
            color=lightgrey;
      }
    }
    
    sku -> String;
    price -> Int;
    title -> String;
    orderId -> String;
    product -> Product;
}
```

![graphviz-service](https://lucas-image.codesquad.kr/1715669344967graphviz-service.png)

##### 온라인 샘플

[샘플 바로가기](https://dreampuf.github.io/GraphvizOnline/?compressed=MQZQggsgCgMgogAgGYHsBOCBCKUGcAuAxgIYC2ADlsbgJaEBQAJjQOZrHkAWCA4ggN716CEbgCuAIzYduhADZiCAUzQB9AAwDhIhAQCecpQgC8CfMQkBubSMIo56YxIVLrOhHItK5JhACIQFQA3OiMoYkIAa2IWJT83dx1xKXYuBHlFfBVVAEYtRIKEKDQURjFCfAQAbVxODiUnFAAPXXwDBqQaOUNGdPtHQj1iADsAXRtC0UixBMmRcjRQ2bn8GnxDZcnPCW9fP2LS8vwAOk7DeInJuwc0YzlWTnw2JT1NnQBfS4Qv0UlpNIyyjUACZ8nMRAB5NCMFTVWr1RotfSGYxnHp9G7GQYjcbgkToGFoACSjDeBQWhwqZMS212pj8UMJpy6cWp7mujnuLEez1ePwQn3cgu%2B7mS-1kCiBqgAnGCCsijKZzFZ%2BbSfPSQHplKQihForELld%2BrdnGJXBN%2BWLUhLMtkcppBHiECB8Ithiw4XVyA0JM1Wu1UV10Rzbtixvz3EThpUal6fX6FYHukpeiGsUNw061XsQCgxGhCEpmec2To01yeWgXm9hSJayKktMEABaAB8ztdNHdywWoRb7aj%2BGWq3WRjbHbdLGWBJUJP7E67U4mFLKFXnB1XQ-o7yAA)