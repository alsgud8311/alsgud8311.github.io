passport 모듈을 사용하여 로컬에서 인증을 관리하는 로직을 구현해보자.
Passport 모듈을 사용한 로그인 인증 전략은 로컬과 각종 소셜 로그인 등으로 구성되어 있다.

> 해당 글은 **Inpa**님의 글을 참고하면서 제가 구현했던 로그인 인증 전략에 대해서 정리하는 글입니다

## passport의 초기 로그인
### 로그인 자체의 과정
#### 로그인 요청이 라우터를 통해 들어옴
```js
router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      // 해당하는 인증 정보를 찾기 못했을 경우 401 에러 반환
      return res.status(401).json(info);
    }
    //req의 login 두번째 인자 -> 에러 핸들링
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      // 로그인 성공시 200 응답하기
      return res.status(200).json({ message: "successfully login" });
    });
  })(req, res, next);
});
```
로그인 요청은 가장 먼저 설정한 라우터를 통해 들어오게 된다. 여기서 두 번째로 설정해둔 미들웨어는 isNotLoggedIn으로 해당 유저가 로그인한 상태를 확인하는 미들웨어이다.
```js
export const isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent("로그인한 상태");
    res.redirect(`/?error=${message}`);
  }
};
```
이렇게 로그인이 된 경우에는 헤더에 로그인 정보가 함께 오기 때문에 req 객체의 isAuthenticated 함수를 통해 로그인 여부를 체크할 수 있다. 
해당 함수는 boolean 값을 반환하기 때문에 if else문으로 로그인하지 않은 경우는 `next()`를 통해 다음 미들웨어를 호출할 수 있게 해 주었고, else의 경우네는 로그인한 상태이기 때문에 redirect를 시켜주었다.

해당 미들웨어를 거친 뒤에 예외처리에서 걸러지지 않았다면 `next()`를 통해 다음 미들웨어로 이동하도록 한다.
다음 미들웨어가 실행되면 다시 위의 코드 다음으로 올라와서 `router.post` 안의 콜백 함수를 실행시키게 되는게, 가장 먼저 콜백함수 한에는`passport.authenticate()`가 있다. 여기서 `authenticate()` 메소드를 실행하게 되는데, passport/localStrategy.js 파일에 내가 따로 설정해놓은 passport 미들웨어가 있다.
```js
function localStrategy() {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          const user = await transaction(User.findOne, username);
          if (user) {
            const result = await bcrypt.compare(password, user.passwd);
            if (result) {
              done(null, user);
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않음" });
            }
          } else {
            done(null, false, { message: "해당하는 유저 정보가 없습니다." });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
}

export default localStrategy;

```
`LocalStrategy`는 `passport.use`를 통해 미들웨어를 설정한 것을 볼 수 이싿.
미들웨어 안에는 `LocalStrategy` 객체를 생성하고, 들어오는 로그인 정보를 검증하는 과정을 거친다.
여기서 transaction은 내가 mysql connection과 release를 하나로 묶어놓은 함수이다. 해당 함수에 내가 써놓은 쿼리를 실행하는 함수와 필요한 정보를 인자로 넣으면 transaction은 mysql과 연결한 뒤 해당 쿼리문을 수행한다.
로그인 비밀번호는 해시값으로 암호화 되어있기 때문에 `bcrypt.compare`을 통해서 가져온 db의 비밀번호와 비교한다.

비밀번호를 비교한 뒤 해당하는 유저가 맞거나 틀리거나의 여부에 상관없이 done 함수를 호출한다.
`done()`이 실행되면 해당 미들웨어가 끝나고 다시 이전에 진행하던 함수로 돌아가는데, 돌아가는 함수는 아까 `authenticate` 함수 내의 다음 미들웨어를 실행한다.

done의 인자로 주었던 세 가지의 값들은 이 콜백 함수의 세 가지 인자에 들어가게 된다.
```js
 (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      // 해당하는 인증 정보를 찾기 못했을 경우 401 에러 반환
      return res.status(401).json(info);
    }
    //req의 login 두번째 인자 -> 에러 핸들링
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      // 로그인 성공시 200 응답하기
      return res.status(200).json({ message: "successfully login" });
    });
  }
```
해당 미들웨어는 만약 여기서 유저를 찾지 못했다거나 로그인이 됐을 경우를 처리해준다.
해당 함수는 콜백 함수를 리턴하게 되는데, 이 과정에서 방금 받았던 로그인 정보에 대해서 에러가 있었을 시 처리를 하고 req의 login 메소드를 호출하면, passport는 설정해놨던 `passport.serializeUser()`를 호출시킨다.
```js
export default function () {
  passport.serializeUser((user, done) => {
    done(null, user.username);
  });

  passport.deserializeUser(async (username, done) => {
    try {
      const user = await transaction(User.findOne, username);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  local();
}
```

