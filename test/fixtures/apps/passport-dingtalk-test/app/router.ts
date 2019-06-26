import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  router.get('/', controller.home.index);
  router.get('/need-login', app.middleware.needLogin(null, app), controller.home.index);
  
  // @ts-ignore
  app.passport.mount('dingtalk', app.config.passportDingtalk);
  // @ts-ignore
  app.passport.verify(async (_, user: any) => {
    return user;
  });

  router.get('/logout', controller.home.logout);
}
