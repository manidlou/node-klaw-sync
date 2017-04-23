'use strict'
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const Benchmark = require('benchmark')
const walkSync = require('walk-sync')
const globSync = require('glob').sync
const klawSync = require('../klaw-sync.js')

function help () {
  console.log(`Usage examples:\n`)
  console.log(`npm run benchmark -- --dir=<rootdir>`)
  console.log(`npm run benchmark -- --dir=<rootdir> --nodir=true (ignore all directories)`)
}

function runBm (root, opts) {
  if (!opts) {
    const suite = Benchmark.Suite()
    suite.add('walk-sync', function () {
      walkSync(root)
    }).add('glob.sync', function () {
      globSync('**', {
        cwd: root,
        dot: true,
        mark: true,
        strict: true
      })
    }).add('klaw-sync', function () {
      klawSync(root)
    }).on('error', function (er) {
      return er
    }).on('cycle', function (ev) {
      console.log(String(ev.target))
    }).on('complete', function () {
      console.log('Fastest is ' + this.filter('fastest').map('name'))
    }).run()
  } else {
    const suite = Benchmark.Suite()
    suite.add('walk-sync', function () {
      walkSync(root, {directories: false})
    }).add('glob.sync', function () {
      globSync('**', {
        cwd: root,
        dot: true,
        mark: true,
        strict: true,
        nodir: true
      })
    }).add('klaw-sync', function () {
      klawSync(root, {nodir: true})
    }).on('error', function (er) {
      return er
    }).on('cycle', function (ev) {
      console.log(String(ev.target))
    }).on('complete', function () {
      console.log('Fastest is ' + this.filter('fastest').map('name'))
    }).run()
  }
}

if (!argv.dir) {
  console.log('err: root dir cannot be null.')
  help()
} else {
  const dir = path.resolve(argv.dir)
  console.log('Running benchmark tests..')
  if (argv.nodir) {
    console.log(`root dir: ${dir}`)
    console.log('option.nodir: true\n')
    runBm(dir, {nodir: true})
  } else {
    console.log(`root dir: ${dir}\n`)
    runBm(dir)
  }
}
