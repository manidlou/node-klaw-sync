Node.js: klaw-sync
=================

[![npm Package](https://img.shields.io/npm/v/klaw-sync.svg?style=flat-square)](https://www.npmjs.com/package/klaw-sync)
[![Build Status](https://travis-ci.org/mawni/klaw-sync.svg?branch=master)](https://travis-ci.org/mawni/klaw-sync)
[![windows Build status](https://img.shields.io/appveyor/ci/mawni/klaw-sync/master.svg?label=windows%20build)](https://ci.appveyor.com/project/mawni/klaw-sync/branch/master)

<a href="https://github.com/feross/standard"><img src="https://cdn.rawgit.com/feross/standard/master/sticker.svg" alt="Standard JavaScript" width="100"></a>

`klaw-sync` is a recursive file system walker, which is the synchronous counterpart of [klaw](https://github.com/jprichardson/node-klaw). It lists all files and directories inside a directory recursively and returns an array of objects that each object has two properties: `path` and `stats`. `path` is the full path of the file or directory and `stats` is an instance of [fs.Stats](https://nodejs.org/api/fs.html#fs_class_fs_stats).

**Special thanks to [agnivade](https://github.com/agnivade), [jprichardson](https://github.com/jprichardson) and [RyanZim](https://github.com/RyanZim) for their contribution and support.**

Install
-------

    npm install klaw-sync

Usage
-----

### klawSync(directory[, options])

- `directory` `{String}`
- `options` `{Object}` *optional* All options are `false` by default.
 - `ignore` `{String | Array<String>}` any paths or [minimatch](https://github.com/isaacs/minimatch) patterns to ignore (can be string or an array of strings)
 - `nodir` `{Boolean}` return only files (ignore directories)
 - `nofile` `{Boolean}` return only directories (ignore files)

- `@return` `[{path: '', stats: {}}]`

Examples
--------

```js
var klawSync = require('klaw-sync')
var paths = klawSync('/some/dir')
// paths = [{path: '/some/dir/dir1', stats: {}}, {path: '/some/dir/file1', stats: {}}]
```

**catch error**

```js
var klawSync = require('klaw-sync')

var paths
try {
  paths = klawSync('/some/dir')
} catch (er) {
  console.error(er)
}
console.log(paths)
```

**files only**

```js
var klawSync = require('klaw-sync')
var files = klawSync('/some/dir', {nodir: true})
// files = [{path: '/some/dir/file1', stats: {}}, {path: '/some/dir/file2', stats: {}}]
```

**directories only**

```js
var klawSync = require('klaw-sync')
var dirs = klawSync('/some/dir', {nofile: true})
// dirs = [{path: '/some/dir/dir1', stats: {}}, {path: '/some/dir/dir2', stats: {}}]
```

**ignore `node_modules`**

```js
var klawSync = require('klaw-sync')
var paths = klawSync('/some/dir', {ignore: 'node_modules'})
```

**ignore `node_modules` and `.git`**

```js
var klawSync = require('klaw-sync')
var paths = klawSync('/some/dir', {ignore: '{node_modules,.git}'})
```

**ignore `node_modules`, `.git` and all `*.js` files**

```js
var klawSync = require('klaw-sync')
var paths = klawSync('/some/dir', {ignore: ['{node_modules,.git}', '*.js']})
```

Performance comparison to other similar modules
-----------------------------------------------

Sometimes it's fun to run speed tests on similar functions or modules. The `bm.js` runs some basic [benchmark](https://github.com/bestiejs/benchmark.js) tests for two cases, `without --ignore` (basic usage) and `with --ignore`, on these modules:

- `klaw-sync`
- [walk-sync](https://github.com/joliss/node-walk-sync)
- [glob.sync](https://github.com/isaacs/node-glob#globsyncpattern-options)
- [fs-readdir-recursive](https://github.com/fs-utils/fs-readdir-recursive) (only for basic usage, I am not sure if they support glob patterns)

All of these modules are great pieces of software. Just for fun, it turned out for the most cases `klaw-sync` is faster than other modules!

The `bm.js` can be used like:

*basic usage without ignore*

`node bm.js /some/dir`

*with ignore*

`node bm.js /some/dir --ignore "{node_modules,.git}"`

`node bm.js /some/dir --ignore "{node_modules,.git}" "*.js"`

License
-------

Licensed under MIT
