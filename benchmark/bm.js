'use strict'
const fs = require('fs-extra')
const path = require('path')
const mkp = require('mkp')
const Benchmark = require('benchmark')
const walkSync = require('walk-sync')
const globSync = require('glob').sync
const klawSync = require('../klaw-sync.js')

const testDir = path.join(__dirname, 'klaw-sync-benchmark-fixtures')
const paths = [
  {dirs: `${testDir}/{0..9}/{0..9}`, files: `${testDir}/{0..9}/{0..9}/{0..9}.txt`}, // 1000 files
  {dirs: `${testDir}/{0..9}/{0..9}/{0..9}`, files: `${testDir}/{0..9}/{0..9}/{0..9}/{0..9}.txt`}, // 10,000
  {dirs: `${testDir}/{0..9}/{0..9}/{0..9}/{0..9}`, files: `${testDir}/{0..9}/{0..9}/{0..9}/{0..9}/{0..9}.txt`} // 100,000
]

function tearDown () {
  fs.removeSync(testDir)
}

function setup (p) {
  tearDown()
  mkp.sync(p.dirs)
  mkp.sync(p.files)
}

function run (root, opts) {
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
      tearDown()
      return er
    }).on('cycle', function (ev) {
      console.log(String(ev.target))
    }).on('complete', function () {
      console.log('Fastest is ' + this.filter('fastest').map('name'))
    }).run()
  }
}

console.log('Running benchmark tests..')
paths.forEach(p => {
  setup(p)
  console.log(`\nroot dir length: ${klawSync(testDir).length}`)
  run(testDir)
  tearDown()
})
