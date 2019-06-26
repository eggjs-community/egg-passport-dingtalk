import * as assert from 'assert';
import Strategy from './lib/passport-dingtalk';
import { Application } from 'egg';

export default (app: Application) => {
  const config = app.config.passportDingtalk;
  config.passReqToCallback = true;
  assert(config.key, '[egg-passport-dingtalk] config.passportDingtalk.key required');
  assert(config.secret, '[egg-passport-dingtalk] config.passportDingtalk.secret required');

  // must require `req` params
  app.passport.use('dingtalk', new Strategy((req, user, done) => {
    app.passport.doVerify(req, user, done);
  }));

  app.config.coreMiddleware.push('renderDingtalkOauth');
};
