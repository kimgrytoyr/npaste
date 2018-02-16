// vim: tabstop=2 shiftwidth=2 expandtab

// npm modules
const express = require('express');
const router = express.Router({ strict: true });
const multer  = require('multer');
const config = require('../lib/config').getConfig(); // local
const upload = multer({ dest: config.path })

// local modules
const auth = require('../lib/auth');
const paste = require('../lib/paste');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'npaste' });
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
