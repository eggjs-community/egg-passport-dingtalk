import { Controller } from 'egg';

export default class HomeController extends Controller {
  public async index() {
    this.ctx.body = 'hi, ' + this.app.plugins.passportDingtalk.name;
  }

  async logout() {
    this.ctx.logout();
    this.ctx.body = 'ok, logout';
  }
}
