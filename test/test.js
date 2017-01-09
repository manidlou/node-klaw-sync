'use strict'
var assert = require('assert')
var os = require('os')
var path = require('path')
var fs = require('fs-extra')

var klawSync = require('../')

describe('klaw-sync', function () {

  var TEST_DIR
  var FIXTURES_DIR
  var DIRS
  var FILES
  var dirnames = ['dir1', 'dir2', 'dir2/dir2_1', 'dir2/dir2_1/dir2_1_1']
  var filenames = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1']

  beforeEach(function () {
    TEST_DIR = path.join(os.tmpdir(), 'klaw-sync')
    FIXTURES_DIR = path.join(TEST_DIR, 'fixtures')
    fs.emptyDirSync(TEST_DIR)
    DIRS = dirnames.map(function (dir) {
      return path.join(FIXTURES_DIR, dir)
    })
    FILES = filenames.map(function (f) {
      return path.join(FIXTURES_DIR, f)
    })
    DIRS.forEach(function (dir) {
      fs.ensureDirSync(dir)
    })
    FILES.forEach(function (f) {
      fs.ensureFileSync(f)
    })
  })

  afterEach(function (done) {
    fs.removeSync(TEST_DIR)
    done()
  })

  it('should return an error if the source dir does not exist', function (done) {
    try {
      klawSync('dirDoesNotExist/')
    } catch (err) {
      assert.equal(err.code, 'ENOENT')
    } finally {
      done()
    }
  })

  it('should return an error if the source is not a dir', function (done) {
    try {
      klawSync(FILES[0])
    } catch (err) {
      assert.equal(err.code, 'ENOTDIR')
    } finally {
      done()
    }
  })

  it('should return all items of a dir containing path and stats object', function (done) {
    var expectedItems = [
      {path: DIRS[0], stats: fs.lstatSync(DIRS[0])},
      {path: FILES[0], stats: fs.lstatSync(FILES[0])},
      {path: DIRS[1], stats: fs.lstatSync(DIRS[1])},
      {path: DIRS[2], stats: fs.lstatSync(DIRS [2])},
      {path: DIRS[3], stats: fs.lstatSync(DIRS[3])},
      {path: FILES[1], stats: fs.lstatSync(FILES[1])},
      {path: FILES[2], stats: fs.lstatSync(FILES[2])}
    ]
    var items = klawSync(FIXTURES_DIR)
    assert.equal(items.length, expectedItems.length)
    items.forEach(function (elem, i) {
      assert.deepEqual(elem, expectedItems[i])
      assert.strictEqual(elem.path, expectedItems[i].path)
      assert.deepEqual(elem.stats, expectedItems[i].stats)
    })
    done()
  })

  it('should return only files if opts.nodir is true', function (done) {
    var expectedItems = [
      {path: FILES[0], stats: fs.lstatSync(FILES[0])},
      {path: FILES[1], stats: fs.lstatSync(FILES[1])},
      {path: FILES[2], stats: fs.lstatSync(FILES[2])}
    ]
    var actualFiles = klawSync(FIXTURES_DIR, {nodir: true})
    assert.equal(actualFiles.length, expectedItems.length)
    actualFiles.forEach(function (elem, i) {
      assert.deepEqual(elem, expectedItems[i])
      assert.strictEqual(elem.path, expectedItems[i].path)
      assert.deepEqual(elem.stats, expectedItems[i].stats)
    })
    done()
  })

  it('should return only dirs if opts.nofile is true', function (done) {
    var expectedItems = [
      {path: DIRS[0], stats: fs.lstatSync(DIRS[0])},
      {path: DIRS[1], stats: fs.lstatSync(DIRS[1])},
      {path: DIRS[2], stats: fs.lstatSync(DIRS[2])},
      {path: DIRS[3], stats: fs.lstatSync(DIRS[3])}
    ]
    var actualDirs = klawSync(FIXTURES_DIR, {nofile: true})
    assert.equal(actualDirs.length, expectedItems.length)
    actualDirs.forEach(function (elem, i) {
      assert.deepEqual(elem, expectedItems[i])
      assert.strictEqual(elem.path, expectedItems[i].path)
      assert.deepEqual(elem.stats, expectedItems[i].stats)
    })
    done()
  })

  it('should ignore if opts.ignore is path name', function (done) {
    var dirToIgnore = path.join(FIXTURES_DIR, 'node_modules')
    fs.ensureDirSync(dirToIgnore)
    var expectedItems = [
      {path: DIRS[0], stats: fs.lstatSync(DIRS[0])},
      {path: FILES[0], stats: fs.lstatSync(FILES[0])},
      {path: DIRS[1], stats: fs.lstatSync(DIRS[1])},
      {path: DIRS[2], stats: fs.lstatSync(DIRS [2])},
      {path: DIRS[3], stats: fs.lstatSync(DIRS[3])},
      {path: FILES[1], stats: fs.lstatSync(FILES[1])},
      {path: FILES[2], stats: fs.lstatSync(FILES[2])}
    ]
    var items = klawSync(FIXTURES_DIR, {ignore: 'node_modules'})
    assert.equal(items.length, expectedItems.length)
    items.forEach(function (elem, i) {
      assert.deepEqual(elem, expectedItems[i])
      assert.strictEqual(elem.path, expectedItems[i].path)
      assert.deepEqual(elem.stats, expectedItems[i].stats)
    })
    fs.removeSync(dirToIgnore)
    done()
  })

  it('should ignore if opts.ignore is minimatch pattern', function (done) {
    var dirToIgnore1 = path.join(FIXTURES_DIR, 'node_modules')
    var dirToIgnore2 = path.join(FIXTURES_DIR, '.git')
    fs.ensureDirSync(dirToIgnore1)
    fs.ensureDirSync(dirToIgnore2)
    var expectedItems = [
      {path: DIRS[0], stats: fs.lstatSync(DIRS[0])},
      {path: FILES[0], stats: fs.lstatSync(FILES[0])},
      {path: DIRS[1], stats: fs.lstatSync(DIRS[1])},
      {path: DIRS[2], stats: fs.lstatSync(DIRS [2])},
      {path: DIRS[3], stats: fs.lstatSync(DIRS[3])},
      {path: FILES[1], stats: fs.lstatSync(FILES[1])},
      {path: FILES[2], stats: fs.lstatSync(FILES[2])}
    ]
    var items = klawSync(FIXTURES_DIR, {ignore: '{node_modules,.git}'})
    assert.equal(items.length, expectedItems.length)
    items.forEach(function (elem, i) {
      assert.deepEqual(elem, expectedItems[i])
      assert.strictEqual(elem.path, expectedItems[i].path)
      assert.deepEqual(elem.stats, expectedItems[i].stats)
    })
    fs.removeSync(dirToIgnore1)
    fs.removeSync(dirToIgnore2)
    done()
  })

  it('should ignore if opts.ignore is array', function (done) {
    var dirToIgnore1 = path.join(FIXTURES_DIR, 'node_modules')
    var dirToIgnore2 = path.join(FIXTURES_DIR, '.git')
    var fileToIgnore1 = path.join(FIXTURES_DIR, 'dir1', 'somefile.md')
    var fileToIgnore2 = path.join(FIXTURES_DIR, 'dir2/dir2_1', 'someotherfile.md')
    fs.ensureDirSync(dirToIgnore1)
    fs.ensureDirSync(dirToIgnore2)
    fs.ensureFileSync(fileToIgnore1)
    fs.ensureFileSync(fileToIgnore2)
    var expectedItems = [
      {path: DIRS[0], stats: fs.lstatSync(DIRS[0])},
      {path: FILES[0], stats: fs.lstatSync(FILES[0])},
      {path: DIRS[1], stats: fs.lstatSync(DIRS[1])},
      {path: DIRS[2], stats: fs.lstatSync(DIRS [2])},
      {path: DIRS[3], stats: fs.lstatSync(DIRS[3])},
      {path: FILES[1], stats: fs.lstatSync(FILES[1])},
      {path: FILES[2], stats: fs.lstatSync(FILES[2])}
    ]
    var items = klawSync(FIXTURES_DIR, {ignore: ['{node_modules,.git}', '*.md']})
    assert.equal(items.length, expectedItems.length)
    items.forEach(function (elem, i) {
      assert.deepEqual(elem, expectedItems[i])
      assert.strictEqual(elem.path, expectedItems[i].path)
      assert.deepEqual(elem.stats, expectedItems[i].stats)
    })
    fs.removeSync(dirToIgnore1)
    fs.removeSync(dirToIgnore2)
    fs.removeSync(fileToIgnore1)
    fs.removeSync(fileToIgnore2)
    done()
  })
})
