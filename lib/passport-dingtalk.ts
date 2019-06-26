import * as log from 'debug';
import DingtalkOuath from './dingtalk-oauth';
import { getpath } from "./util";
import {
  DingTalkVerifyType,
  PassportStrategy,
  errorCb,
  successCb,
  DingtalkVerify,
  AuthenticateReq,
  PassportDingtalkConfig,
} from "../index";

const debug = log('egg-passport-dingtalk');

export default class DingtalkStrategy implements DingtalkVerify, PassportStrategy {
  verifyDingtalk: DingTalkVerifyType;
  fail: errorCb;
  success: successCb;
  
  constructor(verify: DingTalkVerifyType) {
    this.verifyDingtalk = verify;
  }

  authenticate(req: AuthenticateReq, options: PassportDingtalkConfig) {
    const {
      callbackURL,
    } = options;
    const {
      url,
      ctx,
      query,
    } = req;
    const pathname = getpath(url);

    if (pathname === callbackURL) {
      const { code: tmpAuthCode } = query;
      debug('--------> tempAuthCode is', tmpAuthCode);
      const dingtalkUtil = new DingtalkOuath({
        ctx,
        appid: options.key,
        appsecret: options.secret,
      });
      dingtalkUtil.getAuthData(tmpAuthCode)
        .then(userInfo => {
          debug('--------> userInfo is', userInfo);
          const user = {
            provider: 'dingtalk',
            // the universe uniq id for dingtalk
            id: userInfo.openid,
            name: userInfo.nick,
            raw: userInfo,
          };

          this.verifyDingtalk(req, user, (err, user) => {
            if (err) {
              debug('--------> verify failed', err);
              this.fail(err);
            } else {
              this.success(user);
            }
          });
        })
        .catch(err => {
          this.fail(err);
        });
    }
  }
};

