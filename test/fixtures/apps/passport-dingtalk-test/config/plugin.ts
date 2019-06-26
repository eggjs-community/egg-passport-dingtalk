import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  passport: {
    enable: true,
    package: 'egg-passport',
  },
};

export default plugin;
