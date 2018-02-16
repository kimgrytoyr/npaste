// npm modules
const crontab = require('node-crontab');
const fs = require('fs');

// local modules
const config = require('./config').getConfig();

exports.run = () => {
  // Delete pastes older than X minutes
  const deleterId = crontab.scheduleJob("* * * * *", () => {
    const pastes = fs.readdirSync(config.path);
    const now = new Date().getTime();
    for (let i = 0; i < pastes.length; i++) {
      const file = pastes[i];
      if (file.indexOf('.meta') !== -1) {
        const metadata = JSON.parse(fs.readFileSync(config.path + file));
        const diff = (now - (config.max_age * 1000 * 60));

        const aboveGlobalMaxAge = config.max_age > 0 && diff > metadata.timestamp;
        const expired = metadata.expiresAt < now;
        if (aboveGlobalMaxAge || expired) {
          // Delete file..
          fs.unlinkSync(config.path + metadata.id + '.meta');
          fs.unlinkSync(config.path + metadata.id + '.' + metadata.extension);
        }
      }
    }
  });

}