Serialize(직렬화)란?
> 데이터 스트림으로 만들어진 객체로, 객체 자체를 영속적으로 보관할 떄 사용하는  파일형태로 작성되어 네트워크를 통해 전송한다.
> 간단하게 직렬하는 바이트 형태로 바꾸는 작업이다.
> 
자매품으로 Deserialize는 이렇게 데이터 스트림으로 만들어진 객체를 반대로 다시금 해석하고, 원래의 형태로 되돌리는 역할을 한다

serialzieUser를 통해 로컬에 PK로 두고 로그인을 식별 가능한 최소한의 값(메모리 최적화)만을 가지고 있도록 한다. done()함수의 두번째 인자로 넣으면 된다.
serializeUser가 끝난 후에는 밑으로 가서 바로 deserializeUser를 실행하낟. 해당 미들웨어에는 알아서 유저가 들어가게 되기 때문에 나는 거기서 유저를 다시금 db에서 찾아서 done의 두번째 인자로 user를 넣어줌으로써 req 객체에 user 객체를 등록시킬 수 있다.

로그인 성공/실패의 여부와는 별개로 desrializeUser에서 실행하는 done은 같은 `req.login`미들웨어로 다시 돌아오고 해당 결과는 
```js
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
```
요 부분의 loginError로 들어가게 된다.
여기서 done의 인자가 로그인 성공시 두개인데 왜 여기서 받는 인자는 하나냐면 두 번째 인자의 경우에는 req 객체에 user 객체만 등록하는 것일 뿐 돌아오면서 해당 콜백의 인자로 넣어주는게 아니기 때문에 첫 번째 인자만 넘어오게 된다. 그래서 로그인 성공시 done의 첫번쨰 인자가 null이고, 실패 시에는 첫번째 인자가 error인 것이다.

이렇게 로그인이 완료된 후에 응답을 보낼 때는 
```js
// app.js
passportConfig();
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECRET_KEY || crypto.randomBytes(32).toString("hex"),
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

```
해당 미들웨어들을 순서대로 실행시켜준다.
여기서 passportConfig는 아까 serialize, deserialize가 있는 함수이다!
로그인이 완료되면 응답을 보낼 때 여기서 session에 cookie 설정을 하고 보내면(**set-cookie**를 해준다) 알아서 클라이언트의 쿠키에 세션 정보가 저장되고, 클라이언트에서 요청을 보낼 때 알아서 머리에 쿠키를 담아 보낸다

>httpOnly Cookie
>자바스크립트를 통해 쿠키에 접근할 수 없게 되어 악성 스크립트를 통해 쿠키값에 접근하는 것을 막아준다.

>secure Cookie
>네트워크 감청을 막기 위한 쿠키 세팅이다. 암호화된 쿠키를 넘겨준다
>하지만 https가 아닌 http에서는 사용할 수 없다

그렇다면 머리에 쿠키를 담고 보내는 클라이언트 녀석은 나중에 api를 요청할 때 어떤 방식으로 유저임을 확인할까?

## 로그인 이후 세션 아이디로 인증

로그인 이후에는 클라이언트가 머리에 쿠키를 달고 api를 요청하면서 등장하면 서버는 이 쿠키를 떼어 해당 세션 아이디에 해당하는 유저네임을 뽑고, 그 유저네임을 통해 db에 해당 유저가 여전히 존재하는지를 확인한다. 

이 과정에서 모든 요청에 `passport.session` 미들웨어가 `passport.deserializeUser` 메서드를 항상 실행하면서 벌어지는 일인데, 아까 봤던 대로 deserializeUser는 db에서 사용자를 조회하고 조회된 사용자 전체 정보를 req 객체에 등록하는 역할을 한다.

그래서 항상 로그인한 뒤에는 알아서 db에서 유저 정보 뽑아서 req 객체로 넣어주니, 우리는 라우터에서 이 req 객체의 user 객체를 통해서 접근하고 유저 정보에 맞는 정보만을 뽑아서 줄 수 있다!

