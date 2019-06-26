# egg-passport-dingtalk

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-passport-dingtalk.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-passport-dingtalk
[travis-image]: https://img.shields.io/travis/eggjs-community/egg-passport-dingtalk.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs-community/egg-passport-dingtalk
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs-community/egg-passport-dingtalk.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs-community/egg-passport-dingtalk?branch=master
[david-image]: https://img.shields.io/david/eggjs-community/egg-passport-dingtalk.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs-community/egg-passport-dingtalk
[snyk-image]: https://snyk.io/test/npm/egg-passport-dingtalk/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-passport-dingtalk
[download-image]: https://img.shields.io/npm/dm/egg-passport-dingtalk.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-passport-dingtalk

egg 钉钉的 oauth 登录的插件

## 依赖说明

### 依赖的 egg 版本

egg-passport-dingtalk 版本 | egg 1.x
--- | ---
1.x | 😁
0.x | ❌

### 依赖的插件

```bash
$ npm i egg-passport egg-passport-dingtalk --save
```

<!--

如果有依赖其它插件，请在这里特别说明。如

- security
- multipart

-->

## 开启插件

```js
// {app_root}/config/plugin.js
exports.passport = {
  enable: true,
  package: 'egg-passport'
}

exports.passportDingtalk = {
  enable: true,
  package: 'egg-passport-dingtalk',
};
```

## 使用场景

- 钉钉登录的 oauth 登录插件。

### 如何本地快速使用？

1. 先到 [https://open-dev.dingtalk.com/#/loginAndShareApp](https://open-dev.dingtalk.com/#/loginAndShareApp) 钉钉开发平台申请 app，如果嫌麻烦可以用下面的配置，后面再申请自己的。
2. 配置 [config/config.default.js](config/config.default.js)

    ```js
    // {app_root}/config/config.default.js
    exports.passportDingtalk = {
       key: 'dingoajnypqmpu2qrp7wro',
       secret: 'Kb6mm73u0zMyEmUPXzYKnO3TuR9COIgUfsbBc9EhV9VYqVLmUxWGjwE0ojYySFEy',
       // default is /callback/dingtalk
       callbackURL: '/callback/dingtalk',
       // default is /passport/dingtalk
       loginURL: '/passport/dingtalk',
       oauthPageConfig: {
         title: 'your-dingtalk-oauth-page-title',
         logo: 'https://gw.alipayobjects.com/zos/antfincdn/Sr9Hypb7X5/d7b6ba74-f673-476d-9bae-77696aaab106.png',
         slogan: 'your-app-slogan',
       },
        // Your custom dingtalk oauth page, if this is set, the default oauthPageConfig will be invalid
       customLoginURL: null,    
    };
    ```   
3. 挂载 passport 的路由

    ```js
    // app/router.js
    module.exports = app => {
      app.get('/', 'home.index');
    
      // authenticates routers
      app.passport.mount('dingtalk', app.config.passportDingtalk);
      // this is a passport router helper, it's equal to the below codes
      //
      // const dingtalk = app.passport.authenticate('dingtalk');
      // app.get('/passport/dingtalk', dingtalk);
      // app.get('/passport/dingtalk/callback', dingtalk);
    };
    ```
4. 本地启动 egg, 然后访问 http://127.0.0.1:7001/passport/dingtalk。    

### 解决方案

#### 访问的路由必须要登录态

通常，这需要你来写一个中间件来实现。这里先给一个思路，看下面的代码：

```js
// app/router.js
module.exports = app => {
  // 访问 / 前，先有中间件来处理请求
  app.get('/', app.middleware.needLogin(null, app), 'home.index');
  app.passport.mount('dingtalk', app.config.passportDingtalk);
};
```

关于如何写一个中间请参考[这里](https://eggjs.org/en/basics/middleware.html)

```js
// app/middleware/need-login.js
module.exports = (options, app) => {
  return async function needLogin (ctx, next) {
     const passportDingtalkConfig = app.config.passportDingtalk;
     // 如果当前的登录态没有被认证过，则跳转到登录页面
     if (!ctx.isAuthenticated()) {
       return ctx.redirect(passportDingtalkConfig.loginURL);
     }
     await next();   
  }
}
```

这样实现后，用户访问 '/'，会先判断有没有登录，如果没有则跳转到登录页面。

这里只是给出一个最小的例子，当然你可以把这个中间件设置成全局的，然后在扩展一下，设置 ignore path 来全局过滤。

#### 如果来「序列化默认返回用户」或者「用 DB 验证框架返回的用户」

只需要实现一个方法就行：

```js
// app/router.js
module.exports = app => {
  app.get('/', 'home.index');

  // authenticates routers
  app.passport.mount('dingtalk', app.config.passportDingtalk);

  // 用户登录后的第一个回调，这个回调后，会把返回的用户写入 session
  app.passport.verify(async (ctx, user) => {
    // find user from database
    //
    // Authorization Table
    // column   | desc
    // ---      | --
    // provider | provider name, like github, twitter, facebook, weibo and so on
    // uid      | provider unique id
    // user_id  | current application user id
    const auth = await ctx.model.Authorization.findOne({
      uid: user.id,
      provider: user.provider,
    });
    const existsUser = await ctx.model.User.findOne({ id: auth.user_id });
    if (existsUser) {
      return existsUser;
    }
    // call user service to register a new user
    const newUser = await ctx.service.user.register(user);
    return newUser;
  });
};
```

## 详细配置

请到 [config/config.default.js](config/config.default.ts) 查看详细配置项说明。

```js
// {app_root}/config/config.default.js
exports.passportDingtalk = {
};
```

| key                    | value                                      | note                                                         |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| key                    | string                                     | 必须填                                                       |
| secret                 | string                                     | 必须填                                                       |
| callbackURL            | string  default is '/callback/dingtalk' | 选填，需要与在平台注册的 callback 地址是一个                 |
| loginURL               | string  default is '/passport/dingtalk'  | 选填，默认登录的路由地址                                     |
| oauthPageConfig.title  | string                                     | 选填，默认登录页的 title                                     |
| oauthPageConfig.logo   | string                                     | 选填，默认登录页的 logo 地址                                 |
| oauthPageConfig.slogan | string                                     | 选填，默认登录页的 slogan                                    |
| customLoginURL         | string                                     | 选填，如果需要自定义钉钉的登录页面<br>这个页面就要你自己来负责渲染<br>具体怎么写可以看一下这个 lib 里的 lib/auth.html 这个例子。<br>如果设置了这个 oauthPageConfig 这里的配置就无效了。 |

### passport API supported

See [https://github.com/eggjs/egg-passport#apis](https://github.com/eggjs/egg-passport#apis).

### extent `application`

- `app.passport.mount(strategy, options)`: Mount the login and the login callback routers to use the given `strategy`.
- `app.passport.authenticate(strategy, options)`: Create a middleware that will authorize a third-party account using the given `strategy` name, with optional `options`.
- `app.passport.verify(handler)`: Verify authenticated user
- `app.passport.serializeUser(handler)`: Serialize user before store into session
- `app.passport.deserializeUser(handler)`: Deserialize user after restore from session

### extend `context`

- `ctx.user`: get the current authenticated user
- `ctx.isAuthenticated()`: Test if request is authenticated
- `* ctx.login(user[, options])`: Initiate a login session for `user`.
- `ctx.logout()`: Terminate an existing login session

## 提问交流

请到 [egg issues](https://github.com/eggjs-community/egg-passport-dingtalk/issues) 异步交流。

## License

[MIT](LICENSE)
