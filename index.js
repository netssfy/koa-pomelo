'use strict';

//libs
const _ = require('lodash');
const config = require('config');
const koa = require('koa');
const mongoose = require('mongoose');
const co = require('co');
const bp = require('koa-bodyparser');

//components
const logger = require('./components/logger').getLogger('pomelo');

//middlewares
const httpTraceLog = require('./middlewares/http-trace-log');
const errorHandler = require('./middlewares/error-handler');
const resultFormater = require('./middlewares/result-formatter');
const passport = require('./middlewares/passport');

//static var
var pomelo = koa();

function checkConfigPath(toCheckPath) {
  for (let path of toCheckPath) {
    let value = _.get(config, path);
    if (value == undefined) throw path + ' is not found';
  }
}

function* init() {
  logger.info('init pomelo');
  if (!config)
    throw 'config is not found';

  yield init_mongo();
  yield init_server();
  yield init_auth();

  pomelo.emit('initialized');
  logger.info('init done');
}

function* init_mongo() {
  const toCheckPath = [
    'mongo.connection',
    'mongo.options'
  ];

  checkConfigPath(toCheckPath);
  
  const connection = config.mongo.connection;
  const options = config.mongo.options;

  yield mongoose.connect(connection, options);
}

function* init_server() {
  const toCheckPath = [
    'server.port'
  ];

  checkConfigPath(toCheckPath);

  require('koa-qs')(pomelo, 'strict');
  
  pomelo.use(bp());
  pomelo.use(httpTraceLog);
  pomelo.use(errorHandler);
  pomelo.use(resultFormater);
}

function* init_auth() {
  const toCheckPath = [
    'auth.url.login',
    'auth.url.success',
    'auth.url.failure',
    'auth.url.unauth',
    'auth.storage.model-name',
    'auth.storage.username-field-name',
    'auth.storage.username-field-name',
    'auth.storage.salt-field-name',
  ];

  checkConfigPath(toCheckPath);

  passport(pomelo);
}

pomelo.start = function() {
  pomelo.listen(config.server.port, function() {
    logger.info('pomelo is started at ' + config.server.port);
  });
};

pomelo.init = function() {
  co(init);
}

pomelo.register = function(name, obj) {
  pomelo[name] = obj;
}

exports = module.exports = pomelo;