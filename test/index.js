'use strict';

const Router = require('koa-router');
const mongoose = require('mongoose');
const pomelo = require('../index');

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  salt: String
});

const userModel = mongoose.model('User', userSchema);

pomelo.init();

pomelo.on('initialized', function() {
  //mock data
  userModel.remove({}, function(err) {
    if (!err) {
        userModel.create({
          name: 'test',
          salt: 'thisissalt',
          password: '7239e3b2d4ba17f963020b7f594157593861b2dca6c6fc1bf805e0f065d4a14e'//test
        });
    }
  });

  var router = Router();
  router.get('/', function* () {
    this.body = 'hello pomelo';
  });

  router.all('/login', function* () {
    this.body = 'hello login';
  });

  router.get('/success', function* () {
    this.body = 'login success';
  });

  router.get('/failure', function* () {
    this.body = 'login failure';
  });

  router.get('/bad', function* () {
    throw 'bad pomelo';
  });

  router.get('/www/static/:name', function* () {
    this.body = 'hello static ' + this.params.name;
  });

  pomelo.use(router.routes());

  pomelo.start();
});
