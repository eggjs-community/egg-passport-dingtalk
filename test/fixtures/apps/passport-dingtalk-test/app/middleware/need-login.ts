import { Application, Context } from 'egg';

type noop = () => {};

export default (_: object, app: Application) => {
  return async function needLogin (ctx: Context, next: noop) {
    const passportDingtalkConfig = app.config.passportDingtalk;
    if (!ctx.isAuthenticated()) {
      return ctx.redirect(passportDingtalkConfig.loginURL);
    }
    await next();
  };
};
