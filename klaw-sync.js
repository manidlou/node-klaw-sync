'use strict'
var path = require('path')
var mm = require('multimatch')
var fs
try {
  fs = require('graceful-fs')
} catch (e) {
  fs = require('fs')
}

function _procPath (dir, file, opts, list) {
  var nestedPath
  var stat
  // use string concatenation which is faster than
  // path.join() and path.resolve()
  if (path.sep === '/') {
    nestedPath = dir + '/' + file
  } else {
    nestedPath = dir + '\\' + file
  }
  stat = fs.lstatSync(nestedPath)
  if (stat.isDirectory()) {
    if (!opts.nodir) {
      list.push({path: nestedPath, stats: stat})
    }
    list = walkSync(nestedPath, opts, list)
  } else {
    if (!opts.nofile) {
      list.push({path: nestedPath, stats: stat})
    }
  }
}

function walkSync (dir, opts, list) {
  var files
  var ignore = []
  opts = opts || {}
  list = list || []
  try {
    files = fs.readdirSync(dir)
    if (opts.ignore) {
      ignore = mm(files, opts.ignore)
    }
  } catch (er) {
    return er
  }
  files.forEach(function (file) {
    if (ignore.length <= 0) {
      _procPath(dir, file, opts, list)
    } else {
      if (ignore.indexOf(file) < 0) {
        _procPath(dir, file, opts, list)
      }
    }
  })
  return list
}

module.exports = walkSync
