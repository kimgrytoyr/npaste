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

        if (!fs.existsSync(config.path + metadata.id + '.' + metadata.extension)) {
          // File probably archived..
          continue;
        }

        const diff = (now - (config.max_age * 1000 * 60));

        const aboveGlobalMaxAge = config.max_age > 0 && diff > metadata.timestamp;
        const expired = metadata.expiresAt !== null && metadata.expiresAt < now;
        if (aboveGlobalMaxAge || expired) {
          if (metadata.archive === true) {
            // Move file to archive
            fs.renameSync(config.path + metadata.id + '.' + metadata.extension, config.archive_path + metadata.id + '.' + metadata.extension);
          } else {
            // Physically delete file
            fs.unlinkSync(config.path + metadata.id + '.' + metadata.extension);
          }
        }
      }
    }
  });

}
