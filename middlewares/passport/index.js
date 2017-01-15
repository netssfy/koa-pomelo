'use strict';

const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const Router = require('koa-router');
const logger = require('winston').getLogger('middleware/passport');
const session = require('koa-generic-session');
const config = require('config');
const co = require('co');
const _ = require('lodash');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path_to_regex = require('path-to-regexp');

const loginUrl = config.auth.url.login;
const unauthToUrl = config.auth.url.unauth;
const successRedirect = config.auth.url.success;
const failureRedirect = config.auth.url.failure;

const modelName = _.get(config, 'auth.storage.model-name');
const usernameFieldName = _.get(config, 'auth.storage.username-field-name');
const passwordFieldName = _.get(config, 'auth.storage.password-field-name');
const saltFieldName = _.get(config, 'auth.storage.salt-field-name');

exports = module.exports = function(pomelo, auth) {
  passport.serializeUser(function(user, done) {
    done(null ,user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(new LocalStrategy(function(username, password, done) {
    co(function* () {
      logger.info(`${username} try to login`);
      //get model
      let authModel = mongoose.model(modelName);
      let user = yield authModel.findOne({ [usernameFieldName]: username});
      if (!user) {
        logger.warn(`${username} is not found`);
        return done(null, false);
      }
      //get salt and use salt and param to gen the password
      if (_.isEmpty(password)) {
        logger.error(`${username} password is empty`);
        return done(null, false);
      }
      let salt = user[saltFieldName];
      let saltedPwd = password + salt;
      let encryptedPwd = crypto.createHash('sha256').update(saltedPwd).digest('hex');
      if (user.password == encryptedPwd) {
        user = user.toObject();
        delete user.password;
        return done(null, user);
      } else {
        logger.warn(`${username} password is not correct`);
        return done(null, false);
      }
    }, username, password);
  }));

  const router = new Router();
  router.all('*', function* (next) {
    if (this.isAuthenticated()) {
      yield next;
    } else if (this.request.path == loginUrl) {
      yield passport.authenticate('local', {
        successRedirect,
        failureRedirect
      });
    } else if (this.request.path == failureRedirect) {
      yield next;
    } else if (pass_through(this.request.path)) {
      yield next;
    } else {
      this.redirect(loginUrl);
    }
  });

  pomelo.keys = ['pomelo'];
  pomelo.use(session());
  pomelo.use(passport.initialize());
  pomelo.use(passport.session());

  pomelo.use(router.routes());
};

function pass_through(path) {
  let list = _.get(config, 'auth.pass-through') || [];
  for (let define of list) {
    let regex = path_to_regex(define);
    if (regex.test(path))
      return true;
  }

  return false;
}