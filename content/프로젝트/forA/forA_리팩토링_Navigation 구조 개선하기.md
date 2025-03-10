---
title: forA_리팩토링_Navigation 추상화하기
created: 2025-02-08 00:38
updated: 2025-02-08 00:38
tags: []
categories: []
aliases: []
description: ""
status: "draft" # draft, in-progress, completed
---

포에이를 맡게 되면서 처음으로 시뮬레이터를 켰을 때는 회원가입조차 제대로 되어있지 않은 상태였기 때문에 제대로 뭔가를 볼 수가 없었다.
그렇기 때문에 정작 뭐가 문제인지를 실제로 구동해보면서 알 수 없었는데도 불구하고 코드만 보고 여기는 안봐도 사용자경험이 매우 나쁘다고 생각했던 부분이 있었는데, 바로 네비게이션 부분이었다.
이전 개발자분이 왜그러셨는지는 모르겠지만 모든 스크린들을 전부 하나의 stack navigator에 담은 코드를 보았다.
![](https://i.imgur.com/e6XE73C.png)
현재는 로그인쪽 스택 네비게이터와 홈 부분 스택 네비게이터를 따로 나눴음에도 불구하고 아직까지도 네비게이션의 구조를 제대로 알 수 없었다.

그 뿐만 아니라 더 심각하다고 느꼈던 부분은 하단 탭 또한 스택 네비게이터로 관리하고 있었기 때문에 우리가 흔히 아는 하단 탭의 작동방식이 아닌, 스택의 작동방식으로 작동하였다. 사용자는 정상적이라고 생각했다면 하단 탭이 마치 안쪽 화면만 바뀌는 느낌이라고 생각했을 텐데 갑자기 화면 내의 컨텐츠를 눌렀을 때처럼 화면이 좌우로 움직여버리니 당황스러웠을 것이다. 게다가 안쪽 영역만 바뀌는 것이 아닌, 하단 탭까지 움직이는 듯한 사용자 경험은 보다 익숙치 않을 것이라 생각한다.

문제는 이 뿐만이 아니다. React Navigation의 Navigation lifecycle에 나온 설명을 보면 이보다 훨씬 큰 스노우볼이 굴러가고 있다는 것을 알 수 있다.

> Consider a stack navigator with 2 screens: `Home` and `Profile`. When we first render the navigator, the `Home` screen is mounted, i.e. its `useEffect` or `componentDidMount` is called. When we navigate to `Profile`, now `Profile` is mounted and its `useEffect` or `componentDidMount` is called. But nothing happens to `Home` - it remains mounted in the stack. The cleanup function returned by `useEffect` or `componentWillUnmount` is not called.

요약하자면 두 개의 스크린을 네비게이터에 등록해놓고 navigate를 시킨다면, stack navigator에는 그대로 스택이 쌓인다는 이야기다. 따라서 이러한 컴포넌트들이 언마운트 되는 것이 아니라 계속 위로 차곡차곡 쌓이고 있다는 소리이다.
이게 문제가 뭐냐면, 한 유저가 오랫동안 앱에 머물게 된다면 그만큼 화면 이동을 많이 하게 될텐데, 이 과정에서 계속 화면이 쌓이고, 결국 디바이스 내의 메모리를 계속해서 잡아먹고 있다는 소리기도 하다.
![[화면 기록 2025-02-07 오후 11.20.09.gif]]
위 사진을 보면 기존의 탭들을 '이동' 한다는 개념이 아니라 스택처럼 '더 들어간다'는 개념으로 화면을 작동시키고 있는 것을 알 수 있다. 이러한 부분은 기존 데이터를 그대로 가지고 있는 스크린이기 때문에 쓸모 없는 화면이 메모리를 잡아먹고 있으며, 하단 탭의 이동 방식 또한 사용자가 예상하는 방식이 아니기 때문에 당황스러울 수 있다고 생각했다.

그렇기 때문에 리팩토링의 우선순위에서 네비게이션 구조를 먼저 분리해봐야겠다는 생각이 들었고, 이참에 스택과 하단 탭을 세부적으로 나눠 추상화를 시켜 보다 가독성을 좋게 만들어 봐야 겠다는 생각이 들었다.

### Navigation의 Nesting은 어떻게 처리해야 할까?
예전에 프로젝트를 할 때는 항상 Navigation을 깊숙하게 Nesting하는 방식으로 처리를 했었지만, 당시에는 제대로 Docs를 보지 않고 했었는데, 이제서야 docs의 중요성을 깨닫고 조금씩 읽어보면서 알게 되었다.

React Navigation에서는 navigation의 nesting을 가능하면 최대한 얕게 잡을 것을 추천한다. 그 이유는 navigation을 nesting하는 것은 잠재적 위험 요소들이 몇 가지 있기 때문이다.
- 계층 구조가 깊어질수록 메모리 소모가 커지고, 보급형 폰같은 경우는 성능 저하 이슈로 이어질 수도 있음
- 여러 타입의 navigation을 계속 겹치다 보면 사용자 경험에 좋지 않음
- `deep link`와 같은 기능을 사용할 때, 코드의 작성이 어려워짐. 즉 유지보수 및 확장성이 떨어짐

따라서 Nesting되는 구조의 깊이를 최대한 깊게 가져가는 것을 지양하면서 적당히 스택과 탭의 navigation을 나눠야 한다.
```jsx
<Stack.Navigator>
  {isLoggedIn ? (
    // Screens for logged in users
    <Stack.Group>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Group>
  ) : (
    // Auth screens
    <Stack.Group screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Group>
  )}
  {/* Common modal screens */}
  <Stack.Group screenOptions={{ presentation: 'modal' }}>
    <Stack.Screen name="Help" component={Help} />
    <Stack.Screen name="Invite" component={Invite} />
  </Stack.Group>
</Stack.Navigator>
```
이를 위해서는 Group과 같은 Stack의 컴포넌트를 이용할 수 있다.

### 로그인 한 유저와 로그인하지 않은 유저의 스택 구조 나누기
그렇게 네비게이션 구조에 대해 보다 이해하고 다시금 코드를 보면서 가장 먼저 나눴던 것은 로그인한 유저와 로그인하지 않은 유저의 스택을 나누는 일이었다.
왜냐면 로그인의 경우 한번 로그인 하면 굳이 로그인 스택을 그대로 가지고 있는 것이 불필요하다고 생각했기 때문이다.

```tsx
const MainNavigation = () => {
    const Stack = createStackNavigator()
    const isLoggedIn = useAuthStore((state) => state.accessToken)
    const firstLaunch = useLaunch()
    const initialHomeScreen = firstLaunch ? 'OnBoard' : 'Home'
    const screenOptions: StackNavigationOptions = {
        headerShown: false,
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="launch"
                screenOptions={screenOptions}
            >
                {isLoggedIn ? (
                    <Stack.Screen
                        name="HomeStack"
                        component={() => (
                            <HomeStack initialRoute={initialHomeScreen} />
                        )}
                    />
                ) : (
                    <Stack.Screen name="LoginStack" component={LoginStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    )
}
export default MainNavigation

```
가장 먼저 앱의 엔트리 포인트에서 Navigation을 로그인 상태와 비로그인 상태에 따라 다른 로그인 스택을 관리할 수 있도록 하였다.
여기서 위에처럼 Group 컴포넌트를 사용하면 해당 파일 안에서도 보다 잘 할 수 있지 않을까? 생각했지만 Home에서 관리하는 스택의 구조가 탭 하나당 화면 한 단위를 가진다고 생각하면 생각보다 Home이 가지는 구조가 많을 것 같아 따로 로그인과 일반 홈 상태의 스크린을 추상화하여 파일로 분리하였다.
### 홈탭 - 각 스택으로의 Navigation 구조
로그인 한 후의 상태는 홈 탭으로 분류하였다.
그리고 이 홈 탭에는 전에 해놓았던 것처럼 네 개의 탭이 있다.


![](https://i.imgur.com/wLAwtOi.png)
그리고 이 각 스택에는 해당 탭에서 사용하는 모든 스크린들을 담아놓았다
이 스택들을 굳이 추상화 시킨 이유는 앞에서도 말했듯이 각 스택이 가지는 스크린이 너무 많아 나중에 유지보수할 때 다시 구조를 잘 보기 위해서는 각 스택을 추상화하면 좋겠다고 생각했기 때문이다.

![](https://i.imgur.com/EaHtNvH.png)
그렇게 만들어진 구조는 위와 같다. 인덱스에서는 로그인 상태와 비로그인 상태를 구별하여 각각  HomeTab과 LoginStack이 들어가도록 했다.
이렇게 보니 각 navigation 구조를 확실히 잘 볼 수 있기도 하고, 내가 필요한 부분에 대해서 정확히 파일을 찾아 들어갈 수 있게 되었다고 생각한다.
### Custom Bottom Tab bar 설정하기
기존의 TabBar는 아래와 같은 형태였다.

![](https://i.imgur.com/JMwN3J1.png)
왜 그랬는지는 모르겠지만 굳이 클릭 상태를 전역으로 관리하려는 시도가 보인다.
~~Tab navigation을 따로 모르셨나..~~
전역으로 현재 보고 있는 탭을 골라서 활성 상태 탭의 색상을 바꿔주기 위한 의도로 보인다.

![](https://i.imgur.com/0HIbAw6.png)
굳이 필요없는 기능을 빼고 BottomTabBar에서 가져올 수 있는 속성을 이용할 수 있도록 기존의 TabBar를 조금 더 가볍게 만들어 보았다.
여기에서는 BottomTabBar에서 주는 Props를 받아 navigate 기능을 넣어 주었고, 추가적으로 각 탭의 초기 스크린에서만 탭 바가 보여야 하므로 visible 속성을 통해 제어해 주었다.
원래는 TabBarStyle에 `display: "none"` 속성을 주는 경우가 많은데, 그냥 TabBar property로 넣게 되면 먹질 않아 이런 식으로 우회했다.
```tsx
    const navigationState = useNavigationState((state) => state);
    const getNestedRouteName = (state: any): string | null => {
        if (!state) return null;
        const route = state.routes[state.index];
        if (route.state) {
            return getNestedRouteName(route.state);
        }
        return route.name;
    };
    const currentRouteName = getNestedRouteName(navigationState);
    return (
        <Tab.Navigator
            initialRouteName="오늘"
            tabBar={(props) => (
                <TabBar
                    {...props}
                    visible={tabBarVisibleScreens.includes(
                        currentRouteName as string,
                    )}
                />
            )}
            screenOptions={{
                headerShown: false,
            }}
        
        ...
```
그리고 getNestedRoutedName이라는 함수를 통해 현재의 navigation 상태에서 내가 설정한 RouteName을 가져올 수 있도록 했고, 탭 바가 필요한 스크린만 입력해놓은 배열에 포함되는지 여부를 visible에 넣어주었다.


![](https://i.imgur.com/KqLu77b.gif)
### navigate 타입 개선하기
![](https://i.imgur.com/PAgOlkE.png)
이전 개발자가 작업한걸 보면 옛날의 나를 보는 것만 같다.
해결을 하기 위해서 근본적인 문제를 해결하기 위한 것이 아닌, 임시방편적인 조치를 하는 경우를 코드에서 많이 볼 수 있었다.
특히 계속 눈에 띄는 부분은 navigate에 제네릭 타입을 넣지 않으면, 스크린 명을 입력했을 때 type error가 뜨게 된다.
```ts
//이런 식으로 하면 타입스크립트에서는 타입에러가 뜬다.
navigation.navigate("CameraScreen")

//임시방편으로 이렇게 할 수 있다.
navigation.navigate("CameraScreen") as never
```
하지만 이렇게 쓰면 휴먼 에러의 가능성도 있을 뿐만 아니라, 자동완성도 해줄 수 있는데 굳이 이런 메리트를 버리는 꼴이 되며, 나중에 유지보수도 어려워질 수 있다.
```ts
type HospitalDetailNavigationProp = StackNavigationProp<
    HospitalStackParams,
    'HospitalDetail'
>;
const navigation = useNavigation<HospitalDetailNavigationProp>();
```
따라서 이렇게 `Navigation` 훅에 타입을 제네릭으로 넣어주면서 해결할 수 있다. 자동완성도 되고 `navigate` 과정에서 필요한 인자 또한 타입체크를 해주므로 타입스크립트의 장점을 살리레 수 있다.

```ts
export default function CameraScreen({
    navigation,
    route,
}: StackScreenProps<HospitalStackParams, 'CameraScreen'>
```
내가 생각하는 가장 베스트 방식은 이렇게 StackScreenProps로 주는 것이다. 기존의 StackParams를 import해와 쓰면 되며, `navigate`를 하면서 navigation 객체 또한 넘겨주게 되므로 굳이 스택 구조에서 `useNavigation`훅을 쓰지 않아도 된다는 장점이 있다. 물론 `navigation` 객체의 `navigate`와 같은 메서드에서도 타입을 주입해주어 자동완성도 된다.
### 회고
모르는 사람이 만들던 코드를 읽게 되면 `왜 이렇게 했을까?`라고 생각하는 경우가 많아지는 것 같다.
~~물론 이번 경우에는 부정적인 의문으로 들긴 했다~~
하지만 이전 개발자를 봤을 때 마치 이전의 나를 보는 것만 같아서 나도 보고 많은 반성을 했다.
임시방편적 조치, 원리를 이해하지 못한 코드, 더 알아볼 생각을 하지 않았다는게 보이는 코드... 모두 이전의 내가 가졌던 안티패턴이기도 했다. 내가 정확히 일년 전에 시작했던 리액트 네이티브 프로젝트가 이렇게 만들어져 있었다.

사용자를 받고 계속 서비스 운영을 하면서 유지보수가 필요하다는 생각을 하게 되었지만 스케일이 너무 커져 결국 리팩토링을 얼마 하지 못한채로 서비스 종료하게 되어 아쉬움이 참 많이 남게 되었는데, 이번 프로젝트를 통해 보다 리팩토링의 중요성을 깨닫고, 이전의 내가 가졌던 안티패턴들을 해당 코드에서 발견하면서 보다 나의 안좋은 과거 습관들을 보다 확실히 인지할 수 있던 시간이었다.

네비게이션 구조의 경우 확실히 이제는 각각의 탭이 서로 연관되지 않고 독립적으로 작용하는 느낌이 들어 사용자경험이 보다 자연스러워졌다고 생각한다!
또한 이제는 stack 구조처럼 기존의 스크린들이 계속 쌓이는 구조가 아니다 보니 메모리 차지와 같은 문제를 해결하여 만족스럽다.
