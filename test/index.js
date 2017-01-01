'use strict';

const Router = require('koa-router');

const pomelo = require('../index');

pomelo.on('initialized', function() {
  var router = Router();
  router.get('/', function* () {
    this.body = 'hello pomelo';
  });

  router.get('/bad', function* () {
    throw 'bad pomelo';
  });

  pomelo.use(router.routes());

  pomelo.start();
});
