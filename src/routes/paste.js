// vim: tabstop=2 shiftwidth=2 expandtab

var express = require('express');
var router = express.Router();

/* GET version. */
router.get('/:paste', function(req, res, next) {
  res.render('version', {
    paste: req.params.paste,
  });
});

module.exports = router;


