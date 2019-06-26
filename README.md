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

dingtalk passport plugin for egg

## Install

```bash
$ npm i egg-passport @alipay/egg-passport-dingtalk --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.passport = {
  enable: true,
  package: 'egg-passport'
}

exports.passportDingtalk = {
  enable: true,
  package: '@alipay/egg-passport-dingtalk',
};
```

## Configuration

apply the app from [https://open-dev.dingtalk.com/#/loginAndShareApp](https://open-dev.dingtalk.com/#/loginAndShareApp)

```js
// {app_root}/config/config.default.js
exports.passportDingtalk = {
    key: 'your-key',
    secret: 'your-secret',
    // default is /callback/dingtalk
    callbackURL: '/callback/dingtalk',
    // default is /passport/dingtalk
    loginURL: '/passport/dingtalk',
    oauthPageConfig: {
      title: 'your-dingtalk-oauth-page-title',
      logo: 'your-app-icon',
      slogan: 'your-app-slogan',
    },
    // Your custom dingtalk oauth page, if this is set, the default oauthPageConfig will be invalid
    customLoginURL: '/auth',    
};
```

see [config/config.default.js](config/config.default.ts) for more detail.

```js
// {app_root}/config/config.default.js
exports.passportDingtalk = {
};
```

| key                    | value                                      | note                                                         |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| key                    | string                                     | required                                                       |
| secret                 | string                                     | required                                                       |
| callbackURL            | string  default is '/callback/dingtalk' | optional                 |
| loginURL               | string  default is '/passport/dingtalk'  | optional                                     |
| oauthPageConfig.title  | string                                     | optional                                     |
| oauthPageConfig.logo   | string                                     | optional                                 |
| oauthPageConfig.slogan | string                                     | optional                                    |
| customLoginURL         | string                                     | optional<br>If this is set, then you should render the oauth page by yourself |


## Example

### Login with dingtalk

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

***Notice***: The dingtalk is different with github or twitter, it need to be rendered by yourself. Luckily, we provide a nice default page for you.

### Authenticate Requests

Usually, you could write a middleware to handle if a request need to be login, example will like below:

```js
// app/router.js
module.exports = app => {
  app.get('/', app.middleware.needLogin(null, app), 'home.index');
};
```

About how to write a middleware, please refer [this](https://eggjs.org/en/basics/middleware.html)

```js
// app/middleware/need-login.js
module.exports = (options, app) => {
  return async function needLogin (ctx, next) {
     const passportDingtalkConfig = app.config.passportDingtalk;
     if (!ctx.isAuthenticated()) {
       return ctx.redirect(passportDingtalkConfig.loginURL);
     }
     await next();   
  }
}
```

Then you visit the path '/', it will redirect you to the login page;

### Integrated with DB verify or serializeUser

```js
// app/router.js
module.exports = app => {
  app.get('/', 'home.index');

  // authenticates routers
  app.passport.mount('dingtalk', app.config.passportDingtalk);

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

### passport API supported

See [https://github.com/eggjs-community/egg-passport#apis](https://github.com/eggjs-community/egg-passport#apis).

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

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs-community/egg/issues).

## License

[MIT](LICENSE)
