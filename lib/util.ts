import * as URL from 'url';

export const getpath = (url: string): string => URL.parse(url).pathname;
export type noop = () => {};
