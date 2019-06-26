import { Application, Context } from 'egg';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { renderString } from 'nunjucks';
import { getpath, noop } from "../../lib/util";

export default (_: object, app: Application) => {
  return async function renderDingtalkOuath(ctx: Context, next: noop) {
    const config = app.config.passportDingtalk;
    const {
      loginURL,
      oauthPageConfig,
      key,
      callbackURL,
      customLoginURL,
    } = config;
    
    const pathname = getpath(ctx.req.url);
    if (pathname === loginURL) {
      if (customLoginURL) {
        ctx.redirect(customLoginURL);
      } else {
        const content = readFileSync(resolve(__dirname, '../../lib/auth.html'), 'utf8');
        ctx.body = renderString(content, {
          context: JSON.stringify({
            key,
            callbackURL,
          }),
          ...oauthPageConfig,
        });
      }
    } else {
      await next();
    }
  };
};
