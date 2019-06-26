import * as log from 'debug';
import { Context } from 'egg';
import { DingtalkResponse } from "../index";

const debug = log('egg-passport-dingtalk');

interface DingtalkAuthProps {
  ctx: Context,
  appid: string,
  appsecret: string,
}

type AccessTokenResponse = {
  access_token: string,
}

type PersistentResponse = {
  openid: string,
  persistent_code: string,
}

type SnsResponse = {
  sns_token: string,
}

type UserInfoResponse = {
  errcode: number,
  errmsg: string,
  user_info: DingtalkResponse,
}

const DINGTALK_BASE_URL = 'https://oapi.dingtalk.com';

export default class DingtalkAuth implements DingtalkAuthProps{
  ctx: Context;
  appid: string;
  appsecret: string;
  
  constructor({ ctx, appid, appsecret }: DingtalkAuthProps) {
    this.ctx = ctx;
    this.appid = appid;
    this.appsecret = appsecret;
  }

  async getAuthData(tmpAuthCode: string): Promise<DingtalkResponse> {
    const accessTokenInfo = await this._getAccessToken();
    debug(accessTokenInfo);
    const persistentCodeInfo = await this._getPersistentCode(
      accessTokenInfo.access_token,
      tmpAuthCode,
    );
    debug(persistentCodeInfo);
    const snsTokenInfo = await this._getSnsToken(
      accessTokenInfo.access_token,
      persistentCodeInfo.openid,
      persistentCodeInfo.persistent_code,
    );
    debug(snsTokenInfo);
    const res = await this._getUserInfo(snsTokenInfo.sns_token);
    if (res.errcode === 0 && res.user_info) {
      return res.user_info;
    }
    throw new Error(res.errmsg + '|' + res.errcode);
  }

  async _getAccessToken(): Promise<AccessTokenResponse> {
    const requestAccessToken = await this.ctx.curl(DINGTALK_BASE_URL
      + `/sns/gettoken?appid=${this.appid}&appsecret=${this.appsecret}`, {
      dataType: 'json',
    });
    return requestAccessToken.data;
  }

  async _getPersistentCode(accessToken: string, tmpAuthCode: string): Promise<PersistentResponse> {
    const requestPersistentCode = await this.ctx.curl(DINGTALK_BASE_URL
      + `/sns/get_persistent_code?access_token=${accessToken}`, {
      method: 'POST',
      dataType: 'json',
      contentType: 'json',
      data: {
        tmp_auth_code: tmpAuthCode,
      },
    });
    return requestPersistentCode.data;
  }

  async _getSnsToken(accessToken: string, openid: string, persistentCode: string): Promise<SnsResponse> {
    const requestSnsToken = await this.ctx.curl(DINGTALK_BASE_URL
      + `/sns/get_sns_token?access_token=${accessToken}`, {
      method: 'POST',
      dataType: 'json',
      contentType: 'json',
      data: {
        openid,
        persistent_code: persistentCode,
      },
    });
    return requestSnsToken.data;
  }

  async _getUserInfo(snsToken: string): Promise<UserInfoResponse> {
    const requestUserInfo = await this.ctx.curl(DINGTALK_BASE_URL
      + `/sns/getuserinfo?sns_token=${snsToken}`, {
      dataType: 'json',
      contentType: 'json',
    });
    return requestUserInfo.data;
  }
};
