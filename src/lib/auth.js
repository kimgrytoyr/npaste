// npm modules
const fs = require('fs');
const basicAuth = require('basic-auth');

exports.authenticate = (req, res, next) => {
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

