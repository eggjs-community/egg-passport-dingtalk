// This file is created by egg-ts-helper@1.25.4
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportRenderDingtalkOauth from '../../../app/middleware/render-dingtalk-oauth';

declare module 'egg' {
  interface IMiddleware {
    renderDingtalkOauth: typeof ExportRenderDingtalkOauth;
  }
}
