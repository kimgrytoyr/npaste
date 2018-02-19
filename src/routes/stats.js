// vim: tabstop=2 shiftwidth=2 expandtab

// npm modules
const express = require('express');
const router = express.Router({ strict: true });
const fs = require('fs');
const config = require('../lib/config').getConfig(); // local
const filesize = require('filesize');

// local modules
const auth = require('../lib/auth');
const paste = require('../lib/paste');

/* GET stats page. */
router.get('/', (req, res, next) => {
  const stats = {
    count: {
      metadata: 0,
      active: 0,
      archived: 0
    },
    size: {
      metadata: 0,
      active: 0,
      archived: 0
    }
  }

  const pastes = fs.readdirSync(config.path);
  for (let i = 0; i < pastes.length; i++) {
    const file = pastes[i];

    if (file.indexOf('.meta') !== -1) {
      stats.count.metadata++;
      stats.size.metadata += fs.statSync(config.path + file).size;
    } else if (file[0] != '.') {
      stats.count.active++;
      stats.size.active += fs.statSync(config.path + file).size;
    }
  }

  const archived = fs.readdirSync(config.archive_path);
  for (let i = 0; i < archived.length; i++) {
    const file = archived[i];

    if (file[0] == '.') continue;

    stats.count.archived++;
    stats.size.archived += fs.statSync(config.archive_path + file).size;
  }

  stats.count.expired = stats.count.metadata - (stats.count.active + stats.count.archived);

  stats.size.total = filesize(stats.size.metadata + stats.size.active + stats.size.archived);
  stats.size.metadata = filesize(stats.size.metadata);
  stats.size.active = filesize(stats.size.active);
  stats.size.archived = filesize(stats.size.archived);

  res.render('stats', {
    title: 'npaste stats',
    stats: stats,
    version: config.version,
    generatedTimestamp: new Date().toISOString()
  });
});

module.exports = router;

