/*!
 * assemble-render-file <https://github.com/jonschlinkert/assemble-render-file>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

/**
 * Render a vinyl file.
 *
 * ```js
 * app.src('*.hbs')
 *   .pipe(app.renderFile());
 * ```
 *
 * @name .renderFile
 * @param  {Object} `locals` Optional locals to pass to the template engine for rendering.
 * @return {Object}
 * @api public
 */

module.exports = function(config) {
  return function plugin(app) {
    if (!isValidInstance(this)) return;
    var opts = utils.merge({}, this.options, config);
    var debug = utils.debug;

    this.define('renderFile', function(engine, locals) {
      if (typeof engine !== 'string') {
        locals = engine;
        engine = null;
      }

      debug('renderFile: engine "%s"', engine);

      locals = locals || {};
      var collection = {};

      if (locals && !locals.isCollection) {
        opts = utils.merge({}, opts, locals);
      } else {
        collection = locals;
        locals = {};
      }

      var View = opts.View || opts.File || collection.View || this.View;

      return utils.through.obj(function(file, enc, next) {
        if (file.isNull()) {
          return next(null, file);
        }

        if (!file.isView) file = new View(file);

        // run `onLoad` middleware
        app.handleOnce('onLoad', file, function(err, view) {
          if (err) return next(err);

          debug('renderFile, preRender: %s', view.relative);

          resolveEngine(app, locals, engine);
          if (!locals.engine && app.isFalse('engineStrict')) {
            next(null, view);
            return;
          }

          // render the view
          app.render(view, locals, function(err, res) {
            if (err) {
              err.view = view;
              next(err);
              return;
            }

            debug('renderFile, postRender: %s', view.relative);
            next(null, res);
          });
        });
      });
    });

    return plugin;
  };
};

function resolveEngine(app, locals, engine) {
  if (typeof engine === 'string') {
    locals.engine = engine;
    return;
  }
  if (locals.engine) {
    return;
  }
  // allow a `noop` engine to be defined
  if (app.engines['.noop']) {
    locals.engine = '.noop';
  }
}

function isValidInstance(app) {
  if (app.isView || app.isItem) {
    return false;
  }
  if (app.isRegistered('assemble-render-file')) {
    return false;
  }
  return true;
}
