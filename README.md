node-klaw-sync
==============

[![npm Package](https://img.shields.io/npm/v/klaw-sync.svg?style=flat-square)](https://www.npmjs.com/package/klaw-sync)
[![Build Status](https://travis-ci.org/manidlou/node-klaw-sync.svg?branch=master)](https://travis-ci.org/manidlou/node-klaw-sync)
[![windows Build status](https://ci.appveyor.com/api/projects/status/braios34k6qw4h5p/branch/master?svg=true)](https://ci.appveyor.com/project/manidlou/node-klaw-sync/branch/master)

<a href="https://github.com/feross/standard"><img src="https://cdn.rawgit.com/feross/standard/master/sticker.svg" alt="Standard JavaScript" width="100"></a>

`klaw-sync` is a Node.js recursive file system walker, which is the synchronous counterpart of [klaw](https://github.com/jprichardson/node-klaw). It lists all files and directories inside a directory recursively and returns an array of objects that each object has two properties: `path` and `stats`. `path` is the full path of the file or directory and `stats` is an instance of [fs.Stats](https://nodejs.org/api/fs.html#fs_class_fs_stats).

Install
-------

    npm i klaw-sync

Usage
-----

### klawSync(directory[, options])

- `directory` `<String>`
- `options` `<Object>` (optional) _all options are `false` by default_
  - `nodir` `<Boolean>`
    - return only files (ignore directories)
  - `nofile` `<Boolean>`
    - return only directories (ignore files)
  - `noRecurseOnFailedFilter` `<Boolean>`
    - when `filter` function is used, the default behavior is to read all directories even if they don't pass the `filter` function (won't be included but still will be traversed). If you set `true`, there will be neither inclusion nor traversal for directories that don't pass the `filter` function
  - `filter` `<Function>`
    - function that gets one argument `fn({path: '', stats: {}})` and returns true to include or false to exclude the item

- **Return:** `<Array<Object>>` `[{path: '', stats: {}}]`

Examples
--------

```js
const klawSync = require('klaw-sync')

const paths = klawSync('/some/dir')
// paths = [{path: '/some/dir/dir1', stats: {}}, {path: '/some/dir/file1', stats: {}}]
```

_**catch error**_

```js
const klawSync = require('klaw-sync')

let paths
try {
  paths = klawSync('/some/dir')
} catch (er) {
  console.error(er)
}
console.dir(paths)
```

_**files only**_

```js
const klawSync = require('klaw-sync')

const files = klawSync('/some/dir', {nodir: true})
// files = [{path: '/some/dir/file1', stats: {}}, {path: '/some/dir/file2', stats: {}}]
```

_**directories only**_

```js
const klawSync = require('klaw-sync')

const dirs = klawSync('/some/dir', {nofile: true})
// dirs = [{path: '/some/dir/dir1', stats: {}}, {path: '/some/dir/dir2', stats: {}}]
```

_**ignore `node_modules`**_

Notice here `noRecurseOnFailedFilter: true` option is used since we don't want anything from `node_modules` (no inclusion and no traversal).

```js
const klawSync = require('klaw-sync')

const filterFn = item => item.path.indexOf('node_modules') < 0

const paths = klawSync('/some/dir', { filter: filterFn, noRecurseOnFailedFilter: true })
```

_**ignore `node_modules` and `.git`**_

```js
const klawSync = require('klaw-sync')

const filterFn = item => item.path.indexOf('node_modules') < 0 && item.path.indexOf('.git') < 0

const paths = klawSync('/some/dir', { filter: filterFn, noRecurseOnFailedFilter: true })
```

_**get all `js` files**_

Here `noRecurseOnFailedFilter` option is not required since we are interested in all `js` files. In other words, although no directories pass the `filter` function, we still want to read them and see if they have any `js` files.

```js
const path = require('path')
const klawSync = require('klaw-sync')

const filterFn = item => path.extname(item.path) === '.js'

const paths = klawSync('/some/dir', { filter: filterFn })
```

_**filter based on stats**_

Again here `noRecurseOnFailedFilter` option is not required since we still want to read all directories even though they don't pass the `filter` function, to see if their contents pass the `filter` function.

```js
const klawSync = require('klaw-sync')

const refTime = new Date(2017, 3, 24).getTime()
const filterFn = item => item.stats.mtime.getTime() > refTime

const paths = klawSync('/some/dir', { filter: filterFn })
```

Run tests
---------

lint: `npm run lint`

unit test: `npm run unit`

lint & unit: `npm test`


Performance compare to other similar modules
-----------------------------------------------

The `bm.js` runs some basic [benchmark](https://github.com/bestiejs/benchmark.js) tests for two cases: basic usage and with `--nodir=true` (get files only), on these modules:

- `klaw-sync`
- [walk-sync](https://github.com/joliss/node-walk-sync)
- [glob.sync](https://github.com/isaacs/node-glob#globsyncpattern-options)

It turned out (as of January 25, 2017) for the most cases `klaw-sync` is faster than other modules!

##### run benchmark

`npm run benchmark -- --dir=/some/dir`

`npm run benchmark -- --dir=/some/dir --nodir=true`

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
