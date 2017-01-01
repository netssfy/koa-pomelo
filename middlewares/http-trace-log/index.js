'use strict';
const logger = require('winston').getLogger('middleware/http-trace-log');

exports = module.exports = function* (next) {
  const start = new Date();
  logger.info(`[${start.format()}] -> [enter][${this.request.method}]:[${this.request.originalUrl}]`);
  
  yield next;

  const end = new Date();
  logger.info(`[${end.format()}] -> [exit][${this.request.method}]:[${this.request.originalUrl}] -> [${this.response.status}][${end - start}ms]`);
}

Date.prototype.format = function() {
  return `${this.getFullYear()}-${this.getMonth() + 1}-${this.getDate()} ${this.getHours()}:${this.getMinutes()}:${this.getSeconds()}.${this.getMilliseconds()}`;
}