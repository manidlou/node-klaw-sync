'use strict'
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const Benchmark = require('benchmark')
const walkSync = require('walk-sync')
const globSync = require('glob').sync
const klawSync = require('../klaw-sync.js')

function help () {
  console.log(`Usage examples:\n`)
  console.log(`npm run benchmark -- --dir=<rootdir> (basic usage without anything to ignore)`)
  console.log(`npm run benchmark -- --dir=<rootdir> -i "{node_modules,.git}" (ignore node_modules and .git directories)`)
  console.log(`npm run benchmark -- --dir=<rootdir> -i "node_modules" -i "*.js" (ignore node_modules and all js files)`)
}

function perf (root, ign) {
  var suite = Benchmark.Suite()
  if (ign) {
    suite.add('walk-sync', function () {
      walkSync(root, {ignore: ign})
    }).add('glob.sync', function () {
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
  } else {
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
      console.log('\nSummary: Fastest is ' + this.filter('fastest').map('name'))
    }).run({ 'async': true })
  }
}

try {
  if (!argv.dir) {
    console.log('err: root dir must be specified.')
    help()
    process.exit(1)
  }
  var dir = path.resolve(argv.dir)
  console.log('Running benchmark tests...\n')
  console.log('root dir: ', argv.dir)
  if (argv.i) {
    process.stdout.write('ignore: ')
    console.dir(argv.i)
    console.log()
    // convert ignore args to array
    if (typeof argv.i === 'string') {
      perf(dir, [argv.i])
    } else {
      perf(dir, argv.i)
    }
  } else {
    perf(dir)
  }
} catch (er) {
  throw er
}
