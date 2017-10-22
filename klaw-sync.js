'use strict'

const fs = require('graceful-fs')
const path = require('path')

function klawSync (dir, opts, ls) {
  if (!ls) {
    opts = opts || {}
    ls = []
    dir = path.resolve(dir)
  }
  const paths = fs.readdirSync(dir).map(p => dir + path.sep + p)
  for (var i = 0; i < paths.length; i += 1) {
    const pi = paths[i]
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
  return ls
}

module.exports = klawSync
