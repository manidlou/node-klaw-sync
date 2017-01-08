'use strict'
var path = require('path')
var mm = require('multimatch')
var fs
try {
  fs = require('graceful-fs')
} catch (e) {
  fs = require('fs')
}

function walkSync (dir, opts, list) {
  var files
  opts = opts || {}
  list = list || []
  try {
    files = fs.readdirSync(dir)
    if (opts.ignore) {
      files = files.filter(function (i) { return mm(files, opts.ignore).indexOf(i) < 0 })
    }
  } catch (er) {
    return er
  }
  files.forEach(function (file) {
    var nestedPath
    var stat
    if (path.sep === '/') {
      nestedPath = dir + '/' + file
    } else {
      nestedPath = dir + '\\' + file
    }
    stat = fs.lstatSync(nestedPath)
    if (stat.isDirectory()) {
      if (!opts.files) {
        list.push({path: nestedPath, stats: stat})
      }
      list = walkSync(nestedPath, opts, list)
    } else {
      if (!opts.dirs) {
        list.push({path: nestedPath, stats: stat})
      }
    }
  })
  return list
}

module.exports = walkSync
