# 체크포인트

- [x] 함수형 프로그래밍 학습(함수형 프로그래밍 패러다임, 불변성, 참조투영성, 순수함수) - 2시 30분까지 ✅ 2024-07-25
- [x] MovieRank 설계 ✅ 2024-07-25
- [x] add함수 설계 및 구현 ✅ 2024-07-25
- [x] updateTicket 함수 설계 및 구현 ✅ 2024-07-25
- [x] updateTheaters 함수 설계 및 구현 ✅ 2024-07-25
- [x] delete 함수 설계 및 구현 ✅ 2024-07-25
- [x] sortBydate함수 설계 및 구현 ✅ 2024-07-25
- [x] top10Tickets 함수 설계 및 구현 ✅ 2024-07-25
- [x] findByDirector 함수 설계 및 구현 ✅ 2024-07-25
- [x] findByActor 함수 설계 및 구현 ✅ 2024-07-25
- [x] totalTheaters 함수 설계 및 구현 ✅ 2024-07-25
- [x] MovieRank 구현 ✅ 2024-07-25
- [x] 테스트코드 작성 및 테스트 ✅ 2024-07-25


# Movie 클래스 + MovieRank 설계

함수형 프로그래밍의 핵심은 아래와 같다. 

- 순수함수 : 부수효과가 없고, 같은 값을 넣으면 항상 같은 결과를 반환(참조투명성)
- 불변성 : 어떤 값의 상태를(메모리에 이미 담긴 상태를) 변경하지 않는다.

이번 문제는 함수형 프로그래밍 코드를 작성하면서 이러한 핵심을 위배하지 않도록 설계하는 것이 핵심이다. 
여기서 가장 문제가 됐던 점은 부수효과이다.

예를 들어 add(movie)를 한다고 치자.
그렇다면 add(movie)로 새로운 movie 객체를 만들어낸다 치더라도 이러한 movie들을 연결리스트로 어떻게 구현해야 하는가? 에 대한 고민이 많았다.
연결리스트의 경우 한가지 방향이다 하더라도 Next 노드에 다른 노드를 해야하기 때문에 현재의 노드가 어디까지 있는지 알아야 하기 때문에 이러한 데이터를 넘겨주는 과정에서 부수효과가 일어나기 때문이다.

부수 효과를 멀리하고 순수함수 합성을 통해 프로그래밍하는 함수형 프로그래밍의 핵심 원리를 다시 생각하고 add에 대해서 다시 생각해보았다.
가장 좋은 방법은 코드를 액션과 계산, 데이터로 분리하여 생각하고, 순수 함수를 세분화하여 합치는 형태로 만든 다음 이를 조합하는 과정으로 가야한다.
또한 변경 가능한 데이터 구조를 가진 언어에서 불변성을 유지하기 위해 카피온라이트와 방어적 복사를 활용해보자.

내가 생각한 방법은 함수 안에서 함수들을 클로저를 활용하여 구현하는 방식이다. 함수 내부에서 관리하는 값을 두고, 그 값을 계속해서 업데이트 하는 과정에서 카피온라이트를 통해 내부 값을 바꾸는 것이 아닌, 새로운 함수를 반환하여 서로 참조하는 값이 다른 데이터를 리턴하도록 하여 부수효과를 없앴다. 또한 각 함수는 순수함수의 특성을 준수할 수 있도록 해당 데이터에 같은 값을 넣는다면 같은 결과가 나올 것을 최대한 고려해서 함수들을 작성했다.

```js
export function movieRank(
  info = { root: null, movieList: [], totalTheaters: 0 }
) {
  var movies = {
    root: info.root,
    movieList: info.movieList,
  };
...
```

여기에서 클로저를 활용하여 관리하는 값들은 movies 변수이다. 함수 안의 값들은 직접적으로 접근하여 변환이 불가능하기 때문에 불변성을 가진다고 판단하였다.
해당 변수의 root에는 각 Movie 노드가 들어가 있으며, 해당 클래스의 next property를 통해 연결리스트를 구현하였다. 
```js
export class Movie {
  constructor(
    title,
    year,
    director,
    actorA,
    actorB,
    tickets,
    theaters,
    next = null
  ) {
    this.title = title;
    this.year = year;
    this.director = director;
    this.actorA = actorA;
    this.actorB = actorB;
    this.tickets = tickets;
    this.theaters = theaters;
    this.next = next;
  }
}

```
해당 Movie 클래스의 값을 조작하는 메소드는 따로 구현하지 않았다. 어차피 추가하는 경우를 포함한 모든 경우에 해당 클래스 자체를 조작하는 것이 제한되기 때문에 생성자만 구현해냈다.

