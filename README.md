node-klaw-sync
==============

[![npm Package](https://img.shields.io/npm/v/klaw-sync.svg?style=flat-square)](https://www.npmjs.com/package/klaw-sync)
[![Build Status](https://travis-ci.org/manidlou/node-klaw-sync.svg?branch=master)](https://travis-ci.org/manidlou/node-klaw-sync)
[![windows Build status](https://ci.appveyor.com/api/projects/status/braios34k6qw4h5p/branch/master?svg=true)](https://ci.appveyor.com/project/manidlou/node-klaw-sync/branch/master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
[![Known Vulnerabilities](https://snyk.io/test/npm/klaw-sync/badge.svg?style=flat-square)](https://snyk.io/test/npm/klaw-sync)

`klaw-sync` is a Node.js recursive and fast file system walker, which is the synchronous counterpart of [klaw](https://github.com/jprichardson/node-klaw). It lists all files and directories inside a directory recursively and returns an array of objects that each object has two properties: `path` and `stats`. `path` is the full path of the file or directory and `stats` is an instance of [fs.Stats](https://nodejs.org/api/fs.html#fs_class_fs_stats).

Install
-------

    npm i klaw-sync

Usage
-----

### klawSync(directory[, options])

- `directory` `<String>`
- `options` `<Object>` (optional)
  - `nodir` `<Boolean>` default: `undefined`
    - return only files (ignore directories).
  - `nofile` `<Boolean>` default: `undefined`
    - return only directories (ignore files).
  - `depthLimit`: `<Number>` default: `-1`
    - the number of times to recurse before stopping. `-1` for unlimited.
  - `fs`: `<Object>` default: `graceful-fs`
    - custom `fs`, useful when mocking `fs` object.
  - `filter` `<Function>` default: `undefined`
    - function that gets one argument `fn({path: '', stats: {}})` and returns true to include or false to exclude the item.
  - `traverseAll` `<Boolean>` default: `undefined`
    - traverse all subdirectories, regardless of `filter` option. This can be useful when you have a filter function and still want to traverse all subdirectories even if your filter function doesn't pass for some directories.
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

_**ignore hidden directories**_


```js
const path = require('path')
const klawSync = require('klaw-sync')

const filterFn = item => {
  const basename = path.basename(item.path)
  return basename === '.' || basename[0] !== '.'
}

const paths = klawSync('/some/dir', { filter: filterFn})
```

_**filter based on stats**_

Here `traverseAll` option is required since we still want to read all subdirectories even if they don't pass the `filter` function, to see if their contents do pass the `filter` function.

```js
const klawSync = require('klaw-sync')

const refTime = new Date(2017, 3, 24).getTime()
const filterFn = item => item.stats.mtime.getTime() > refTime

const paths = klawSync('/some/dir', { traverseAll: true, filter: filterFn })
```

Run tests
---------

lint: `npm run lint`

unit test: `npm run unit`

lint & unit: `npm test`

benchmark: `npm run benchmark`

Performance compare to other similar modules
-----------------------------------------------

Running some [benchmark](https://github.com/bestiejs/benchmark.js) tests on these modules:

- `klaw-sync`
- [walk-sync](https://github.com/joliss/node-walk-sync)

(as of Jan 25, 2017) `klaw-sync` is the fastest module!

##### results (tested on Ubuntu 18.04, Intel(R) Core(TM) i7-2630QM CPU @ 2.00GHz, 8 CPUs, 8g RAM, node v10.9.0)

```bash
Running benchmark tests..

root dir length: 1110
walk-sync x 83.47 ops/sec ±1.93% (70 runs sampled)
klaw-sync x 159 ops/sec ±1.82% (78 runs sampled)
Fastest is klaw-sync

root dir length: 11110
walk-sync x 7.49 ops/sec ±3.10% (23 runs sampled)
klaw-sync x 14.72 ops/sec ±0.24% (40 runs sampled)
Fastest is klaw-sync

root dir length: 111110
walk-sync x 0.70 ops/sec ±4.95% (6 runs sampled)
klaw-sync x 1.21 ops/sec ±2.23% (7 runs sampled)
Fastest is klaw-sync
```

License
-------

Licensed under MIT
