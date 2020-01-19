'use strict'
const fs = require('fs-extra')
const path = require('path')
const mkp = require('mkp')
const Benchmark = require('benchmark')
const walkSync = require('walk-sync')
const klawSync = require('../klaw-sync.js')
const pkg = require('../package.json')

const testDir = path.join(__dirname, 'klaw-sync-benchmark-fixtures')
const paths = [
  {dirs: `${testDir}/{0..9}/{0..9}`, files: `${testDir}/{0..9}/{0..9}/{0..9}.txt`}, // 1000 files
  {dirs: `${testDir}/{0..9}/{0..9}/{0..9}`, files: `${testDir}/{0..9}/{0..9}/{0..9}/{0..9}.txt`}, // 10,000
  {dirs: `${testDir}/{0..9}/{0..9}/{0..9}/{0..9}`, files: `${testDir}/{0..9}/{0..9}/{0..9}/{0..9}/{0..9}.txt`} // 100,000
]

const walkSyncVersion = pkg.devDependencies['walk-sync'].slice(1)
const klawSyncVersion = pkg.version

console.log('Running benchmark tests..')
console.log(`\nwalk-sync version: ${walkSyncVersion}`)
console.log(`klaw-sync version: ${klawSyncVersion}`)
paths.forEach(p => {
  setup(p)
  console.log(`\nroot dir length: ${klawSync(testDir).length}`)
  run(testDir)
  tearDown()
})

function tearDown () {
  fs.removeSync(testDir)
}

function setup (p) {
  tearDown()
  mkp.sync(p.dirs)
  mkp.sync(p.files)
}

function run (root) {
  const suite = Benchmark.Suite()
  suite.add('walk-sync', function () {
    walkSync(root)
  }).add('klaw-sync', function () {
    klawSync(root)
  }).on('error', function (er) {
    return er
  }).on('cycle', function (ev) {
    console.log(String(ev.target))
  }).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  }).run()
}
