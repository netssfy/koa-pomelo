'use strict';

const winston = require('winston');
const config = require('config');
const path = require('path');
const fs = require('fs');
const process = require('process');
require('winston-daily-rotate-file');

const rootDir = process.cwd();
const logPath = path.join(rootDir, 'logs');
const logger = getLogger('components/logger');

function init() {
  logger.info('init logger');
  if (!fs.existsSync(logPath)) {
    logger.info('creating logger folder at ' + logPath);
    fs.mkdirSync(logPath);
    logger.info('logger folder has been created');
  }
  //hook on winston
  winston.getLogger = getLogger;
  logger.info('init done');
}

init();

function getLogger(label) {
  const transports = [new winston.transports.DailyRotateFile({
    filename: 'log',
    dirname: logPath,
    datePattern: 'yyyy-MM-dd-HH.',
    prepend: true,
    label: label
  })];

  if (process.env.NODE_ENV !== 'production') {
    transports.push(new winston.transports.Console({
      colorize: true,
      label: label
    }));
  }

  return winston.loggers.add(label, { transports });
}

exports = module.exports = winston;