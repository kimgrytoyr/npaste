// vim: tabstop=2 shiftwidth=2 expandtab

// npm modules
const express = require('express');
const multer  = require('multer');
// TODO: Get path from config?
const upload = multer({ dest: '../data/pastes' })
const router = express.Router({ strict: true });
const crypto = require('crypto');
const fs = require('fs');
const basicAuth = require('basic-auth');
const moment = require('moment');
const mmm = require('mmmagic'),
      Magic = mmm.Magic;

// local modules
const helpers = require('../lib/helpers');

const getMetadata = (id, path) => {
  // TODO: Error handling
  return JSON.parse(fs.readFileSync(path + id + '.meta'));
}

const authenticate = (req, res, next) => {
  const config = req.app.get('_config');

  const unauthorized = (res) => {
    res.setHeader('WWW-Authenticate', 'Basic realm="npaste"');
    return res.sendStatus(401);
  };

  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  }

  // TODO: Better way to find tokens and error handling
  const tokens = JSON.parse(fs.readFileSync('../data/tokens.json'));
  if (tokens[user.name] && tokens[user.name] == user.pass) {
    return next();
  }
  return unauthorized(res);
}

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'npaste' });
});

/* GET paste */
router.get('/:paste', (req, res, next) => {
  // Syntax highlighted
  const config = req.app.get('_config');

  if (!fs.existsSync(config.path + req.params.paste + '.meta')) {
    return res.status(400).send('Paste not found');
  }

  const metadata = getMetadata(req.params.paste, config.path);
  let data = fs.readFileSync(config.path + req.params.paste + '.' + metadata.extension);

  // TODO: Cleanup/simplification
  let template = 'text';
  let image = null;
  let options = {
    data: data,
    paste: metadata,
    postedAt: moment(metadata.timestamp).fromNow(),
    expiresAt: (metadata.expiresAt > 0 ? moment(metadata.expiresAt).fromNow() : null),
    fullTimestamp: new Date(metadata.timestamp).toISOString(),
    generatedTimestamp: new Date().toISOString(),
    domain: config.uri_base,
    url: config.uri_base + '/' + metadata.id,
    rawUrl: config.uri_base + '/' + metadata.id + '/',
    version: config.version
  };

  if (typeof metadata.contentType === 'undefined') {
    return res.status(500).send('Invalid type');
  } else if (metadata.contentType != 'text/plain') {
    //return res.redirect('/' + req.params.paste + '/');
    template = 'image';
    options.data = 'data:' + metadata.contentType + ';base64, ' + new Buffer(data).toString('base64');
  }

  res.render(template, options);
});

/* GET paste */
router.get('/:paste/', (req, res, next) => {
  // Raw data
  const config = req.app.get('_config');

  if (!fs.existsSync(config.path + req.params.paste + '.meta')) {
    return res.status(400).send('Paste not found');
  }

  const metadata = getMetadata(req.params.paste, config.path);
  const data = fs.readFileSync(config.path + req.params.paste + '.' + metadata.extension);

  if (typeof metadata.contentType === 'undefined') {
    return res.status(500).send('Invalid type');
  }

  return res.end(data, 'binary');
});

/* GET paste metadata */
router.get('/:paste/meta', (req, res, next) => {
  const config = req.app.get('_config');

  if (!fs.existsSync(config.path + req.params.paste + '.meta')) {
    return res.status(400).send('Paste not found');
  }

  const metadata = getMetadata(req.params.paste, config.path);
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(metadata));
});

/* POST paste */
router.route('/')
  .post(authenticate, upload.single('paste'), (req, res, next) => {
    const config = req.app.get('_config');
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
      const type = result.split(';')[0];

      if (type.split('/')[0] == 'text') {
        type = 'text/plain';
        extension = 'txt';
      } else if (type == 'image/jpg') {
        extension = 'jpg';
      } else if (type == 'image/png') {
        extension = 'png';
      }

      if (extension == null) {
        return res.status(400).send('Wrong file type');
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

      // Create .meta file
      // TODO: Move this to function or module
      fs.writeFileSync(config.path + filename + '.meta', JSON.stringify(metadata));

      // Move uploaded file to its final destination
      fs.renameSync(req.file.path, config.path + filename + '.' + extension);

      return res.status(200).send(config.uri_base + '/' + filename);
    });
  });

/* DELETE paste */
router.delete('/:paste', authenticate, (req, res, next) => {
  const config = req.app.get('_config');

  if (!fs.existsSync(config.path + req.params.paste + '.meta')) {
    return res.status(400).send('Paste not found');
  }

  const metadata = getMetadata(req.params.paste, config.path);
  fs.unlinkSync(config.path + req.params.paste + '.meta');
  fs.unlinkSync(config.path + req.params.paste + '.' + metadata.extension);

  return res.status(200).send('OK');
});

module.exports = router;
