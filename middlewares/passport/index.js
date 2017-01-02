'use strict';

const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const Router = require('koa-router');
const logger = require('winston').getLogger('middleware/passport');
const session = require('koa-generic-session');

passport.serializeUser(function(user, done) {
  done(null ,user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(function(username, password, done) {
  console.log(username);
  console.log(passport);
  done(null, user);
}));

const router = new Router();
router.all('*', function* (next) {
  logger.verbose(this.request.originUrl);
  if (this.isAuthenticated()) {
    yield next;
  } else {
    throw 'not authenticated';
  }
});

exports = module.exports = function(pomelo) {
  pomelo.keys = ['pomelo'];
  pomelo.use(session());
  pomelo.use(passport.initialize());
  pomelo.use(passport.session());

  pomelo.use(router.routes());
}