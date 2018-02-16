// npm modules
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';
const VERSION = "v0.3.3";

exports.getConfig = () => {
  const configFolder = process.env.CONFIG_PATH || '../data/';

  if (fs.existsSync(configFolder + 'config.' + env + '.json')) {
    const conf = JSON.parse(fs.readFileSync('../data/config.' + env + '.json'));
    conf.version = VERSION;
    return conf;
  } else {
    throw Error('Unable to read config..');
  }
}
