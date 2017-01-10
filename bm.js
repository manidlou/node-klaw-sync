'use strict'
const path = require('path')
const Benchmark = require('benchmark')
const walkSync = require('walk-sync')
const globSync = require('glob').sync
const fsReaddirRecurSync = require('fs-readdir-recursive')
const klawSync = require('./klaw-sync.js')

function help () {
  console.log(`Usage examples:\n`)
  console.log(`node bm.js <rootdir> (basic)`)
  console.log(`node bm.js <rootdir> --ignore "{node_modules,.git}" (ignore node_modules and .git directories)`)
  console.log(`node bm.js <rootdir> --ignore "{node_modules,.git}" "*.js" (ignore node_modules, .git and all js files)`)
}

function parseArgv () {
  var args = process.argv
  var opts = {}
  if (args.length <= 2) {
    console.error('err: root dir must be specified.\n')
    help()
    process.exit(1)
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

function bmIgnore (root, ign) {
  var suite = Benchmark.Suite()
  suite.add('walk-sync', function () {
    walkSync(root, {ignore: ign})
  }).add('glob-sync', function () {
    globSync('**', {
      cwd: root,
      dot: true,
      mark: true,
      strict: true,
      ignore: ign
    })
  }).add('klaw-sync', function () {
    klawSync(root, {ignore: ign})
  }).on('error', function (er) {
    return er
  }).on('cycle', function (ev) {
    console.log(String(ev.target))
  }).on('complete', function () {
    console.log('\nSummary: Fastest is ' + this.filter('fastest').map('name'))
  }).run({ 'async': true })
}

function bmBasic (root) {
  var suite = Benchmark.Suite()
  suite.add('walk-sync', function () {
    walkSync(root)
  }).add('glob-sync', function () {
    globSync('**', {
      cwd: root,
      dot: true,
      mark: true,
      strict: true
    })
  }).add('klaw-sync', function () {
    klawSync(root)
  }).add('fs-readdir-recursive', function () {
    fsReaddirRecurSync(root)
  }).on('error', function (er) {
    return er
  }).on('cycle', function (ev) {
    console.log(String(ev.target))
  }).on('complete', function () {
    console.log('\nSummary: Fastest is ' + this.filter('fastest').map('name'))
  }).run({ 'async': true })
}

try {
  var opts = parseArgv()
  console.log('Running benchmark tests...\n')
  if (opts.ignore) {
    bmIgnore(opts.root, opts.ignore)
  } else {
    bmBasic(opts.root)
  }
} catch (er) {
  throw er
}
