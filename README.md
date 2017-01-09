Node.js: klaw-sync
=================

[![npm Package](https://img.shields.io/npm/v/klaw-sync.svg?style=flat-square)](https://www.npmjs.com/package/klaw-sync)
[![Build Status](https://travis-ci.org/mawni/klaw-sync.svg?branch=master)](https://travis-ci.org/mawni/klaw-sync)
[![windows Build status](https://img.shields.io/appveyor/ci/mawni/klaw-sync/master.svg?label=windows%20build)](https://ci.appveyor.com/project/mawni/klaw-sync/branch/master)

<a href="https://github.com/feross/standard"><img src="https://cdn.rawgit.com/feross/standard/master/sticker.svg" alt="Standard JavaScript" width="100"></a>

`klaw-sync` is a recursive file system walker, which is the synchronous counterpart of [klaw](https://github.com/jprichardson/node-klaw). It lists all files and directories inside a directory recursively and returns an array of objects that each object has `path` (abosulte path of the file or dir) and [stats](https://nodejs.org/api/fs.html#fs_class_fs_stats) properties.

*Special thanks to [agnivade](https://github.com/agnivade), [jprichardson](https://github.com/jprichardson) and [RyanZim](https://github.com/RyanZim) for their contribution and support.*

Install
-------

    npm install klaw-sync

Usage
-----

### klawSync(directory[, options])

- `directory` `{String}`
- `options` `{Object}` *optional*
 - `ignore` `{String | Array<String>}` any paths or [minimatch](https://github.com/isaacs/minimatch) patterns to ignore (can be string or an array of strings)
 - `files` `{Boolean}` return only files
 - `dirs` `{Boolean}` return only directories

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
var files = klawSync('/some/dir', {files: true})
// files = [{path: '/some/dir/file1', stats: {}}, {path: '/some/dir/file2', stats: {}}]
```

**directories only**

```js
var klawSync = require('klaw-sync')
var dirs = klawSync('/some/dir', {dirs: true})
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

License
-------

Licensed under MIT
