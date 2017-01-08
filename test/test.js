'use strict'
var assert = require('assert')
var fs = require('fs-extra')
var path = require('path')

var klawSync = require('../')

var fixturesDir = path.join(__dirname, 'fixtures')

describe('klaw-sync', function () {
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
      klawSync(path.join(fixturesDir, 'dir1/file1_2'))
    } catch (err) {
      assert.equal(err.code, 'ENOTDIR')
    } finally {
      done()
    }
  })

  it('should return all items of a dir containing path and stats object', function (done) {
    var files = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1']
    files = files.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var dirs = ['dir1', 'dir2', 'dir2/dir2_1', 'dir2/dir2_1/dir2_1_1']
    dirs = dirs.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var expectedItems = [
      {path: dirs[0], stats: fs.lstatSync(dirs[0])},
      {path: files[0], stats: fs.lstatSync(files[0])},
      {path: dirs[1], stats: fs.lstatSync(dirs[1])},
      {path: dirs[2], stats: fs.lstatSync(dirs[2])},
      {path: dirs[3], stats: fs.lstatSync(dirs[3])},
      {path: files[1], stats: fs.lstatSync(files[1])},
      {path: files[2], stats: fs.lstatSync(files[2])}
    ]
    var items = klawSync(fixturesDir)
    assert.equal(items.length, expectedItems.length)
    items.forEach(function (elem, i) {
      assert.deepEqual(elem, expectedItems[i])
      assert.strictEqual(elem.path, expectedItems[i].path)
      assert.deepEqual(elem.stats, expectedItems[i].stats)
    })
    done()
  })

  it('should return only files if opts.files is true', function (done) {
    var files = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1']
    files = files.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var dirs = ['dir1', 'dir2', 'dir2/dir2_1', 'dir2/dir2_1/dir2_1_1']
    dirs = dirs.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var expectedItems = [
      {path: files[0], stats: fs.lstatSync(files[0])},
      {path: files[1], stats: fs.lstatSync(files[1])},
      {path: files[2], stats: fs.lstatSync(files[2])}
    ]
    var actualFiles = klawSync(fixturesDir, {files: true})
    assert.equal(actualFiles.length, expectedItems.length)
    actualFiles.forEach(function (elem, i) {
      assert.deepEqual(elem, expectedItems[i])
      assert.strictEqual(elem.path, expectedItems[i].path)
      assert.deepEqual(elem.stats, expectedItems[i].stats)
    })
    done()
  })

  it('should return only dirs if opts.dirs is true', function (done) {
    var files = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1']
    files = files.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var dirs = ['dir1', 'dir2', 'dir2/dir2_1', 'dir2/dir2_1/dir2_1_1']
    dirs = dirs.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var expectedItems = [
      {path: dirs[0], stats: fs.lstatSync(dirs[0])},
      {path: dirs[1], stats: fs.lstatSync(dirs[1])},
      {path: dirs[2], stats: fs.lstatSync(dirs[2])},
      {path: dirs[3], stats: fs.lstatSync(dirs[3])}
    ]
    var actualDirs = klawSync(fixturesDir, {dirs: true})
    assert.equal(actualDirs.length, expectedItems.length)
    actualDirs.forEach(function (elem, i) {
      assert.deepEqual(elem, expectedItems[i])
      assert.strictEqual(elem.path, expectedItems[i].path)
      assert.deepEqual(elem.stats, expectedItems[i].stats)
    })
    done()
  })

  it('should ignore if opts.ignore is path name', function (done) {
    var dirToIgnore = path.join(fixturesDir, 'node_modules')
    fs.ensureDirSync(dirToIgnore)
    var files = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1']
    files = files.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var dirs = ['dir1', 'dir2', 'dir2/dir2_1', 'dir2/dir2_1/dir2_1_1']
    dirs = dirs.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var expectedItems = [
      {path: dirs[0], stats: fs.lstatSync(dirs[0])},
      {path: files[0], stats: fs.lstatSync(files[0])},
      {path: dirs[1], stats: fs.lstatSync(dirs[1])},
      {path: dirs[2], stats: fs.lstatSync(dirs[2])},
      {path: dirs[3], stats: fs.lstatSync(dirs[3])},
      {path: files[1], stats: fs.lstatSync(files[1])},
      {path: files[2], stats: fs.lstatSync(files[2])}
    ]
    var items = klawSync(fixturesDir, {ignore: 'node_modules'})
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
    var dirToIgnore1 = path.join(fixturesDir, 'node_modules')
    var dirToIgnore2 = path.join(fixturesDir, '.git')
    fs.ensureDirSync(dirToIgnore1)
    fs.ensureDirSync(dirToIgnore2)
    var files = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1']
    files = files.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var dirs = ['dir1', 'dir2', 'dir2/dir2_1', 'dir2/dir2_1/dir2_1_1']
    dirs = dirs.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var expectedItems = [
      {path: dirs[0], stats: fs.lstatSync(dirs[0])},
      {path: files[0], stats: fs.lstatSync(files[0])},
      {path: dirs[1], stats: fs.lstatSync(dirs[1])},
      {path: dirs[2], stats: fs.lstatSync(dirs[2])},
      {path: dirs[3], stats: fs.lstatSync(dirs[3])},
      {path: files[1], stats: fs.lstatSync(files[1])},
      {path: files[2], stats: fs.lstatSync(files[2])}
    ]
    var items = klawSync(fixturesDir, {ignore: '{node_modules,.git}'})
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
    var dirToIgnore1 = path.join(fixturesDir, 'node_modules')
    var dirToIgnore2 = path.join(fixturesDir, '.git')
    var fileToIgnore1 = path.join(fixturesDir, 'dir1', 'somefile.md')
    var fileToIgnore2 = path.join(fixturesDir, 'dir2/dir2_1', 'someotherfile.md')
    fs.ensureDirSync(dirToIgnore1)
    fs.ensureDirSync(dirToIgnore2)
    fs.ensureFileSync(fileToIgnore1)
    fs.ensureFileSync(fileToIgnore2)
    var files = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1']
    files = files.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var dirs = ['dir1', 'dir2', 'dir2/dir2_1', 'dir2/dir2_1/dir2_1_1']
    dirs = dirs.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var expectedItems = [
      {path: dirs[0], stats: fs.lstatSync(dirs[0])},
      {path: files[0], stats: fs.lstatSync(files[0])},
      {path: dirs[1], stats: fs.lstatSync(dirs[1])},
      {path: dirs[2], stats: fs.lstatSync(dirs[2])},
      {path: dirs[3], stats: fs.lstatSync(dirs[3])},
      {path: files[1], stats: fs.lstatSync(files[1])},
      {path: files[2], stats: fs.lstatSync(files[2])}
    ]
    var items = klawSync(fixturesDir, {ignore: ['{node_modules,.git}', '*.md']})
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
