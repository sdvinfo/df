const path = require('path')
const hashFile = require('hash-file')
const walk = require('walk')
let files = [],
  hashes = [],
  duplicates = []

async function fileHandler(root, fileStat, next) {
  let file = path.normalize(root + path.sep + fileStat.name)
  let stat = {
    size: fileStat.size,
    ctime: fileStat.ctime,
    atime: fileStat.atime,
    birthtime: fileStat.birthtime,
    name: fileStat.name,
    uid: fileStat.uid,
    gid: fileStat.gid
  }
  // console.log('file: ', file)
  let hash = await hashFile(file)
  // console.log('hash: ', hash)
  if (hashes.indexOf(hash) !== -1 && duplicates.indexOf(file) === -1) {
    duplicates.push(hash)
  }
  // console.log('duplicates: ', JSON.stringify(duplicates))
  files.push({
    path: file,
    stat: stat,
    hash: hash
  })
  hashes.push(hash)
  // console.log('files: ', JSON.stringify(files))
  // console.log()
  // console.log('hashes: ', JSON.stringify(hashes))
  next()
}

function getDuplicates(hash) {
  return files
    .filter((file) => {
      return file.hash === hash
    })
    .map((file) => {
      return {
        path: file.path,
        stat: file.stat
      }
    })
}

function endHandler(cb) {
  let temp = {}
  duplicates.forEach((file) => {
    temp[file] = getDuplicates(file)
  })

  // console.log('files: ', JSON.stringify(files))

  if (typeof cb === 'function') {
    cb(temp)
  }
}

function find(path, filters, cb) {
  let walker
  let fl = filters || []
  let options = {
    followLinks: false,
    filters: fl
  }
  files = []
  hashes = []
  duplicates = []
  // walker = walk.walkSync(path, options)
  walker = walk.walk(path, options)
  walker.on('names', function(root, nodeNamesArray) {
    nodeNamesArray.sort(function(a, b) {
      if (a > b) return 1
      if (a < b) return -1
      return 0
    })
  })
  walker.on('file', fileHandler)
  walker.on('end', endHandler.bind(this, cb))
  // console.log('all done: ', walker)
}

export default {
  find: find
}
