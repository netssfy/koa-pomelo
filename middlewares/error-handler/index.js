'use strict';

const _ = require('lodash');
const logger = require('winston').getLogger('middleware/error-handler');


exports = module.exports = function* (next) {
  try {
    yield next;
  } catch (err) {
    logger.error(err);

    this.body = {
      ok: false,
      error: _.isString(err) ? err : JSON.stringify(err)
    };
  }
};