node-klaw-sync
==============

[![npm Package](https://img.shields.io/npm/v/klaw-sync.svg?style=flat-square)](https://www.npmjs.com/package/klaw-sync)
[![Build Status](https://travis-ci.org/manidlou/node-klaw-sync.svg?branch=master)](https://travis-ci.org/manidlou/node-klaw-sync)
[![windows Build status](https://ci.appveyor.com/api/projects/status/braios34k6qw4h5p/branch/master?svg=true)](https://ci.appveyor.com/project/manidlou/node-klaw-sync/branch/master)

<a href="https://github.com/feross/standard" style="float: right; padding: 0 0 20px 20px;"><img src="https://cdn.rawgit.com/feross/standard/master/sticker.svg" alt="Standard JavaScript" width="100" align="right"></a>

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
    - return only files (ignore directories).
  - `nofile` `<Boolean>`
    - return only directories (ignore files).
  - `depthLimit`: `<Number>`
    - the number of times to recurse before stopping. -1 for unlimited.
  - `fs`: `<Object>`
    - custom `fs`, useful for mocking `fs` object.
  - `filter` `<Function>`
    - function that gets one argument `fn({path: '', stats: {}})` and returns true to include or false to exclude the item.

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

Running some basic [benchmark](https://github.com/bestiejs/benchmark.js) tests on these modules:

- `klaw-sync`
- [walk-sync](https://github.com/joliss/node-walk-sync)
- [glob.sync](https://github.com/isaacs/node-glob#globsyncpattern-options)

It turned out (as of January 25, 2017) for the most cases `klaw-sync` is faster than other modules!

##### run benchmark

`npm run benchmark`

##### results
```bash
Running benchmark tests..

root dir length: 1110
walk-sync x 154 ops/sec ±0.85% (79 runs sampled)
glob.sync x 20.61 ops/sec ±2.52% (38 runs sampled)
klaw-sync x 173 ops/sec ±2.63% (77 runs sampled)
Fastest is klaw-sync

root dir length: 11110
walk-sync x 14.56 ops/sec ±0.68% (40 runs sampled)
glob.sync x 1.83 ops/sec ±5.92% (9 runs sampled)
klaw-sync x 16.17 ops/sec ±2.78% (44 runs sampled)
Fastest is klaw-sync

root dir length: 111110
walk-sync x 1.25 ops/sec ±2.24% (8 runs sampled)
glob.sync x 0.17 ops/sec ±7.13% (5 runs sampled)
klaw-sync x 1.37 ops/sec ±1.48% (8 runs sampled)
Fastest is klaw-sync
```

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
