'use strict'
const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const klawSync = require('../klaw-sync.js')

describe('klaw-sync', () => {
  const TEST_DIR = path.join(os.tmpdir(), 'klaw-sync')
  const dirnames = ['dir1', 'dir2', 'dir2/dir2_1', 'dir2/dir2_1/dir2_1_1']
  const filenames = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1']
  let DIRS
  let FILES

  beforeEach(() => {
    fs.emptyDirSync(TEST_DIR)
    DIRS = dirnames.map(dir => path.join(TEST_DIR, dir))
    FILES = filenames.map(f => path.join(TEST_DIR, f))
    DIRS.forEach(dir => fs.ensureDirSync(dir))
    FILES.forEach(f => fs.ensureFileSync(f))
  })

  afterEach(() => fs.removeSync(TEST_DIR))

  it('should return an error if the source dir does not exist', () => {
    try {
      klawSync('dirDoesNotExist/')
    } catch (err) {
      assert.equal(err.code, 'ENOENT')
    }
  })

  it('should return an error if the source is not a dir', () => {
    try {
      klawSync(FILES[0])
    } catch (err) {
      assert.equal(err.code, 'ENOTDIR')
    }
  })

  it('should return all items of a dir containing path and stats object', () => {
    const paths = [
      {path: DIRS[0], stats: fs.statSync(DIRS[0])},
      {path: FILES[0], stats: fs.statSync(FILES[0])},
      {path: DIRS[1], stats: fs.statSync(DIRS[1])},
      {path: DIRS[2], stats: fs.statSync(DIRS[2])},
      {path: DIRS[3], stats: fs.statSync(DIRS[3])},
      {path: FILES[1], stats: fs.statSync(FILES[1])},
      {path: FILES[2], stats: fs.statSync(FILES[2])}
    ]
    const items = klawSync(TEST_DIR)
    assert.equal(items.length, paths.length)
    items.forEach((p, i) => {
      assert.deepEqual(p, paths[i])
      assert.strictEqual(p.path, paths[i].path)
      assert.deepEqual(p.stats, paths[i].stats)
    })
  })

  it('should return only files if opts.nodir is true', () => {
    const filesOnly = [
      {path: FILES[0], stats: fs.lstatSync(FILES[0])},
      {path: FILES[1], stats: fs.lstatSync(FILES[1])},
      {path: FILES[2], stats: fs.lstatSync(FILES[2])}
    ]
    const files = klawSync(TEST_DIR, {nodir: true})
    assert.equal(files.length, filesOnly.length)
    files.forEach((f, i) => {
      assert.deepEqual(f, filesOnly[i])
      assert.strictEqual(f.path, filesOnly[i].path)
      assert.deepEqual(f.stats, filesOnly[i].stats)
    })
  })

  it('should return only dirs if opts.nofile is true', () => {
    const dirsOnly = [
      {path: DIRS[0], stats: fs.lstatSync(DIRS[0])},
      {path: DIRS[1], stats: fs.lstatSync(DIRS[1])},
      {path: DIRS[2], stats: fs.lstatSync(DIRS[2])},
      {path: DIRS[3], stats: fs.lstatSync(DIRS[3])}
    ]
    const dirs = klawSync(TEST_DIR, {nofile: true})
    assert.equal(dirs.length, dirsOnly.length)
    dirs.forEach((dir, i) => {
      assert.deepEqual(dir, dirsOnly[i])
      assert.strictEqual(dir.path, dirsOnly[i].path)
      assert.deepEqual(dir.stats, dirsOnly[i].stats)
    })
  })

  describe('when opts.filter is true', () => {
    it('should filter based on path', () => {
      const f1 = path.join(TEST_DIR, 'dir1', 'foo.js')
      const f2 = path.join(TEST_DIR, 'dir2', 'dir2_1', 'bar.js')
      fs.ensureFileSync(f1)
      fs.ensureFileSync(f2)
      const paths = [
        {path: f1, stats: fs.statSync(f1)},
        {path: f2, stats: fs.statSync(f2)}
      ]
      const filterFunc = i => path.extname(i.path) === '.js'
      const items = klawSync(TEST_DIR, {filter: filterFunc})
      assert.equal(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepEqual(p.stats, paths[i].stats)
      })
    })

    it('should filter based on stats', () => {
      const f1 = path.join(TEST_DIR, 'dir1', 'foo.js')
      const f2 = path.join(TEST_DIR, 'dir2', 'dir2_1', 'bar.js')
      fs.outputFileSync(f1, 'test file 1 contents')
      fs.outputFileSync(f2, 'test file 2 contents')
      const paths = [
        {path: f1, stats: fs.statSync(f1)},
        {path: f2, stats: fs.statSync(f2)}
      ]
      const filterFunc = i => i.stats.isFile() && i.stats.size > 0
      const items = klawSync(TEST_DIR, {filter: filterFunc})
      assert.equal(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepEqual(p.stats, paths[i].stats)
      })
    })

    it('should filter based on both path and stats', () => {
      const f1 = path.join(TEST_DIR, 'dir1', 'foo.js')
      const f2 = path.join(TEST_DIR, 'dir2', 'dir2_1', 'bar.js')
      fs.outputFileSync(f1, 'test file 1 contents')
      fs.outputFileSync(f2, 'test file 2 contents')
      const paths = [
        {path: f1, stats: fs.statSync(f1)},
        {path: f2, stats: fs.statSync(f2)}
      ]
      const filterFunc = i => path.extname(i.path) === '.js' && i.stats.size > 0
      const items = klawSync(TEST_DIR, {filter: filterFunc})
      assert.equal(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepEqual(p.stats, paths[i].stats)
      })
    })

    it('should filter but not recurse if noRecurseOnFailedFilter is true', () => {
      const dirToIgnore1 = path.join(TEST_DIR, 'node_modules')
      const dirToIgnore2 = path.join(dirToIgnore1, 'somepkg')
      fs.ensureDirSync(dirToIgnore2)
      const paths = [
        {path: DIRS[0], stats: fs.statSync(DIRS[0])},
        {path: FILES[0], stats: fs.statSync(FILES[0])},
        {path: DIRS[1], stats: fs.statSync(DIRS[1])},
        {path: DIRS[2], stats: fs.statSync(DIRS[2])},
        {path: DIRS[3], stats: fs.statSync(DIRS[3])},
        {path: FILES[1], stats: fs.statSync(FILES[1])},
        {path: FILES[2], stats: fs.statSync(FILES[2])}
      ]
      const filterFunc = i => i.path.indexOf('node_modules') < 0
      const items = klawSync(TEST_DIR, {filter: filterFunc, noRecurseOnFailedFilter: true})
      assert.equal(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepEqual(p.stats, paths[i].stats)
      })
    })

    it('should filter when it is used to ignore items', () => {
      const dirToIgnore1 = path.join(TEST_DIR, 'node_modules')
      const dirToIgnore2 = path.join(TEST_DIR, '.git')
      fs.ensureDirSync(dirToIgnore1)
      fs.ensureDirSync(dirToIgnore2)
      const paths = [
        {path: DIRS[0], stats: fs.statSync(DIRS[0])},
        {path: FILES[0], stats: fs.statSync(FILES[0])},
        {path: DIRS[1], stats: fs.statSync(DIRS[1])},
        {path: DIRS[2], stats: fs.statSync(DIRS[2])},
        {path: DIRS[3], stats: fs.statSync(DIRS[3])},
        {path: FILES[1], stats: fs.statSync(FILES[1])},
        {path: FILES[2], stats: fs.statSync(FILES[2])}
      ]
      const filterFunc = i => i.path.indexOf('node_modules') < 0 && i.path.indexOf('.git') < 0
      const items = klawSync(TEST_DIR, {filter: filterFunc, noRecurseOnFailedFilter: true})
      assert.equal(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepEqual(p.stats, paths[i].stats)
      })
    })

    it('should filter and apply opts.nodir', () => {
      const f1 = path.join(TEST_DIR, 'dir1', 'foo.js')
      const f2 = path.join(TEST_DIR, 'dir2', 'dir2_1', 'bar.js')
      fs.outputFileSync(f1, 'test file 1 contents')
      fs.outputFileSync(f2, 'test file 2 contents')
      const paths = [
        {path: f1, stats: fs.statSync(f1)},
        {path: f2, stats: fs.statSync(f2)}
      ]
      const filterFunc = i => i.stats.size > 0
      const items = klawSync(TEST_DIR, {filter: filterFunc, nodir: true})
      assert.equal(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepEqual(p.stats, paths[i].stats)
      })
    })

    it('should filter and apply opts.nofile', () => {
      const f = path.join(TEST_DIR, 'foo.js')
      const d1 = path.join(TEST_DIR, 'foo')
      const d2 = path.join(TEST_DIR, 'foobar')
      fs.ensureFileSync(f)
      fs.ensureDirSync(d1)
      fs.ensureDirSync(d2)
      const paths = [
        {path: d1, stats: fs.statSync(d1)},
        {path: d2, stats: fs.statSync(d2)}
      ]
      const filterFunc = i => i.path.indexOf('foo') > 0
      const items = klawSync(TEST_DIR, {filter: filterFunc, nofile: true})
      assert.equal(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepEqual(p.stats, paths[i].stats)
      })
    })
  })
})