## add함수
```js
function add(movie) {
    let newRank = {
      ...movies,
    };
    if (newRank.movieList.includes(movie.title)) return movieRank(newRank);
    if (!newRank.root) {
      newRank.root = newMovie(movie);
      newRank.movieList.push(movie.title);
      return movieRank(newRank);
    }
    let nextMovie = newRank.root;
    while (nextMovie.next !== null) {
      nextMovie = nextMovie.next;
    }
    newRank.movieList.push(movie.title);
    nextMovie.next = newMovie({ ...movie, prev: nextMovie });
    return movieRank(newRank);
  }
```
add함수에서는 카피온라이트 방식으로 맨 처음 객체들의 값을 복사해주었다. 그런 다음 노드들을 따라가 next값이 null, 즉 끝 위치까지 이동한 뒤에 해당 빈 공간에 새로운 노드를 추가해주고, 함수 자체를 리턴시켜 주어 두 값이 다르도록 설계했다.
상식적으로 같은 영화는 중복되면 안되기 때문에 만약에 제목이 같은 영화가 add될 경우에 따로 추가해주지 않기로 했다.

## updateTickets, updateTheaters 함수
```js

  function updateTickets(title, tickets) {
    let newRank = {
      ...movies,
    };
    let movie = newRank.root;
    let prev = null;
    while (movie !== null) {
      if (movie.title === title) {
        console.log("차줌");
        movie = newMovie({
          ...movie.info,
          tickets: tickets,
        });
        if (!prev) {
          newRank.root = movie;
          return movieRank(newRank);
        }
        prev.next = movie;
        return movieRank(newRank);
      }
      prev = movie;
      movie = movie.next;
    }
    throw new Error("영화 제목과 일치하는 정보가 없습니다.");
  }
  function updateTheaters(title, theaters) {
    let newRank = {
      ...movies,
    };
    let movie = newRank.root;
    let prev = null;
    while (movie !== null) {
      if (movie.title === title) {
        movie = newMovie({
          ...movie.info,
          theaters: theaters,
        });
        if (!prev) {
          newRank.root = movie;
          return movieRank(newRank);
        }
        prev.next = movie;
        return movieRank(newRank);
      }
      prev = movie;
      movie = movie.next;
    }

    throw new Error("영화 제목과 일치하는 정보가 없습니다.");
  }
```
이 두 함수는 작동 방식은 같다.  변경하는 값만 다르다.
나는 update함수에서 무엇을 보고 해당 하는 인스턴스의 값을 바꿀 것이냐? 에 대한 고민이 있었는데, 아무래도 unique한 영화 제목값을 보고 구별하는 것이 나을 것 같아서 title과 변경할 theaters를 받았다.

인수로 받은 title을 노드를 하나씩 건너가면서 해당하는 title과 같은 인스턴스가 있는지를 찾고, 만약에 같은 인스턴스가 있을 경우에는 해당 값을 복사한 후에 새로운 인스턴스를 만들어 이전노드의 다음노드에 연결시켜 주었다. 이를 통해 이전 노드는 전과는 다른 새로운 인스턴스를 받은 새로운 함수를 받아 외부의 값에 영향을 주지 않음을 알 수 있다.

## Delete함수
```js
  function deleteMovie(title) {
    let newRank = {
      ...movies,
    };
    let movie = newRank.root;
    let prevMovie = null;
    while (movie !== null) {
      if (movie.title === title) {
        if (prevMovie) prevMovie.next = movie.next;
        newRank.movieList.splice(
          newRank.movieList.findIndex((mov) => mov === title),
          1
        );
        return movieRank(newRank);
      }
      prevMovie = movie;
      movie = movie.next;
    }
    throw new Error("영화 제목과 일치하는 정보가 없습니다.");
  }
```
delete함수는 다른 함수들과 같이 노드를 찾고, 해당하는 노드를 삭제하기 위해 이전 노드를 따로 관리한다. 
삭제할 인스턴스가 보이면 이전노드를 해당 노드의 다음 노드와 연결시켜주면 해당하는 노드가 연결되어 있는 값이 없어 사라진다.

