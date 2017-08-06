'use strict'
const fs = require('graceful-fs')
const path = require('path')

function klawSync (dir, opts, ls) {
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

  function procPath (pi) {
    const st = fs.lstatSync(pi)
    const item = {path: pi, stats: st}
    if (st.isDirectory()) {
      if (opts.filter) {
        if (opts.filter(item) && !opts.nodir) {
          ls.push(item)
          ls = klawSync(pi, opts, ls)
        } else {
          if (!opts.noRecurseOnFailedFilter) ls = klawSync(pi, opts, ls)
        }
      } else {
        if (!opts.nodir) ls.push(item)
        ls = klawSync(pi, opts, ls)
      }
    } else {
      if (opts.filter) {
        if (opts.filter(item) && !opts.nofile) ls.push(item)
      } else {
        if (!opts.nofile) ls.push(item)
      }
    }
  }
}

module.exports = klawSync
