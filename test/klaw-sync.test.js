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
      assert.strictEqual(err.code, 'ENOENT')
    }
  })

  it('should return an error if the source is not a dir', () => {
    try {
      klawSync(FILES[0])
    } catch (err) {
      assert.strictEqual(err.code, 'ENOTDIR')
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
    assert.strictEqual(items.length, paths.length)
    items.forEach((p, i) => {
      assert.deepStrictEqual(p, paths[i])
      assert.strictEqual(p.path, paths[i].path)
      assert.deepStrictEqual(p.stats, paths[i].stats)
    })
  })

  it('should return only files if opts.nodir is true', () => {
    const filesOnly = [
      {path: FILES[0], stats: fs.lstatSync(FILES[0])},
      {path: FILES[1], stats: fs.lstatSync(FILES[1])},
      {path: FILES[2], stats: fs.lstatSync(FILES[2])}
    ]
    const files = klawSync(TEST_DIR, {nodir: true})
    assert.strictEqual(files.length, filesOnly.length)
    files.forEach((f, i) => {
      assert.deepStrictEqual(f, filesOnly[i])
      assert.strictEqual(f.path, filesOnly[i].path)
      assert.deepStrictEqual(f.stats, filesOnly[i].stats)
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
    assert.strictEqual(dirs.length, dirsOnly.length)
    dirs.forEach((dir, i) => {
      assert.deepStrictEqual(dir, dirsOnly[i])
      assert.strictEqual(dir.path, dirsOnly[i].path)
      assert.deepStrictEqual(dir.stats, dirsOnly[i].stats)
    })
  })

  describe('when opts.filter is true', () => {
    it('should filter based on path', () => {
      const f1 = path.join(TEST_DIR, 'foo.js')
      const f2 = path.join(TEST_DIR, 'bar.js')
      fs.ensureFileSync(f1)
      fs.ensureFileSync(f2)
      const paths = [{path: f1, stats: fs.statSync(f1)}]
      const filterFunc = i => path.basename(i.path).indexOf('foo') > -1
      const items = klawSync(TEST_DIR, {filter: filterFunc})
      assert.strictEqual(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepStrictEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepStrictEqual(p.stats, paths[i].stats)
      })
    })

    it('should filter based on stats', () => {
      const f1 = path.join(TEST_DIR, 'bar.js')
      const f2 = path.join(TEST_DIR, 'foo.js')
      fs.outputFileSync(f1, 'test file 1 contents')
      fs.outputFileSync(f2, 'test file 2 contents')
      const paths = [
        {path: f1, stats: fs.statSync(f1)},
        {path: f2, stats: fs.statSync(f2)}
      ]
      const filterFunc = i => i.path === TEST_DIR || (i.stats.isFile() && i.stats.size > 0)
      const items = klawSync(TEST_DIR, {filter: filterFunc})
      items.sort()
      assert.strictEqual(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepStrictEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepStrictEqual(p.stats, paths[i].stats)
      })
    })

    it('should filter based on both path and stats', () => {
      const f1 = path.join(TEST_DIR, 'foo.js')
      const f2 = path.join(TEST_DIR, 'bar.js')
      fs.outputFileSync(f1, 'test file 1 contents')
      fs.outputFileSync(f2, 'test file 2 contents')
      const paths = [{path: f1, stats: fs.statSync(f1)}]
      const filterFunc = i => i.path === TEST_DIR || (path.basename(i.path).indexOf('foo') > -1 && i.stats.isFile() && i.stats.size > 0)
      const items = klawSync(TEST_DIR, {filter: filterFunc})
      assert.strictEqual(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepStrictEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepStrictEqual(p.stats, paths[i].stats)
      })
    })

    it('should ignore hidden directories', () => {
      const dir1 = path.join(TEST_DIR, '.dir1')
      const dir2 = path.join(TEST_DIR, '.dir2')
      fs.ensureDirSync(dir1)
      fs.ensureDirSync(dir2)
      const filterFunc = i => path.basename(i.path) === '.' || path.basename(i.path)[0] !== '.'
      const items = klawSync(TEST_DIR, {filter: filterFunc})
      assert(items.length > 0)
      items.forEach(p => {
        assert(p.path !== dir1)
        assert(p.path !== dir2)
      })
    })

    it('should filter and apply opts.nodir', () => {
      const f1 = path.join(TEST_DIR, 'bar.js')
      const f2 = path.join(TEST_DIR, 'foo.js')
      fs.outputFileSync(f1, 'test file 1 contents')
      fs.outputFileSync(f2, 'test file 2 contents')
      const paths = [
        {path: f1, stats: fs.statSync(f1)},
        {path: f2, stats: fs.statSync(f2)}
      ]
      const filterFunc = i => i.path === TEST_DIR || (i.stats.isFile() && i.stats.size > 0)
      const items = klawSync(TEST_DIR, {filter: filterFunc, nodir: true})
      items.sort()
      assert.strictEqual(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepStrictEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepStrictEqual(p.stats, paths[i].stats)
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
      assert.strictEqual(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepStrictEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepStrictEqual(p.stats, paths[i].stats)
      })
    })
  })

  describe('depth limit', () => {
    beforeEach(() => {
      fs.emptyDirSync(TEST_DIR)
    })
    it('should honor depthLimit option -1', () => {
      const expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i',
        'h/i/j', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg']
      testDepthLimit(-1, expected)
    })

    it('should honor depthLimit option 0', () => {
      const expected = ['a', 'h']
      testDepthLimit(0, expected)
    })

    it('should honor depthLimit option 1', () => {
      const expected = ['a', 'a/b', 'a/e.jpg', 'h', 'h/i']
      testDepthLimit(1, expected)
    })

    it('should honor depthLimit option 2', () => {
      const expected = ['a', 'a/b', 'a/b/c', 'a/e.jpg', 'h', 'h/i', 'h/i/j',
        'h/i/l.txt', 'h/i/m.jpg']
      testDepthLimit(2, expected)
    })

    it('should honor depthLimit option 3', () => {
      const expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i',
        'h/i/j', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg']
      testDepthLimit(3, expected)
    })

    function testDepthLimit (depthLimit, expected) {
      const fixtures = [
        'a/b/c/d.txt',
        'a/e.jpg',
        'h/i/j/k.txt',
        'h/i/l.txt',
        'h/i/m.jpg'
      ]
      fixtures.forEach(f => {
        f = path.join(TEST_DIR, f)
        fs.outputFileSync(f, path.basename(f, path.extname(f)))
      })

      const items = klawSync(TEST_DIR, {depthLimit: depthLimit}).map(i => i.path)
      items.sort()
      expected = expected.map(item => path.join(path.join(TEST_DIR, item)))
      assert.deepStrictEqual(items, expected)
    }
  })
})