## SortByDate, get10Tickets, findBy 함수
```js

function sortByDate() {
    if (!movies.root) throw new Error("영화 데이터가 없습니다.");
    let dateSorted = getMoviesArray();
    dateSorted.sort((a, b) => a.year - b.year);
    return dateSorted;
  }

  function get10Tickets() {
    if (!movies.root) throw new Error("영화 데이터가 없습니다.");
    let topSelledMovies = getMoviesArray();
    topSelledMovies.sort((a, b) => b.tickets - a.tickets);
    return topSelledMovies.slice(0, 10).map((movie) => movie.title);
  }

  function findByDirector(director) {
    if (!movies.root) throw new Error("영화 데이터가 없습니다.");
    let directors = getMoviesArray();
    return directors
      .filter((movie) => movie.director === director)
      .map((movie) => movie.title);
  }

  function findByActor(actor) {
    if (!movies.root) throw new Error("영화 데이터가 없습니다.");
    let actors = getMoviesArray();
    return actors
      .filter((movie) => movie.actorA === actor || movie.actorB === actor)
      .map((movie) => movie.title);
  }
  
  function getMoviesArray() {
    let arr = [];
    let movie = movies.root;
    while (movie !== null) {
      arr.push(movie);
      movie = movie.next;
    }
    return arr;
  }
```
SortByDate, get10Tickets, findBy함수는 리턴값이 배열이다. 따라서 모든 노드를 돌아가면서 배열에 넣어줄 필요가 있기 때문에 이러한 공통적인 부분을 따로 함수로 빼뒀다.

getMoviesArray함수는 해당 함수의 내부에서만 작동하며, 함수를 리턴하지 않기 때문에 외부에서 사용할 수는 없다.

이러한 함수를 통해서 모든 영화 인스턴스들이 들어있는 배열을 만들고, 고차함수를 통해 해당되는 인스턴스들만 골라내어 리턴시켜 주었다.

## map, filter, display함수
```js


  function callbackMap(result, node, idx, callback) {
    if (!node) return;
    result[idx] = callback(node);
    if (node.next) callbackMap(result, node.next, idx + 1, callback);
  }

  function map(callback) {
    if (!movies.root) throw new Error("현재 존재하는 영화들이 없습니다.");
    let result = {};
    callbackMap(result, movies.root, 0, callback);
    return result;
  }

  function callbackFilter(result, node, idx, callback) {
    if (!node) return;
    if (callback(node)) {
      result[idx] = node;
      idx++;
    }
    if (node.next) callbackFilter(result, node.next, idx, callback);
  }

  function filter(callback) {
    if (!movies.root) throw new Error("현재 존재하는 영화들이 없습니다.");
    let result = {};
    callbackFilter(result, movies.root, 0, callback);
    return result;
  }

  function callbackDisplay(node, callback) {
    if (!node) return;
    callback(node);
    if (node.next) callbackDisplay(node.next, callback);
  }
  function display(callback) {
    if (!movies.root) throw new Error("현재 존재하는 영화들이 없습니다.");
    callbackDisplay(movies.root, callback);
  }
```
이 세 함수들은 리턴값이 배열이면 안되기 때문에 나는 객체를 새로 만들어 재귀적으로 호출하면서 해당되는 콜백을 실행하여 알맞은 값을 `인덱스: 값`의 형태로 된 object를 리턴하도록 설계하였다.
따로 callback을 써서 재귀시키는 부분을 모두 함수로 따로 분리했으며, 이러한 callback~ 함수들을 통해 재귀적으로 실행하여 받은 리턴값을 최상위에서 받아 리턴시킨다.


# 프로그램 인터페이스 구현
```js
async function mainLoop() {
  let movieData = movieRank();
  let running = true;

  while (running) {
    const line = await askQuestion(
      "영화 정보 추가: a , 관람인원 업데이트: b, 상영관 개수 업데이트: c, 상영연도순 조회: d, 관람 인원 상위 10개 조회: e, 감독 이름 기준 영화 검색: f, 배우 기준 영화 검색: g, 영화 전체 상영관 조회: h, 영화 삭제: i, 종료 : q\n"
    );
    switch (line) {
      case "a":
        movieData = await handleAdd(movieData);
        console.log(movieData.getInfo());
        break;
      case "b":
        movieData = await handleUpdateTickets(movieData);
        console.log(movieData.getInfo());
        break;
      case "c":
        movieData = await handleUpdateTheaters(movieData);
        console.log(movieData.getInfo());
        break;
      case "d":
        handleSortByDate(movieData);
        break;
      case "e":
        handleTopTickets(movieData);
        break;
      case "f":
        await handleFindByDirector(movieData);
        break;
      case "g":
        await handleFindByActor(movieData);
        break;
      case "h":
        handleTotalTheaters(movieData);
        break;
      case "i":
        movieData = await handleDelete(movieData);
        console.log(movieData.getInfo());
        break;
      case "q":
        running = false;
        rl.close();
        break;
      default:
        console.log("잘못된 명령어입니다. 다시 입력해 주세요.");
        break;
    }
  }
}

mainLoop();
```
프로그램 인터페이스의 경우 계속해서 명령어를 받고 실행하는 방식으로 작성해주었다.
다시금 question을 통해 필요한 값을 받는 부분이 필요한 함수들은 동기적으로 작동할 수 있도록 await 키워드를 통해 처리 순서를 정렬시켰다.

