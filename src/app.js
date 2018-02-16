// vim: tabstop=2 shiftwidth=2 expandtab

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const crontab = require('node-crontab');

const index = require('./routes/index');

const app = express();
app.disable('x-powered-by'); // dont show this header

// TODO: Better config parsing?
const env = process.env.NODE_ENV || 'dev';
const getConfig = () => {
  if (fs.existsSync('../data/config.' + env + '.json')) {
    const c = JSON.parse(fs.readFileSync('../data/config.' + env + '.json'));
    app.locals.version = c.version;
    return c;
  } else {
    throw Error('Unable to read config..');
  }
}
app.set('_config', getConfig());

const jobId = crontab.scheduleJob("* * * * *", () => {
  // Delete pastes older than X minutes
  // TODO: Move somewhere else
  // TODO: Change config from minutes to days?
  const config = getConfig();
  if (config.max_age <= 0) return;

  const pastes = fs.readdirSync(config.path);
  const now = new Date().getTime();
  for (let i = 0; i < pastes.length; i++) {
    const file = pastes[i];
    if (file.indexOf('.meta') !== -1) {
      const metadata = JSON.parse(fs.readFileSync(config.path + file));
      const diff = (now - (config.max_age * 1000 * 60));
      if (diff > metadata.timestamp) {
        // Delete file..
        fs.unlinkSync(config.path + metadata.id + '.meta');
        fs.unlinkSync(config.path + metadata.id + '.' + metadata.extension);
      }
    }
  }
});

// view engine setup
app.locals.pretty = true; // Print pretty HTML
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
