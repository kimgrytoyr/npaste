// npm modules
const fs = require('fs');
const moment = require('moment');
const basicAuth = require('basic-auth');
const crypto = require('crypto');
const mmm = require('mmmagic'),
      Magic = mmm.Magic;

// local modules
const helpers = require('../lib/helpers');
const config = require('../lib/config').getConfig();

const getPaste = (pasteId) => {
  const paste = {
    metadata: null,
    data: null,
    expired: false
  }

  if (!fs.existsSync(config.path + pasteId + '.meta')) {
    return false;
  }

  paste.metadata = helpers.getMetadata(pasteId, config.path);

  if (paste.metadata.expiresAt !== null && paste.metadata.expiresAt < new Date().getTime()) {
    paste.expired = true;
  }

  if (fs.existsSync(config.path + pasteId + '.' + paste.metadata.extension)) {
    paste.data = fs.readFileSync(config.path + pasteId + '.' + paste.metadata.extension);
  } else if (fs.existsSync(config.archive_path + pasteId + '.' + paste.metadata.extension)) {
    paste.archived = true;
  }

  return paste;
}

const getFormatted = (req, res, next) => {
  const paste = getPaste(req.params.paste);
  if (paste === false) {
    return res.status(400).send('Paste not found');
  }

  if (paste.archived) {
    return res.status(400).send('This paste has been archived and is no longer publicly available.');
  }

  if (paste.expired || paste.data == null) {
    return res.status(400).send('This paste has expired and is no longer available.');
  }

  // TODO: Cleanup/simplification
  let template = 'text';
  let image = null;
  let options = {
    data: paste.data,
    paste: paste.metadata,
    postedAt: moment(paste.metadata.timestamp).fromNow(),
    expiresAt: (paste.metadata.expiresAt > 0 ? moment(paste.metadata.expiresAt).fromNow() : null),
    fullTimestamp: new Date(paste.metadata.timestamp).toISOString(),
    generatedTimestamp: new Date().toISOString(),
    domain: config.uri_base,
    url: config.uri_base + '/' + paste.metadata.id,
    rawUrl: config.uri_base + '/' + paste.metadata.id + '/',
    version: config.version
  };

  if (typeof paste.metadata.contentType === 'undefined') {
    return res.status(500).send('Invalid type');
  } else if (paste.metadata.contentType != 'text/plain') {
    template = 'image';
    options.data = 'data:' + paste.metadata.contentType + ';base64, ' + new Buffer(paste.data).toString('base64');
  }

  res.render(template, options);
}

const getRaw = (req, res, next) => {
  const paste = getPaste(req.params.paste);
  if (paste === false) {
    return res.status(400).send('Paste not found');
  }

  if (paste.archived) {
    return res.status(400).send('This paste has been archived and is no longer publicly available.');
  }

  if (paste.expired || paste.data == null) {
    return res.status(400).send('This paste has expired and is no longer available.');
  }

  if (typeof paste.metadata.contentType === 'undefined') {
    return res.status(500).send('Invalid type');
  }

  return res.end(paste.data, 'binary');
}

const getMeta = (req, res, next) => {
  const paste = getPaste(req.params.paste);
  if (paste === false) {
    return res.status(400).send('Paste not found');
  }

  if (paste.archived) {
    return res.status(400).send('This paste has been archived and is no longer publicly available.');
  }

  if (paste.expired || paste.data == null) {
    return res.status(400).send('This paste has expired and is no longer available.');
  }

  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(paste.metadata));
}

const add = (req, res, next) => {
  const user = basicAuth(req);

  if (!req.file)
    return res.status(400).send('No paste uploaded');

  // Find an unused and unique filename
  var filename;
  while (true) {
    filename = crypto.randomBytes(parseInt(config.filename_length)).toString('hex');
    if (!fs.existsSync(config.path + filename + '.meta')) break;
  }

  // Check file type
  // TODO: Review, a bit messy
  let extension = null;

  const magic = new Magic(mmm.MAGIC_MIME_TYPE | mmm.MAGIC_MIME_ENCODING);
  magic.detectFile(req.file.path, (err, result) => {
    if (err) throw err;
    let type = result.split(';')[0];

    if (type.split('/')[0] == 'text') {
      type = 'text/plain';
      extension = 'txt';
    } else if (type == 'image/jpg') {
      extension = 'jpg';
    } else if (type == 'image/png') {
      extension = 'png';
    }

    if (extension == null) {
      return res.status(400).send('Wrong file type: ' + type);
    }

    const metadata = {
      id: filename,
      timestamp: new Date().getTime(),
      contentType: type,
      extension: extension,
      submitter: user.name
    }

    // Should this paste be rendered as plain text without highlighting?
    // TODO: Consider if this should be an option in the UI instead?
    metadata.plain = req.body.plain == 1 ? true : false;

    // If provided, set paste age. If not provided, use default age from config.
    // Age of 0 means no expiration.
    metadata.expiresAt = req.body.age ? helpers.parseAge(req.body.age) : null;

    // If submitter wants to keep this paste forever, set an archive flag
    // so that the scheduler will move it to an archive instead of physically
    // deleting the file
    metadata.archive = req.body.archive == 1 ? true : false;

    // Create .meta file
    // TODO: Move this to function or module
    fs.writeFileSync(config.path + filename + '.meta', JSON.stringify(metadata));

    // Move uploaded file to its final destination
    fs.renameSync(req.file.path, config.path + filename + '.' + extension);

    return res.status(200).send(config.uri_base + '/' + filename);
  });

}

const remove = (req, res, next) => {
  const paste = getPaste(req.params.paste);
  if (paste === false) {
    return res.status(400).send('Paste not found');
  }

  if (paste.expired || paste.data == null) {
    return res.status(400).send('This paste has expired and the contents are no longer available.');
  }

  fs.unlinkSync(config.path + req.params.paste + '.' + paste.metadata.extension);

  return res.status(200).send('OK');
}

module.exports = {
  getFormatted: getFormatted,
  getRaw: getRaw,
  getMeta: getMeta,
  add: add,
  delete: remove
}