각 명령에 대해 따로 해당 파일에서 만든 함수를 쓰는데, 받는 인수의 경우 함수로 생성한 객체를 주고, add와 같은 함수는 나중에 리턴받을 때 새로운 객체로 만들어져서 받는다.


## 실행결과

```zsh
영화 정보 추가: a , 관람인원 업데이트: b, 상영관 개수 업데이트: c, 상영연도순 조회: d, 관람 인원 상위 10개 조회: e, 감독 이름 기준 영화 검색: f, 배우 기준 영화 검색: g, 영화 전체 상영관 조회: h, 영화 삭제: i, 종료 : q
a
영화 제목(공백 미포함), 최초 상영연도, 감독, 주연배우 2명, 관람인원, 상영관 개수를 공백 포함 입력하세요: insideout2 2024 캘시맨 에이미 마야 101112 199
{
  root: Movie {
    title: 'insideout2',
    year: 2024,
    director: '캘시맨',
    actorA: '에이미',
    actorB: '마야',
    tickets: 101112,
    theaters: 199,
    next: null
  },
  movieList: [ 'insideout2' ]
}
영화 정보 추가: a , 관람인원 업데이트: b, 상영관 개수 업데이트: c, 상영연도순 조회: d, 관람 인원 상위 10개 조회: e, 감독 이름 기준 영화 검색: f, 배우 기준 영화 검색: g, 영화 전체 상영관 조회: h, 영화 삭제: i, 종료 : q
a
영화 제목(공백 미포함), 최초 상영연도, 감독, 주연배우 2명, 관람인원, 상영관 개수를 공백 포함 입력하세요: 위대한쇼맨 2017 마이클 휴잭맨 잭에프론 10022 9999
{
  root: Movie {
    title: 'insideout2',
    year: 2024,
    director: '캘시맨',
    actorA: '에이미',
    actorB: '마야',
    tickets: 101112,
    theaters: 199,
    next: Movie {
      title: '위대한쇼맨',
      year: 2017,
      director: '마이클',
      actorA: '휴잭맨',
      actorB: '잭에프론',
      tickets: 10022,
      theaters: 9999,
      next: null
    }
  },
  movieList: [ 'insideout2', '위대한쇼맨' ]
}
영화 정보 추가: a , 관람인원 업데이트: b, 상영관 개수 업데이트: c, 상영연도순 조회: d, 관람 인원 상위 10개 조회: e, 감독 이름 기준 영화 검색: f, 배우 기준 영화 검색: g, 영화 전체 상영관 조회: h, 영화 삭제: i, 종료 : q
b
영화의 제목과 업데이트 시킬 인원을 공백을 기준으로 입력하세요: insideout2 100
차줌
{
  root: Movie {
    title: 'insideout2',
    year: 2024,
    director: '캘시맨',
    actorA: '에이미',
    actorB: '마야',
    tickets: 100,
    theaters: 199,
    next: Movie {
      title: '위대한쇼맨',
      year: 2017,
      director: '마이클',
      actorA: '휴잭맨',
      actorB: '잭에프론',
      tickets: 10022,
      theaters: 9999,
      next: null
    }
  },
  movieList: [ 'insideout2', '위대한쇼맨' ]
}
영화 정보 추가: a , 관람인원 업데이트: b, 상영관 개수 업데이트: c, 상영연도순 조회: d, 관람 인원 상위 10개 조회: e, 감독 이름 기준 영화 검색: f, 배우 기준 영화 검색: g, 영화 전체 상영관 조회: h, 영화 삭제: i, 종료 : q
c
영화의 제목과 업데이트 시킬 상영관 수를 공백을 기준으로 입력하세요: 위대한쇼맨 29
{
  root: Movie {
    title: 'insideout2',
    year: 2024,
    director: '캘시맨',
    actorA: '에이미',
    actorB: '마야',
    tickets: 100,
    theaters: 199,
    next: Movie {
      title: '위대한쇼맨',
      year: 2017,
      director: '마이클',
      actorA: '휴잭맨',
      actorB: '잭에프론',
      tickets: 10022,
      theaters: 29,
      next: null
    }
  },
  movieList: [ 'insideout2', '위대한쇼맨' ]
}
영화 정보 추가: a , 관람인원 업데이트: b, 상영관 개수 업데이트: c, 상영연도순 조회: d, 관람 인원 상위 10개 조회: e, 감독 이름 기준 영화 검색: f, 배우 기준 영화 검색: g, 영화 전체 상영관 조회: h, 영화 삭제: i, 종료 : q
d
[
  Movie {
    title: '위대한쇼맨',
    year: 2017,
    director: '마이클',
    actorA: '휴잭맨',
    actorB: '잭에프론',
    tickets: 10022,
    theaters: 29,
    next: null
  },
  Movie {
    title: 'insideout2',
    year: 2024,
    director: '캘시맨',
    actorA: '에이미',
    actorB: '마야',
    tickets: 100,
    theaters: 199,
    next: Movie {
      title: '위대한쇼맨',
      year: 2017,
      director: '마이클',
      actorA: '휴잭맨',
      actorB: '잭에프론',
      tickets: 10022,
      theaters: 29,
      next: null
    }
  }
]
영화 정보 추가: a , 관람인원 업데이트: b, 상영관 개수 업데이트: c, 상영연도순 조회: d, 관람 인원 상위 10개 조회: e, 감독 이름 기준 영화 검색: f, 배우 기준 영화 검색: g, 영화 전체 상영관 조회: h, 영화 삭제: i, 종료 : q
e
[ '위대한쇼맨', 'insideout2' ]
영화 정보 추가: a , 관람인원 업데이트: b, 상영관 개수 업데이트: c, 상영연도순 조회: d, 관람 인원 상위 10개 조회: e, 감독 이름 기준 영화 검색: f, 배우 기준 영화 검색: g, 영화 전체 상영관 조회: h, 영화 삭제: i, 종료 : q
f
감독 이름을 입력하세요: 마이클
[ '위대한쇼맨' ]
영화 정보 추가: a , 관람인원 업데이트: b, 상영관 개수 업데이트: c, 상영연도순 조회: d, 관람 인원 상위 10개 조회: e, 감독 이름 기준 영화 검색: f, 배우 기준 영화 검색: g, 영화 전체 상영관 조회: h, 영화 삭제: i, 종료 : q
g
배우 이름을 입력하세요: 휴잭맨
[ '위대한쇼맨' ]
영화 정보 추가: a , 관람인원 업데이트: b, 상영관 개수 업데이트: c, 상영연도순 조회: d, 관람 인원 상위 10개 조회: e, 감독 이름 기준 영화 검색: f, 배우 기준 영화 검색: g, 영화 전체 상영관 조회: h, 영화 삭제: i, 종료 : q
h
228
영화 정보 추가: a , 관람인원 업데이트: b, 상영관 개수 업데이트: c, 상영연도순 조회: d, 관람 인원 상위 10개 조회: e, 감독 이름 기준 영화 검색: f, 배우 기준 영화 검색: g, 영화 전체 상영관 조회: h, 영화 삭제: i, 종료 : q
i
지울 영화 제목을 입력하세요: 위대한쇼맨
{
  root: Movie {
    title: 'insideout2',
    year: 2024,
    director: '캘시맨',
    actorA: '에이미',
    actorB: '마야',
    tickets: 100,
    theaters: 199,
    next: null
  },
  movieList: [ 'insideout2' ]
}
영화 정보 추가: a , 관람인원 업데이트: b, 상영관 개수 업데이트: c, 상영연도순 조회: d, 관람 인원 상위 10개 조회: e, 감독 이름 기준 영화 검색: f, 배우 기준 영화 검색: g, 영화 전체 상영관 조회: h, 영화 삭제: i, 종료 : q
q
```

