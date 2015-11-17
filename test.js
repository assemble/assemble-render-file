'use strict';

require('mocha');
require('should');
var Assemble = require('assemble-core');
var assert = require('assert');
var renderFile = require('./');
var path = require('path');
var app;

describe('app.renderFile()', function() {
  beforeEach(function () {
    app = new Assemble()
      .use(renderFile())

    app.engine('hbs', require('engine-handlebars'));
    app.engine('foo', require('engine-base'));
    app.engine('*', require('engine-base'));

    app.create('files', {engine: '*'});
    app.file('a', {content: 'this is <%= title() %>'});
    app.file('b', {content: 'this is <%= title() %>'});
    app.file('c', {content: 'this is <%= title() %>'});

    app.option('renameKey', function (key) {
      return path.basename(key, path.extname(key));
    });

    app.helper('title', function () {
      if (this.context.title) {
        return this.context.title;
      }
      var view = this.context.view;
      var key = view.key;
      var ctx = this.context[key];
      if (ctx && ctx.title) return ctx.title;
      return key;
    });
  });

  it('should render views from src', function (done) {
    var stream = app.src(path.join(__dirname, 'fixtures/*.hbs'));
    var files = [];

    stream.pipe(app.renderFile())
      .on('error', done)
      .on('data', function (file) {
        files.push(file);
      })
      .on('end', function () {
        assert.equal(files[0].basename, 'a.hbs');
        assert.equal(files[1].basename, 'b.hbs');
        assert.equal(files[2].basename, 'c.hbs');
        done();
      });
  });

  it('should render views with the engine that matches the file extension', function (done) {
    var stream = app.src(path.join(__dirname, 'fixtures/*.hbs'));
    var files = [];

    stream.pipe(app.renderFile())
      .on('error', done)
      .on('data', function (file) {
        files.push(file);
      })
      .on('end', function () {
        assert(/<h1>a<\/h1>/.test(files[0].content));
        assert(/<h1>b<\/h1>/.test(files[1].content));
        assert(/<h1>c<\/h1>/.test(files[2].content));
        done();
      });
  });

  it('should render views from src with the engine passed on the opts', function (done) {
    var stream = app.src(path.join(__dirname, 'fixtures/*.hbs'));
    var files = [];

    stream.pipe(app.renderFile({engine: '*'}))
      .on('error', done)
      .on('data', function (file) {
        files.push(file);
      })
      .on('end', function () {
        assert(/<h2>a<\/h2>/.test(files[0].content));
        assert(/<h2>b<\/h2>/.test(files[1].content));
        assert(/<h2>c<\/h2>/.test(files[2].content));
        done();
      });
  });

  it('should use the context passed on the opts', function (done) {
    var stream = app.src(path.join(__dirname, 'fixtures/*.hbs'));
    var files = [];

    stream.pipe(app.renderFile({a: {title: 'foo'}}))
      .on('error', done)
      .on('data', function (file) {
        files.push(file);
      })
      .on('end', function () {
        assert(/<h1>foo<\/h1>/.test(files[0].content));
        assert(/<h1>b<\/h1>/.test(files[1].content));
        assert(/<h1>c<\/h1>/.test(files[2].content));
        done();
      });
  });

  it('should render the files in a collection', function (cb) {
    var files = [];
    app.toStream('files')
      .pipe(app.renderFile())
      .on('error', cb)
      .on('data', function (file) {
        assert(file);
        assert(file.path);
        assert(file.contents);
        files.push(file);
      })
      .on('end', function () {
        assert(/this is a/.test(files[0].content));
        assert(/this is b/.test(files[1].content));
        assert(/this is c/.test(files[2].content));
        assert.equal(files.length, 3);
        cb();
      });
  });

  it('should handle engine errors', function (cb) {
    var files = [];
    app.create('notdefined', {engine: '*'});
    app.notdefined('foo', {content: '<%= bar %>'})
    app.toStream('notdefined')
      .pipe(app.renderFile())
      .on('error', function (err) {
        assert.equal(typeof err, 'object');
        assert.equal(err.message, 'bar is not defined');
        cb();
      })
      .on('end', function () {
        cb(new Error('expected renderFile to handle the error.'));
      });
  });
});

describe('app.renderFile()', function() {
  beforeEach(function () {
    app = new Assemble()
      .use(renderFile())

    var hbs = require('engine-handlebars');
    hbs.Handlebars.helpers = {};

    app.engine('hbs', hbs);
    app.engine('foo', require('engine-base'));

    app.data({title: 'foo'});
  });

  it('should render views with the engine specified on arguments', function (done) {
    var stream = app.src(path.join(__dirname, 'fixtures/engines/*.hbs'));
    var files = [];

    stream.pipe(app.renderFile('foo'))
      .on('error', done)
      .on('data', function (file) {
        // console.log(file.content);
        files.push(file);
      })
      .on('end', function () {
        assert(/<h2>foo<\/h2>/.test(files[0].content));
        assert(/<h2>foo<\/h2>/.test(files[1].content));
        assert(/<h2>foo<\/h2>/.test(files[2].content));
        done();
      });
  });

  it('should render views with multiple calls to renderFile', function (done) {
    var stream = app.src(path.join(__dirname, 'fixtures/engines/*.hbs'));
    var files = [];

    stream
      .pipe(app.renderFile('foo'))
      .pipe(app.renderFile('hbs'))
      .on('error', done)
      .on('data', function (file) {
        // console.log(file.content)
        files.push(file);
      })
      .on('end', function () {
        assert(/<h1>foo<\/h1>/.test(files[0].content));
        assert(/<h1>foo<\/h1>/.test(files[1].content));
        assert(/<h1>foo<\/h1>/.test(files[2].content));

        assert(/<h2>foo<\/h2>/.test(files[0].content));
        assert(/<h2>foo<\/h2>/.test(files[1].content));
        assert(/<h2>foo<\/h2>/.test(files[2].content));
        done();
      });
  });

  it('should render views with multiple calls to renderFile and locals', function (done) {

    var stream = app.src(path.join(__dirname, 'fixtures/engines/a.hbs'));
    var files = [];
    // console.log(app._.helpers)

    stream
      .pipe(app.renderFile('foo', {title: 'foo'}))
      .on('error', done)
      .pipe(app.renderFile('hbs', {title: 'bar'}))
      .on('error', done)
      .on('data', function (file) {
        files.push(file);
      })
      .on('end', function () {
        assert(/<h1>bar<\/h1>/.test(files[0].content));
        assert(/<h2>foo<\/h2>/.test(files[0].content));
        done();
      });
  });
});

