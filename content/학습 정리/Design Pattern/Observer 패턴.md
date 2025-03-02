![](https://i.imgur.com/QtK5Ay8.png)

![](https://i.imgur.com/7MVzWmk.png)

옵저버 패턴은 객체의 상태 변화를 관찰하는 관찰자(옵저버)의 목록을 객체에 등록하여 상태 변화가 있을 때마다 메서드 드등을 통해 객체가 직접 목록의 각 옵저버에게 통지하도록 하는 디자인패턴이다.

옵저버는 계속해서 객체의 상태를 관찰하고 있는 상태이고, 이러한 상태 변화를 감지하여 연관된 객체들에게 알림을 보낸다고 하는데, 한낮 다른 객체에 불과한 옵저버가 어떻게 알고있는걸까?

답은 이벤트 처리에 있다.

객체가 생성되는 시점에 해당 객체에 옵저버를 구독(attach)시키고, 해당 객체에 의존하고 있는 다른 객체들에게도 옵저버를 통해 업데이트 상황을 알 수 있도록 한다.

```js
class Observer {
    constructor() {
        this.students = [];
    }
    add(student){
        this.students.push(student);
    }
    getStateUpdate(student,action){
        console.log(`학생 ${student.name}이 ${action}을 했네요 건강하게만 커야한다~`)
    }
}
```
학생 옵저버를 만들었다.
```js
  
class Student{  
    observer  
    constructor(name){  
        this.name = name;  
    }  
  
    attach(observer){  
        this.observer = observer;  
    }  
  
    eat(){  
        console.log(`${this.name}이 밥을 먹는다`)  
        this.#notify(this,"밥먹기")  
    }  
  
    #notify(who,action) {  
        this.observer.getStateUpdate(who,action);  
    }  
}  
  
const obeserver = new Observer();  
const minsu = new Student("minsu");  
minsu.attach(obeserver)  
minsu.eat()
```
그리고 학생 객체를 만든 뒤에 민수에게 옵저버를 구독시키고, 민수의 메서드에서는 해당 옵저버에게 자신의 상태가 업데이트되었음을 함께 알리는 메서드를 실행시킨다.

![](https://i.imgur.com/X3DlW4K.png)
그럼 옵저버는 이러한 상태 업데이트의 이벤트를 받아 처리하는 것이다.
해당 옵저버는 배열을 통해 자신이 바라보고 있는 객체들을 관리할 수 있으며, 이러한 객체들에 관해서도 각각 상태가 갱신되었을 때 forEach를 통해 객체들을 돌면서 동일하게 상태 업데이트에 대해서 처리하는 메서드를 실행시킨다면 각 객체들이 이러한 한 객체의 이벤트를 받아 자신들도 동일하게 객체를 동기화시키는 작업을 시킬 수 있다.

이러한 관계는 객체간의 느슨한 결합성이 포인트이다.
두 객체가 느슨하게 결합되어 있다는 것은 디자인패턴 중 Pub-Sub 패턴처럼, 서로가 상호작용을 하지만서도 서로에 대해 모르는 상태이기 떄문에 이에 대해서 유연하게 처리가 가능하다.
- 옵저버를 언제든 새로 추가 및 제거
- 새로운 형식의 옵저버라도 주제를 변경할 필요가 없음
- 주제와 옵저버는 서로 독립적으로 사용 가능
- 주제나 옵저버가 바뀌더라도 서로에게 영향을 미치지 않음
