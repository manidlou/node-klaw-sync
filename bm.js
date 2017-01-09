'use strict'
const path = require('path')
const Benchmark = require('benchmark')
const walk_sync = require('walk-sync')
const glob_sync = require('glob').sync
const fs_readdir_recur_sync = require('fs-readdir-recursive')
const klaw_sync = require('./klaw-sync.js')

function help () {
  console.log(`Usage:\n`)
  console.log(`node bm.js <rootdir> (basic)`)
  console.log(`node bm.js <rootdir> --ignore "{node_modules,.git}" (ignore node_modules and .git directories)`)
  console.log(`node bm.js <rootdir> --ignore "{node_modules,.git}" "*.js" (ignore node_modules, .git and all js files)`)
}

function parse_argv () {
  var args = process.argv
  var opts = {}
  if (args.length <= 2) {
    console.error('err: root dir must be specified.\n')
    help()
  } else {
    try {
      opts.root = path.resolve(args[2])
    } catch (er) {
      return er
    }
    if (args.indexOf('--ignore') > 0) {
      opts.ignore = args.slice(args.indexOf('--ignore') + 1, args.length)
    }
    return opts
  }
}

function bm_ignore (root, ign) {
  var suite = new Benchmark.Suite;
  suite.add('walk-sync', function () {
    walk_sync(root, {ignore: ign})
  }).add('glob-sync', function () {
    glob_sync('**', {
      cwd: root,
      dot: true,
      mark: true,
      strict: true,
      ignore: ign
    })
  }).add('klaw-sync', function () {
    klaw_sync(root, {ignore: ign})
  }).on('error', function (er) {
    return er
  }).on('cycle', function (ev) {
    console.log(String(ev.target))
  }).on('complete', function () {
    console.log('\nSummary: Fastest is ' + this.filter('fastest').map('name'))
  }).run({ 'async': true })
}

function bm_basic (root) {
  var suite = new Benchmark.Suite;
  suite.add('walk-sync', function () {
    walk_sync(root)
  }).add('glob-sync', function () {
    glob_sync('**', {
      cwd: root,
      dot: true,
      mark: true,
      strict: true
    })
  }).add('klaw-sync', function () {
    klaw_sync(root)
  }).add('fs-readdir-recursive', function () {
    fs_readdir_recur_sync(root)
  }).on('error', function (er) {
    return er
  }).on('cycle', function (ev) {
    console.log(String(ev.target))
  }).on('complete', function () {
    console.log('\nSummary: Fastest is ' + this.filter('fastest').map('name'))
  }).run({ 'async': true })
}

try {
  var opts = parse_argv()
  console.log('Running benchmark tests...\n')
  if (opts.ignore) {
    bm_ignore(opts.root, opts.ignore)
  } else {
    bm_basic(opts.root)
  }
} catch (er) {
  throw er
}
