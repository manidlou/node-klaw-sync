'use strict'
const path = require('path')
let fs
try {
  fs = require('graceful-fs')
} catch (e) {
  fs = require('fs')
}

function klawSync (dir, opts, ls) {
  function procPath (pathItem) {
    const stat = fs.lstatSync(pathItem)
    const item = {path: pathItem, stats: stat}
    if (stat.isDirectory()) {
      if (opts.filter) {
        if (opts.filter(item) && !opts.nodir) {
          ls.push(item)
          ls = klawSync(pathItem, opts, ls)
        } else {
          if (!opts.noRecurseOnFailedFilter) ls = klawSync(pathItem, opts, ls)
        }
      } else {
        if (!opts.nodir) ls.push(item)
        ls = klawSync(pathItem, opts, ls)
      }
    } else {
      if (opts.filter) {
        if (opts.filter(item) && !opts.nofile) ls.push(item)
      } else {
        if (!opts.nofile) ls.push(item)
      }
    }
  }

  opts = opts || {}
  ls = ls || []
  dir = path.resolve(dir)
  const files = fs.readdirSync(dir)
  for (let i = 0; i < files.length; i += 1) {
    // here dir already resolved, we use string concatenation since
    // showed better performance than path.join() and path.resolve()
    let pathItem
    if (path.sep === '/') pathItem = dir + '/' + files[i]
    else pathItem = dir + '\\' + files[i]
    procPath(pathItem)
  }
  return ls
}

module.exports = klawSync
