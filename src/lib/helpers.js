// npm modules
const fs = require('fs');

// local modules
const config = require('./config').getConfig();


// Get metadata for a paste
exports.getMetadata = (id, path) => {
  // TODO: Error handling
  return JSON.parse(fs.readFileSync(path + id + '.meta'));
}

exports.validateMimeType = (paste) => {
  if (typeof config.mime_types[paste.metadata.contentType] === 'undefined') return false;

  return true;
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

  const now = new Date().getTime();
  let expiration = now;
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
