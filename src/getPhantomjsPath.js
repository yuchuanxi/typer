const path = require('path')

module.exports = () => {
  const phantomName = process.platform === 'win32' ? 'phantomjs.exe' : 'phantomjs'

  return path.join(__dirname, '../node_modules', 'phantomjs-prebuilt', 'lib', 'phantom', 'bin', phantomName)
}