![tg.png][https://blog.kakaocdn.net/dn/Uq7Bc/btrr5Vseaa0/YJIG3ziHdGreV0oTgEQoqK/img.png]

# 테스트 코드
함수 안의 함수들에 대해서는 모두 테스트를 마친 상태라 jest를 통한 테스트는 다른 방향을 잡고 시도해보았다.
내가 했던 테스트는 주로 '값을 함수에 넣었을 때 반환되는 값이 새로운 값인가?'에 집중해서 테스트해보았다. 또한 해당 함수 안의 값은 변경되어야 하지 않아야 하는 불변성 또한테스트에 넣어주어 함수형 프로그래밍의 특성을 중점적으로 테스트했다.
```js
import { movieRank } from "./movieRank.mjs";

describe("테스트", () => {
  test("생성된 클로저 비교", () => {
    let a = movieRank();
    let b = movieRank();
    expect(b === a).toBe(false);
  });
  test("같은 필드 값을 가진 인스턴스가 다른 참조값을 가지고 있는가?", () => {
    let a = movieRank();
    a = a.add({
      title: "인사이드아웃2",
      year: 2024,
      director: "캘시 맨",
      actorA: "에이미 포엘러",
      actorB: "마야 호크",
      tickets: 1000,
      theaters: 2000,
    });
    let b = movieRank();
    b = b.add({
      title: "인사이드아웃2",
      year: 2024,
      director: "캘시 맨",
      actorA: "에이미 포엘러",
      actorB: "마야 호크",
      tickets: 1000,
      theaters: 2000,
    });
    expect(b.getInfo().root === a.getInfo().root).toBe(false);
  });
  test("같은 함수 내의 함수를 통해 새로운 값을 받았을 때 리턴받은 두 객체는 다른가?", () => {
    let oldA = movieRank();
    oldA = oldA.add({
      title: "인사이드아웃2",
      year: 2024,
      director: "캘시 맨",
      actorA: "에이미 포엘러",
      actorB: "마야 호크",
      tickets: 1000,
      theaters: 2000,
    });
    let newA = oldA.add({
      title: "인사이드아웃2",
      year: 2024,
      director: "캘시 맨",
      actorA: "에이미 포엘러",
      actorB: "마야 호크",
      tickets: 1000,
      theaters: 2000,
    });

    // oldA와 newA가 다른 인스턴스임을 확인
    expect(newA).not.toBe(oldA);

    // 각각의 루트가 다른 인스턴스를 가리키는지 확인
    expect(newA.getInfo() === oldA.getInfo()).toBe(false);
  });

  test("해당 함수로 만들어진 객체가 메소드로 인해 함수 안의 값이(외부의 값) 변하지 않는가?", () => {
    let oldA = movieRank();
    let newA = oldA.add({
      title: "인사이드아웃2",
      year: 2024,
      director: "캘시 맨",
      actorA: "에이미 포엘러",
      actorB: "마야 호크",
      tickets: 1000,
      theaters: 2000,
    });

    expect(newA.getInfo() === oldA.getInfo()).toBe(false);
    expect(oldA.getInfo().root).toBe(null);
  });
  test("영화 추가 시 불변성 유지", () => {
    let oldA = movieRank();
    oldA = oldA.add({
      title: "인사이드아웃2",
      year: 2023,
      director: "캘시 맨",
      actorA: "에이미 포엘러",
      actorB: "마야 호크",
      tickets: 1000,
      theaters: 2000,
    });

    const oldInfo = oldA.getInfo();

    let newA = oldA.add({
      title: "인사이드아웃3",
      year: 2024,
      director: "캘시 맨",
      actorA: "에이미 포엘러",
      actorB: "마야 호크",
      tickets: 1000,
      theaters: 2000,
    });

    const newInfo = newA.getInfo();

    expect(newA).not.toBe(oldA);
    expect(oldInfo).toEqual(oldA.getInfo());
    expect(newInfo).not.toBe(oldInfo);

    expect(newA.getInfo().movieList).toContain("인사이드아웃3");
    expect(oldA.getInfo().movieList).not.toContain("인사이드아웃3");
  });
});

```

```zsh
 PASS  ./movie.test.js
  테스트
    ✓ 생성된 클로저 비교 (1 ms)
    ✓ 같은 필드 값을 가진 인스턴스가 다른 참조값을 가지고 있는가? (1 ms)
    ✓ 같은 함수 내의 함수를 통해 새로운 값을 받았을 때 리턴받은 두 객체는 다른가?
    ✓ 해당 함수로 만들어진 객체가 메소드로 인해 함수 안의 값이(외부의 값) 변하지 않는가?
    ✓ 영화 추가 시 불변성 유지 (1 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.564 s, estimated 1 s
Ran all test suites.
```

