const fs = require('fs')

module.exports = (filename) => {
  if (filename.length === 0) {
    return false
  }
  try {
    if (fs.statSync(filename).isFile()) {
      return true
    }
  } catch (e) {
    console.warn(e.message)
    return false
  }
}
