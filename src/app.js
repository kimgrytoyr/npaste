// vim: tabstop=2 shiftwidth=2 expandtab

// npm modules
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const moment = require('moment');

// local modules
const config = require('./lib/config').getConfig();
const scheduler = require('./lib/scheduler').run();
const helpers = require('./lib/helpers');

// routes
const index = require('./routes/index');
const stats = require('./routes/stats');

const app = express();
app.disable('x-powered-by'); // dont show this header
app.set('_config', config);
app.locals.config = config;

// view engine setup
app.locals.pretty = true; // Print pretty HTML
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/stats', stats);
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
