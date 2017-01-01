'use strict';

//libs
const _ = require('lodash');
const config = require('config');
const koa = require('koa');
const mongoose = require('mongoose');
const co = require('co');
const bp = require('koa-better-body');

//components
const logger = require('./components/logger').getLogger('pomelo');

//middlewares
const httpTraceLog = require('./middlewares/http-trace-log');
const errorHandler = require('./middlewares/error-handler');
const resultFormater = require('./middlewares/result-formatter');

//static var
var pomelo = koa();
var configPath = null;

function* init() {
  logger.info('init pomelo');
  if (!config)
    throw 'config is not found';

  yield init_mongo();
  yield init_server();

  pomelo.emit('initialized');
  logger.info('init done');
}

function* init_mongo() {
  configPath = 'mongo.connection';
  if (!getConfig())
    throw pathNotFound();
  
  let connection = config.mongo.connection;

  configPath = 'mongo.options';
  let options = getConfig();
  if (!options) {
    logger.warn(pathNotFound());
  }

  yield mongoose.connect(connection, options);
}

function* init_server() {
  configPath = 'app.port';
  if (!getConfig())
    throw pathNotFound();

  require('koa-qs')(pomelo, 'strict');
  pomelo.use(bp());

  pomelo.use(httpTraceLog);
  pomelo.use(errorHandler);
  pomelo.use(resultFormater);

  pomelo.start = function() {
    pomelo.listen(config.app.port, function() {
      logger.info('pomelo is started at ' + config.app.port);
    });
  };
}

function pathNotFound() {
  return configPath + ' is not found';
}

function getConfig() {
  return _.get(config, configPath);
}

co(init);

exports = module.exports = pomelo;