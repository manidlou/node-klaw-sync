Node.js: klaw-sync
=================

[![npm Package](https://img.shields.io/npm/v/klaw-sync.svg?style=flat-square)](https://www.npmjs.com/package/klaw-sync)
[![Build Status](https://travis-ci.org/manidlou/node-klaw-sync.svg?branch=master)](https://travis-ci.org/manidlou/node-klaw-sync)
[![windows Build status](https://ci.appveyor.com/api/projects/status/braios34k6qw4h5p/branch/master?svg=true)](https://ci.appveyor.com/project/manidlou/node-klaw-sync/branch/master)

<a href="https://github.com/feross/standard"><img src="https://cdn.rawgit.com/feross/standard/master/sticker.svg" alt="Standard JavaScript" width="100"></a>

`klaw-sync` is a recursive file system walker, which is the synchronous counterpart of [klaw](https://github.com/jprichardson/node-klaw). It lists all files and directories inside a directory recursively and returns an array of objects that each object has two properties: `path` and `stats`. `path` is the full path of the file or directory and `stats` is an instance of [fs.Stats](https://nodejs.org/api/fs.html#fs_class_fs_stats).

Install
-------

    npm install klaw-sync

Usage
-----

### klawSync(directory[, options])

- `directory` `{String}`
- `options` `{Object}` *optional* (all options are `false` by default)
 - `ignore` `{String | Array<String>}` any paths or [minimatch](https://github.com/isaacs/minimatch) patterns to ignore (can be string or an array of strings)
 - `nodir` `{Boolean}` return only files (ignore directories)
 - `nofile` `{Boolean}` return only directories (ignore files)

- return: `{Array<Object>}` `[{path: '', stats: {}}]`

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

**ignore `node_modules` and `.git` using [minimatch](https://github.com/isaacs/minimatch) patterns**

```js
var klawSync = require('klaw-sync')
var paths = klawSync('/some/dir', {ignore: '{node_modules,.git}'})
```

**ignore `node_modules`, `.git` and all `*.js` files using [minimatch](https://github.com/isaacs/minimatch) patterns**

```js
var klawSync = require('klaw-sync')
var paths = klawSync('/some/dir', {ignore: ['{node_modules,.git}', '*.js']})
```

Run tests
---------

lint: `npm run lint`

unit test: `npm run unit`

lint & unit: `npm test`


Performance comparison to other similar modules
-----------------------------------------------

Sometimes it's fun to run speed tests on similar functions or modules. The `bm.js` runs some basic [benchmark](https://github.com/bestiejs/benchmark.js) tests for two cases, `without --ignore` (basic usage) and `with --ignore`, on these modules:

- `klaw-sync`
- [walk-sync](https://github.com/joliss/node-walk-sync)
- [glob.sync](https://github.com/isaacs/node-glob#globsyncpattern-options)

All of these modules are great. I appreciate the works. I've personally learned a lot from them.

Just for fun, it turned out for the most cases `klaw-sync` is faster than other modules!


#####run benchmark (performance)

_basic usage without anything to ignore_

`npm run benchmark -- --dir=/some/dir -p`

_one item to ignore_

`npm run benchmark -- --dir=/some/dir -p -i "node_modules"`

_multiple items to ignore_

`npm run benchmark -- --dir=/some/dir -p -i "node_modules" -i "*.js"`

#####run benchmark (exec time)

`npm run benchmark -- --dir=/some/dir -t`

`npm run benchmark -- --dir=/some/dir -t -i ".git"`

`npm run benchmark -- --dir=/some/dir -t -i ".git" -i "*.js"`


Credit
------

Special thanks to:

- [agnivade](https://github.com/agnivade)
- [jprichardson](https://github.com/jprichardson)
- [RyanZim](https://github.com/RyanZim)

for their contribution and support.

License
-------

Licensed under MIT
