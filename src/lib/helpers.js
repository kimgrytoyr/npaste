// npm modules
const fs = require('fs');

// local modules
const config = require('./config').getConfig();

// Check if paste is unavailable
exports.pasteIsUnavailable = (paste, res) => {
  if (paste === false) {
    return res.status(400).send('Paste not found');
  }

  if (paste.archived) {
    return res.status(400).send('This paste has been archived and is no longer publicly available.');
  }

  if (paste.expired || paste.data == null) {
    return res.status(400).send('This paste has expired and is no longer available.');
  }

  if (paste.metadata.maxOpens && paste.metadata.maxOpens > 0 && paste.metadata.timesOpened && paste.metadata.timesOpened >= paste.metadata.maxOpens) {
    return res.status(400).send('This paste has reached its maximum number of views');
  }

  // Do not show pastes have a currently invalid mime type
  if (this.validateMimeType(paste) === false || typeof paste.metadata.contentType === 'undefined') {
    return res.status(500).send('Invalid type');
  }

  return false;
}

// Get metadata for a paste
exports.getMetadata = (id, path) => {
  // TODO: Error handling
  return JSON.parse(fs.readFileSync(path + id + '.meta'));
}

// Increase number of times paste has been opened
exports.increaseTimesOpened = (paste) => {
  if (paste.metadata.timesOpened) {
    paste.metadata.timesOpened++;
  } else {
    paste.metadata.timesOpened = 1;
  }

  this.saveMetadata(paste.metadata.id, paste.metadata);
}

exports.validateMimeType = (paste) => {
  if (config.mime_types_blacklist.indexOf(paste.metadata.contentType) !== -1) return false;

  return true;
}

// Save metadata for a paste
exports.saveMetadata = (id, metadata) => {
  fs.writeFileSync(config.path + id + '.meta', JSON.stringify(metadata));
}


// Parse the "age" POST field and return a correct age.
exports.parseAge = (age) => {
  if (typeof age === 'undefined')
    return config.default_age;

  if (!Number.isInteger(parseInt(age)))
    return config.default_age;

  let unit = age.replace(/[0-9]/g, '');
  if (unit.length == 0) unit = 's';
  age = parseInt(age);

  if (age <= 0) return null;

  let expiration = new Date().getTime();

  // TODO: Handle unknown units
  switch (unit) {
    case 'y':
      expiration += (age * (365 * 24 * 60 * 60)) * 1000;
      break;
    case 'd':
      expiration += (age * (24 * 60 * 60)) * 1000;
      break;
    case 'h':
      expiration += (age * (60 * 60)) * 1000;
      break;
    case 'm':
      expiration += (age * (60)) * 1000;
      break;
    case 's':
      expiration += (age * 1000);
      break;
  }

  return expiration;
}
