import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config = {} as PowerPartial<EggAppConfig>;
  config.keys = '123456';
  
  config.passportDingtalk = {
    key: 'XXX',
    secret: 'YYY',
    callbackURL: '/callback/dingtalk',
    loginURL: '/passport/dingtalk',
    oauthPageConfig: {
      title: 'marmot-console-login',
      logo: 'https://gw.alipayobjects.com/zos/rmsportal/fqXMvdcvgzBymiStKSCR.svg',
      slogan: 'Welcome to Marmot!',
    },
  };
  
  return {
    ...config,
  };
};
