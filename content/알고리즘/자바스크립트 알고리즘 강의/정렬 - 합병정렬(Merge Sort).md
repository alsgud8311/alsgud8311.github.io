# 버블, 선택, 삽입 정렬의 한계

버블, 선택, 삽입 정렬의 치명적인 단점은 느리다는 것이다. 평균적인 정렬 시간 복잡도가 $O(n^2)$이면 다른 $O(n)$이 걸리는 정렬들보다 시간이 제곱된다는 것을 의미하고, 이는 점점 정렬할 데이터의 수가 많아지면 많아질수록 훨씬 큰 차이가 나게 된다. 

![](https://i.imgur.com/w8KHjDC.png)

그래프에서도 볼 수 있듯이 $O(n)$과 $O(n^2)$의 차이가 가면 갈수록 더욱 크게 나는 것을 볼 수 있다.

이를 통해 우리는 보다 많은 데이터를 빠르게 처리하기 위해 시간 복잡도를 줄일 필요가 있다.

# 합병 정렬(Merge Sort)

## 합병정렬이란?

비교 기반 정렬 알고리즘으로, 폰 노이만이 1945년도에 개발한 분할 정복 알고리즘 중 하나이다. 

이를 뒷받침하는 개념은 분할, 합병, 정렬이라는 시 가지 조합으로 이루어져 있다.
합병 정렬은 0개요소, 1개 요소 배열이 이미 정렬되어 있다는 점을 활용하여 배열을 더 작은 배열로 나눈다(그래서 분할 정복 알고리즘이다). 그리고 0이나 1개 요소 배열이 될 때까지 계속 분할하다가 다시 병합(merge)시키는 방식이다.

<img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Merge-sort-example-300px.gif">

위의 gif를 보면 **6,5,3,1,8,7,2,4**의 수들이 있다.

처음에는 이를 두개로 나누어 6,5,3,1과 8,7,2,4의 배열로 분할되고, 이를 다시 분할하여 6,5 / 3,1 / 8,7 / 2,4로 나뉜다. 아직도 각 분할된 요소들이 정렬되지 않은 상태이므로 다시 6/5/3/1/8/7/2/4로 분할된다.

분할된 요소들은 다시 역행하여 병합하게 되는데, 이 병합하는 과정에서 2개, 4개, 8개씩 다시 병합하게 되고, 이 병합하는 과정에서 정렬이 되도록 각 요소가 알맞은 자리에 들어가게 짜는 알고리즘이다.

## 구현

### 합병(Merge)
```js
function merge(arr1, arr2) {
  let results = [];
  // 두 개의 배열로 나뉜 것들을 합병하기 때문에 포인터를 각각 한 개씩 둠
  let i = 0;
  let j = 0;
  // 두 배열을 보면서 각 위치에서 비교하고 더 작은 수를 찾아 순서대로 넣는 방식
  while (i < arr1.length && j < arr2.length) {
    if (arr2[j] > arr1[i]) {
      results.push(arr1[i]);
      i++;
    } else {
      results.push(arr2[j]);
      j++;
    }
  }
  // 첫번째 루프문이 끝나고 남은 배열이 남았을 때 남은 배열들은 정렬이 되어있기 때문에 그대로 하나씩 뺴서 넣음
  while (i < arr1.length) {
    results.push(arr1[i]);
    i++;
  }
  while (j < arr2.length) {
    results.push(arr2[j]);
    j++;
  }
  return results;
}
//[1, 2, 10, 14, 50, 99, 100]
merge([1, 10, 50], [2, 14, 99, 100]);

```

### 합병 정렬

```js
function mergeSort(arr) {
  // base Case
  if (arr.length <= 1) return arr;
  let mid = Math.floor(arr.length / 2);
  // 재귀적으로 호출하여 1개, 0개 요소만 남을 때까지 계속 분할
  let left = mergeSort(arr.slice(0, mid));
  let right = mergeSort(arr.slice(mid));
  // merge 함수를 통해 쪼갠 것들을 리턴하도록 하면 재귀적으로 계속 합병된 배열들이 리턴되어 마지막엔 모두 정렬된 배열이 완성
  return merge(left, right);
}

function merge(arr1, arr2) {
  let results = [];
  // 두 개의 배열로 나뉜 것들을 합병하기 때문에 포인터를 각각 한 개씩 둠
  let i = 0;
  let j = 0;
  // 두 배열을 보면서 각 위치에서 비교하고 더 작은 수를 찾아 순서대로 넣는 방식
  while (i < arr1.length && j < arr2.length) {
    if (arr2[j] > arr1[i]) {
      results.push(arr1[i]);
      i++;
    } else {
      results.push(arr2[j]);
      j++;
    }
  }
  // 첫번째 루프문이 끝나고 남은 배열이 남았을 때 남은 배열들은 정렬이 되어있기 때문에 그대로 하나씩 뺴서 넣음
  while (i < arr1.length) {
    results.push(arr1[i]);
    i++;
  }
  while (j < arr2.length) {
    results.push(arr2[j]);
    j++;
  }
  return results;
}
//[1,  2, 10, 14, 50, 99, 100]
mergeSort([1, 10, 50, 2, 14, 99, 100]);
```

## 시간복잡도

Average: $O(n logn)$

Best Case: $O(n logn)$

Worst Case: $O(n logn)$

Space Complexity: $O(n)$
배열이 클 수록 합병 정렬에서는 메모리에 더 많은 배열을 저장해야 할 수박에 없다. 버블 정렬 등 보다는 많은 공간을 사용한다

모든 케이스가 $O(n logn)$으로 같다. $O(n^2)$ 보다 빠르지만 선형($O(n)$)보다는 살짝 오래 걸린다.

$O(n logn)$이 걸린 이유는 재귀를 통해 한 가지 이하의 요소가 남는 배열이 될 때까지 계속해서 **두 배열로 분할하기 때문에** 분할하는 과정에서 $O(logn)$의 시간이 걸린다. 

여기에 합병할 때는 하나씩 배열의 요소를 보면서 순서대로 새로운 배열에 넣어야 하기 때문에 $O(n)$의 시간이 걸린다.

따라서 $O(logn) * O(n) = O(nlogn)$ 이 된다.

선형시간 O(n)만큼 좋지는 않지만 데이터에 구애받지 않는 정렬 알고리즘 중에서는 최선이라고 할 수 있다.

