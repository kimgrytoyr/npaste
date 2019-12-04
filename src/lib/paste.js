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
    paste.path = config.path + pasteId + '.' + paste.metadata.extension;
    paste.data = fs.readFileSync(paste.path);
  } else if (fs.existsSync(config.archive_path + pasteId + '.' + paste.metadata.extension)) {
    paste.path = config.archive_path + pasteId + '.' + paste.metadata.extension;
    paste.archived = true;
  }

  return paste;
}

const download = (req, res, next) => {
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

  if (paste.metadata.maxOpens && paste.metadata.maxOpens > 0 && paste.metadata.timesOpened && paste.metadata.timesOpened >= paste.metadata.maxOpens) {
    return res.status(400).send('This paste has reached its maximum number of views');
  }

  // Do not show pastes have a currently invalid mime type
  if (helpers.validateMimeType(paste) === false || typeof paste.metadata.contentType === 'undefined') {
    return res.status(500).send('Invalid type');
  }

  helpers.increaseTimesOpened(paste);

  console.log(paste);

  const file = config.path + paste.metadata.id + '.' + paste.metadata.extension;
  return res.download(file, paste.metadata.id + '.' + paste.metadata.extension + (paste.metadata.encrypted ? '.gpg' : ''));
}

const filename = (req, res, next) => {
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

  if (paste.metadata.maxOpens && paste.metadata.maxOpens > 0 && paste.metadata.timesOpened && paste.metadata.timesOpened >= paste.metadata.maxOpens) {
    return res.status(400).send('This paste has reached its maximum number of views');
  }

  // Do not show pastes have a currently invalid mime type
  if (helpers.validateMimeType(paste) === false || typeof paste.metadata.contentType === 'undefined') {
    return res.status(500).send('Invalid type');
  }

  res.status(200).send(paste.metadata.id + '.' + paste.metadata.extension + (paste.metadata.encrypted ? '.gpg' : ''));
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

  if (paste.metadata.maxOpens && paste.metadata.maxOpens > 0 && paste.metadata.timesOpened && paste.metadata.timesOpened >= paste.metadata.maxOpens) {
    return res.status(400).send('This paste has reached its maximum number of views');
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
    fullExpiresAtTimestamp: (paste.metadata.expiresAt > 0 ? new Date(paste.metadata.expiresAt).toISOString() : null),
    generatedTimestamp: new Date().toISOString(),
    domain: config.uri_base,
    url: config.uri_base + '/' + paste.metadata.id,
    rawUrl: config.uri_base + '/' + paste.metadata.id + '/',
    version: config.version
  };

  // Do not show pastes have a currently invalid mime type
  if (helpers.validateMimeType(paste) === false) {
    return res.status(500).send('Invalid type');
  }

  if (paste.metadata.type == 'text' || paste.metadata.contentType.split('/')[0] == 'text') {
    // We're good..
  } else if (paste.metadata.type == "image" || paste.metadata.contentType.split('/')[0] == 'image') {
    template = 'image';
    if (!paste.metadata.encrypted) {
      options.data = 'data:' + paste.metadata.contentType + ';base64, ' + new Buffer(paste.data).toString('base64');
    }
  } else {
    return res.status(500).send('Invalid type');
  }

  helpers.increaseTimesOpened(paste);

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
  // Do not show pastes have a currently invalid mime type
  if (helpers.validateMimeType(paste) === false || typeof paste.metadata.contentType === 'undefined') {
    return res.status(500).send('Invalid type');
  }

  if (paste.metadata.maxOpens && paste.metadata.maxOpens > 0 && paste.metadata.timesOpened && paste.metadata.timesOpened >= paste.metadata.maxOpens) {
    return res.status(400).send('This paste has reached its maximum number of views');
  }

  helpers.increaseTimesOpened(paste);

  if (paste.metadata.type === "text") {
    res.setHeader("Content-Type", "text/plain");
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
    let mimeType = result.split(';')[0];

    if (req.body.mimetype) {
      mimeType = req.body.mimetype;
    }

    if (helpers.validateMimeType({
      metadata: {
        contentType: mimeType,
      },
    }) === false) {
      fs.unlinkSync(req.file.path);
      return res.status(400).send('MIME type not allowed: ' + mimeType);
    }

    if (config.mime_types[mimeType]) {
      type = config.mime_types[mimeType].type;
      contentType = config.mime_types[mimeType].mime_type;
      extension = config.mime_types[mimeType].extension;
    } else {
      // No default set. Fallback to text/plain.
      type = "text";
      contentType = "text/plain";
      extension = "txt";
    }

    const metadata = {
      id: filename,
      timestamp: new Date().getTime(),
      type: type,
      contentType: contentType,
      extension: extension,
      submitter: user.name,
      timesOpened: 0,
      encrypted: req.body.encrypted == 1 ? true : false,
    }

    // Should this paste be rendered as plain text without highlighting?
    // TODO: Consider if this should be an option in the UI instead?
    metadata.plain = req.body.plain == 1 ? true : false;

    // Can this paste only be opened X times?
    if (req.body.maxopens && parseInt(req.body.maxopens) > 0) {
      metadata.maxOpens = parseInt(req.body.maxopens);
    }

    // If provided, set paste age. If not provided, use default age from config.
    // Age of 0 means no expiration.
    metadata.expiresAt = req.body.age ? helpers.parseAge(req.body.age) : null;

    // If submitter wants to keep this paste forever, set an archive flag
    // so that the scheduler will move it to an archive instead of physically
    // deleting the file
    metadata.archive = req.body.archive == 1 ? true : false;

    if (req.body.vault) {
      metadata.vault = req.body.vault;
    }

    // Create .meta file
    helpers.saveMetadata(filename, metadata);

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

  fs.unlinkSync(paste.path);

  return res.status(200).send('OK');
}

module.exports = {
  getFormatted: getFormatted,
  getRaw: getRaw,
  getMeta: getMeta,
  add: add,
  delete: remove,
  download: download,
  filename: filename,
}
