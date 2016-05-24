'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Utils
 */

require('is-registered');
require('is-valid-instance');
require('mixin-deep', 'merge');
require('through2', 'through');
require = fn;

utils.debug = require('debug')('base:assemble:render-file');

utils.isValid = function(app) {
  if (!utils.isValidInstance(app, ['app', 'views', 'collection'])) {
    return false;
  }
  if (utils.isRegistered(app, 'assemble-render-file')) {
    return false;
  }
  return true;
};

/**
 * Expose `utils`
 */

module.exports = utils;
