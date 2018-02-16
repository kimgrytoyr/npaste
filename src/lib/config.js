// npm modules
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';

exports.getConfig = () => {
  const configFolder = process.env.CONFIG_PATH || '../data/';

  if (fs.existsSync(configFolder + 'config.' + env + '.json')) {
    return JSON.parse(fs.readFileSync('../data/config.' + env + '.json'));
  } else {
    throw Error('Unable to read config..');
  }
}
