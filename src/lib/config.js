// npm modules
const fs = require('fs');
const yaml = require('js-yaml');

const env = process.env.NODE_ENV || 'development';
const VERSION = "v0.6.3";

exports.getConfig = () => {
  const configFolder = process.env.CONFIG_PATH || '../data/';

  if (fs.existsSync(configFolder + 'config.' + env + '.yml')) {
    let conf = {};
    try {
      conf = yaml.safeLoad(fs.readFileSync('../data/config.' + env + '.yml'));
    }
    catch (e) {
      throw Error('Unable to parse config..');
    }

    conf.version = VERSION;
    return conf;
  } else {
    throw Error('Unable to read config..');
  }
}
