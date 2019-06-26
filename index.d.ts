import 'egg';
import { Context } from 'egg';

export type oauthPageConfig = {
  title: string,
  logo: string,
  slogan: string,
}

export interface PassportDingtalkConfig {
  key: string,
  secret: string,
  callbackURL: string,
  loginURL: string,
  passReqToCallback: boolean,
  customLoginURL?: string,
  oauthPageConfig?: oauthPageConfig,
}

export type AuthenticateReq = {
  url: string,
  ctx: Context,
  query: {
    code: string,
  },
}

export type DingtalkResponse = {
  nick: string,
  unionid: string,
  dingId: string,
  openid: string,
}

export type PassportDingtalkResponseUser = {
  provider: string,
  id: string,
  name: string,
  raw: DingtalkResponse,
}

export type DingTalkVerifyType = (
  req: AuthenticateReq,
  user: PassportDingtalkResponseUser,
  done: (err: Error | null | undefined, user: PassportDingtalkResponseUser) => void,
) => void;

export interface DingtalkVerify {
  verifyDingtalk: DingTalkVerifyType,
}

export type errorCb = (err: Error) => void;
export type successCb = (user: PassportDingtalkResponseUser) => void;

export interface PassportStrategy {
  authenticate: (req: AuthenticateReq, options: PassportDingtalkConfig) => void,
}

export interface Passport extends PassportStrategy {
  fail: errorCb,
  success: successCb,
  mount: (type: string, options: PassportDingtalkConfig) => void,
  verify: (verifyUser: (ctx: Context, user: PassportDingtalkResponseUser) => Promise<any>) => any,
  doVerify: DingTalkVerifyType,
  use: (type: string, strategy: PassportStrategy) => void,
}

declare module 'egg' {
  interface Application {
    passport: Passport,
  }
  
  interface EggAppConfig {
    passportDingtalk: PassportDingtalkConfig,
  }
  
  interface Context {
    user: any,
    login: (user: any, options: any) => Promise<any>,
    logout: (...args: any[]) => void,
    isAuthenticated: () => boolean,
  }
}
