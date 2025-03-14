'use strict'
const assert = require('assert')
const path = require('path')
const klawSync = require('../klaw-sync.js')
const { fs: memfs, vol } = require('memfs')

const TEST_DIR = path.join(__dirname, 'klaw-sync-test-custom-fs')
after(() => vol.reset())

describe('klaw-sync / custom fs', () => {
  const dirnames = ['dir1', 'dir2', 'dir2/dir2_1', 'dir2/dir2_1/dir2_1_1']
  const filenames = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1']
  let DIRS, FILES

  beforeEach(() => {
    vol.reset()
    // Create directories first
    dirnames.forEach((dir) => {
      const fullPath = path.join(TEST_DIR, dir)
      memfs.mkdirSync(fullPath, { recursive: true })
    })
    // Create files
    filenames.forEach((f, i) => {
      const fullPath = path.join(TEST_DIR, f)
      memfs.writeFileSync(fullPath, i.toString())
    })
    DIRS = dirnames.map((dir) => path.join(TEST_DIR, dir))
    FILES = filenames.map((f) => path.join(TEST_DIR, f))
  })

  it('should return all items of a dir containing path and stats object', () => {
    const items = klawSync(TEST_DIR, { fs: memfs })
    const paths = [
      { path: DIRS[0], stats: memfs.lstatSync(DIRS[0]) },
      { path: FILES[0], stats: memfs.lstatSync(FILES[0]) },
      { path: DIRS[1], stats: memfs.lstatSync(DIRS[1]) },
      { path: DIRS[2], stats: memfs.lstatSync(DIRS[2]) },
      { path: DIRS[3], stats: memfs.lstatSync(DIRS[3]) },
      { path: FILES[1], stats: memfs.lstatSync(FILES[1]) },
      { path: FILES[2], stats: memfs.lstatSync(FILES[2]) }
    ]
    assert.strictEqual(items.length, paths.length)
    items.forEach((item) => {
      const ent = paths.filter((p) => p.path === item.path)[0]
      assert.strictEqual(item.path, ent.path)
      // Compare only the essential stats properties because timestamps like birthtime,ctime, etc. are different by a millisecond
      const actualStats = item.stats
      const expectedStats = ent.stats
      assert.strictEqual(
        actualStats.isDirectory(),
        expectedStats.isDirectory()
      )
      assert.strictEqual(actualStats.mode, expectedStats.mode)
      assert.strictEqual(actualStats.uid, expectedStats.uid)
      assert.strictEqual(actualStats.gid, expectedStats.gid)
      assert.strictEqual(actualStats.size, expectedStats.size)
    })
  })

  it('should return only files if opts.nodir is true', () => {
    const filesOnly = [
      { path: FILES[0], stats: memfs.lstatSync(FILES[0]) },
      { path: FILES[1], stats: memfs.lstatSync(FILES[1]) },
      { path: FILES[2], stats: memfs.lstatSync(FILES[2]) }
    ]
    const files = klawSync(TEST_DIR, { nodir: true, fs: memfs })
    assert.strictEqual(files.length, filesOnly.length)
    files.forEach((f) => {
      const ent = filesOnly.filter((p) => p.path === f.path)[0]
      assert.strictEqual(f.path, ent.path)
      assert.deepStrictEqual(f.stats, ent.stats)
    })
  })

  it('should return only dirs if opts.nofile is true', () => {
    const dirs = klawSync(TEST_DIR, { nofile: true, fs: memfs })
    const dirsOnly = [
      { path: DIRS[0], stats: memfs.lstatSync(DIRS[0]) },
      { path: DIRS[1], stats: memfs.lstatSync(DIRS[1]) },
      { path: DIRS[2], stats: memfs.lstatSync(DIRS[2]) },
      { path: DIRS[3], stats: memfs.lstatSync(DIRS[3]) }
    ]
    assert.strictEqual(dirs.length, dirsOnly.length)
    dirs.forEach((dir, i) => {
      assert.strictEqual(dir.path, dirsOnly[i].path)
      // Compare only the essential stats properties
      const actualStats = dir.stats
      const expectedStats = memfs.lstatSync(dirsOnly[i].path)
      assert.strictEqual(
        actualStats.isDirectory(),
        expectedStats.isDirectory()
      )
      assert.strictEqual(actualStats.mode, expectedStats.mode)
      assert.strictEqual(actualStats.uid, expectedStats.uid)
      assert.strictEqual(actualStats.gid, expectedStats.gid)
      assert.strictEqual(actualStats.size, expectedStats.size)
    })
  })

  describe('when opts.filter is true', () => {
    it('should filter based on path', () => {
      const f1 = path.join(TEST_DIR, 'foo.js')
      const f2 = path.join(TEST_DIR, 'bar.js')
      memfs.writeFileSync(f1, 'f1 file')
      memfs.writeFileSync(f2, 'f2 file')
      const paths = [{ path: f1, stats: memfs.lstatSync(f1) }]
      const filterFunc = (i) => path.basename(i.path).indexOf('foo') > -1
      const items = klawSync(TEST_DIR, { filter: filterFunc, fs: memfs })
      assert.strictEqual(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepStrictEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepStrictEqual(p.stats, paths[i].stats)
      })
    })

    it('should filter but not recurse if traverseAll is false', () => {
      const dirToIgnore1 = path.join(TEST_DIR, 'node_modules')
      const dirToIgnore2 = path.join(dirToIgnore1, 'somepkg')
      memfs.mkdirSync(dirToIgnore1, { recursive: true })
      memfs.mkdirSync(dirToIgnore2, { recursive: true })
      const paths = [
        { path: DIRS[0], stats: memfs.lstatSync(DIRS[0]) },
        { path: FILES[0], stats: memfs.lstatSync(FILES[0]) },
        { path: DIRS[1], stats: memfs.lstatSync(DIRS[1]) },
        { path: DIRS[2], stats: memfs.lstatSync(DIRS[2]) },
        { path: DIRS[3], stats: memfs.lstatSync(DIRS[3]) },
        { path: FILES[1], stats: memfs.lstatSync(FILES[1]) },
        { path: FILES[2], stats: memfs.lstatSync(FILES[2]) }
      ]
      const filterFunc = (i) => i.path.indexOf('node_modules') < 0
      const items = klawSync(TEST_DIR, {
        filter: filterFunc,
        traverseAll: false,
        fs: memfs
      })
      assert.strictEqual(items.length, paths.length)
      items.forEach((item) => {
        const ent = paths.filter((p) => p.path === item.path)[0]
        assert.strictEqual(item.path, ent.path)
        // Compare only the essential stats properties because timestamps like birthtime,ctime, etc. are different by a millisecond
        const actualStats = item.stats
        const expectedStats = ent.stats
        assert.strictEqual(
          actualStats.isDirectory(),
          expectedStats.isDirectory()
        )
        assert.strictEqual(actualStats.mode, expectedStats.mode)
        assert.strictEqual(actualStats.uid, expectedStats.uid)
        assert.strictEqual(actualStats.gid, expectedStats.gid)
        assert.strictEqual(actualStats.size, expectedStats.size)
      })
    })

    it('should filter when it is used to ignore items', () => {
      const dirToIgnore1 = path.join(TEST_DIR, 'node_modules')
      const dirToIgnore2 = path.join(TEST_DIR, '.git')
      memfs.mkdirSync(dirToIgnore1, { recursive: true })
      memfs.mkdirSync(dirToIgnore2, { recursive: true })
      const paths = [
        { path: DIRS[0], stats: memfs.lstatSync(DIRS[0]) },
        { path: FILES[0], stats: memfs.lstatSync(FILES[0]) },
        { path: DIRS[1], stats: memfs.lstatSync(DIRS[1]) },
        { path: DIRS[2], stats: memfs.lstatSync(DIRS[2]) },
        { path: DIRS[3], stats: memfs.lstatSync(DIRS[3]) },
        { path: FILES[1], stats: memfs.lstatSync(FILES[1]) },
        { path: FILES[2], stats: memfs.lstatSync(FILES[2]) }
      ]
      const filterFunc = (i) =>
        i.path.indexOf('node_modules') < 0 && i.path.indexOf('.git') < 0
      const items = klawSync(TEST_DIR, {
        filter: filterFunc,
        traverseAll: false,
        fs: memfs
      })
      assert.strictEqual(items.length, paths.length)
      items.forEach((item) => {
        const ent = paths.filter((p) => p.path === item.path)[0]
        assert.strictEqual(item.path, ent.path)
        // Compare only the essential stats properties because timestamps like birthtime,ctime, etc. are different by a millisecond
        const actualStats = item.stats
        const expectedStats = ent.stats
        assert.strictEqual(
          actualStats.isDirectory(),
          expectedStats.isDirectory()
        )
        assert.strictEqual(actualStats.mode, expectedStats.mode)
        assert.strictEqual(actualStats.uid, expectedStats.uid)
        assert.strictEqual(actualStats.gid, expectedStats.gid)
        assert.strictEqual(actualStats.size, expectedStats.size)
      })
    })

    it('should filter and apply opts.nofile', () => {
      const f = path.join(TEST_DIR, 'foo.js')
      const d1 = path.join(TEST_DIR, 'foo')
      const d2 = path.join(TEST_DIR, 'foobar')
      memfs.writeFileSync(f, 'file contents')
      memfs.mkdirSync(d1, { recursive: true })
      memfs.mkdirSync(d2, { recursive: true })
      const paths = [
        { path: d1, stats: memfs.lstatSync(d1) },
        { path: d2, stats: memfs.lstatSync(d2) }
      ]
      const filterFunc = (i) => i.path.indexOf('foo') > 0
      const items = klawSync(TEST_DIR, {
        filter: filterFunc,
        nofile: true,
        fs: memfs
      })
      assert.strictEqual(items.length, paths.length)
      items.forEach((p, i) => {
        assert.deepStrictEqual(p, paths[i])
        assert.strictEqual(p.path, paths[i].path)
        assert.deepStrictEqual(p.stats, paths[i].stats)
      })
    })
  })
})
