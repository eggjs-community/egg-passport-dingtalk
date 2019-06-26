import mock from 'egg-mock';
// import * as assert from 'assert';

describe('test/passport-dingtalk.test.ts', () => {
  let app: any;
  before(() => {
    app = mock.app({
      baseDir: 'apps/passport-dingtalk-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, passportDingtalk')
      .expect(200);
  });
  
  it('should REDIRECT /need-login', () => {
    return app.httpRequest()
      .get('/need-login')
      .expect(302);
  });
  
  it('should GET /passport/dingtalk', () => {
    return app.httpRequest()
      .get('/passport/dingtalk')
      .expect(200);
  });
  
  it('should GET /callback/dingtalk', () => {
    return app.httpRequest()
      .get('/callback/dingtalk')
      .expect(401);
  });
  
  it('should GET /callback/dingtalk?code=xxxx', () => {
    return app.httpRequest()
      .get('/callback/dingtalk')
      .expect(401);
  });
  
  it('should GET /logout', () => {
    return app.httpRequest()
      .get('/logout')
      .expect(200)
      .expect('ok, logout');
  });
  // TODO: 钉钉扫码登录测试
});
