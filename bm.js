'use strict'
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const Benchmark = require('benchmark')
const walkSync = require('walk-sync')
const globSync = require('glob').sync
const klawSync = require('./klaw-sync.js')

function help () {
  console.log(`Usage examples:\n`)
  console.log(`npm run benchmark -- --dir=<rootdir> -t (exec time)`)
  console.log(`npm run benchmark -- --dir=<rootdir> -p (performance)`)
  console.log(`npm run benchmark -- --dir=<rootdir> -t -i "{node_modules,.git}" (exec time with ignore node_modules and .git directories using minimatch pattern)`)
  console.log(`npm run benchmark -- --dir=<rootdir> -p -i "node_modules" -i "*.js" (performance with ignore node_modules and .git directories)`)
}

function bmPerf (root, ign) {
  var suite = Benchmark.Suite()
  if (ign) {
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
  } else {
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
    }).on('error', function (er) {
      return er
    }).on('cycle', function (ev) {
      console.log(String(ev.target))
    }).on('complete', function () {
      console.log('\nSummary: Fastest is ' + this.filter('fastest').map('name'))
    }).run({ 'async': true })
  }
}

function bmTime (root, ign) {
  if (ign) {
    console.time('walk-sync')
    walkSync(root, {ignore: ign})
    console.timeEnd('walk-sync')

    console.time('glob-sync')
    globSync('**', {
      cwd: root,
      dot: true,
      mark: true,
      strict: true,
      ignore: ign
    })
    console.timeEnd('glob-sync')

    console.time('klaw-sync')
    klawSync(root, {ignore: ign})
    console.timeEnd('klaw-sync')
  } else {
    console.time('walk-sync')
    walkSync(root)
    console.timeEnd('walk-sync')

    console.time('glob-sync')
    globSync('**', {
      cwd: root,
      dot: true,
      mark: true,
      strict: true
    })
    console.timeEnd('glob-sync')

    console.time('klaw-sync')
    klawSync(root)
    console.timeEnd('klaw-sync')
  }

  console.log()
  process.exit(0)
}

try {
  if (!argv.dir) {
    console.log('err: root dir must be specified.')
    help()
    process.exit(1)
  }

  if (!argv.t && !argv.p) {
    console.log('err: test type -t or -p must be specified.')
    help()
    process.exit(1)
  }

  var dir = path.resolve(argv.dir)
  // time test
  if (argv.t) {
    console.log('Running benchmark tests (exec time)...\n')
    console.log('root dir: ' + argv.dir + (argv.i ? ', ignore: [' + argv.i + ']' : '') + '\n')
    if (argv.i) {
      // with ignore args
      // convert ignore args to array
      if (typeof argv.i === 'string') {
        bmTime(dir, [argv.i])
      } else {
        bmTime(dir, argv.i)
      }
    } else {
      // without ignore args
      bmTime(dir)
    }
  }

  // performance test
  if (argv.p) {
    console.log('Running benchmark tests (performance)...\n')
    console.log('root dir: ' + argv.dir + (argv.i ? ', ignore: [' + argv.i + ']' : '') + '\n')
    if (argv.i) {
      // convert ignore args to array
      if (typeof argv.i === 'string') {
        bmPerf(dir, [argv.i])
      } else {
        bmPerf(dir, argv.i)
      }
    } else {
      bmPerf(dir)
    }
  }
} catch (er) {
  throw er
}
