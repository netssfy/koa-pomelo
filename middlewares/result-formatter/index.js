'use strict';

const logger = require('winston').getLogger('middleware/result-formatter');

exports = module.exports = function* (next) {
  yield next;
  if (!this.body) {
    logger.error('body is not specified');
    return this.status = 404;
  }

  this.body = {
    ok: true,
    data: this.body
  };
}