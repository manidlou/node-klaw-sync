'use strict'
var path = require('path')
var mm = require('micromatch')
var fs
try {
  fs = require('graceful-fs')
} catch (e) {
  fs = require('fs')
}

function _procPath (dir, pathItem, opts, list) {
  var nestedPath
  var stat
  // here since dir already resolved, we use string concatenation
  // which showed faster performance than path.join() and path.resolve()
  if (path.sep === '/') {
    nestedPath = dir + '/' + pathItem
  } else {
    nestedPath = dir + '\\' + pathItem
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
  dir = path.resolve(dir)
  try {
    files = fs.readdirSync(dir)
    if (opts.ignore) {
      ignore = mm(files, opts.ignore)
    }
  } catch (er) {
    throw er
  }

  for (var i = 0; i < files.length; i += 1) {
    var file = files[i]
    if (ignore.length > 0) {
      if (ignore.indexOf(file) === -1) _procPath(dir, file, opts, list)
    } else {
      _procPath(dir, file, opts, list)
    }
  }
  return list
}

module.exports = walkSync
