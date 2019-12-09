// vim: tabstop=2 shiftwidth=2 expandtab

// npm modules
const express = require('express');
const router = express.Router({ strict: true });
const multer = require('multer');
const config = require('../lib/config').getConfig(); // local
const upload = multer({ dest: config.path })

// local modules
const auth = require('../lib/auth');
const paste = require('../lib/paste');

/* GET robots.txt */
router.get('/robots.txt', (req, res, next) => {
  res.end(`User-agent: *
User-agent: AdsBot-Google
User-agent: AdsBot-Google-Mobile
User-agent: AdsBot-Google-Mobile-Apps
Disallow: /`, 'binary');
});

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'npaste',
    generatedTimestamp: new Date().toISOString(),
    version: config.version
  });
});

/* GET paste */
router.get('/:paste', (req, res, next) => {
  // Syntax highlighted
  paste.getFormatted(req, res, next);
});

/* GET paste */
router.get('/:paste/', (req, res, next) => {
  // Raw data
  paste.getRaw(req, res, next);
});

/* GET paste metadata */
router.get('/:paste/meta', (req, res, next) => {
  paste.getMeta(req, res, next);
});

/* GET paste as download */
router.get('/:paste/download', (req, res, next) => {
  paste.download(req, res, next);
});

/* GET paste filename */
router.get('/:paste/download/filename', (req, res, next) => {
  paste.filename(req, res, next);
});

/* POST paste */
router.route('/')
  .post(auth.authenticate, upload.single('paste'), (req, res, next) => {
    paste.add(req, res, next);
  });

/* DELETE paste */
router.delete('/:paste', auth.authenticate, (req, res, next) => {
  paste.delete(req, res, next);
});

module.exports = router;
