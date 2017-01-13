const path = require('path')
const execSync = require('child_process').execSync

const which = require('which')
const vscode = require('vscode')

const getPhantomjsPath = require('./getPhantomjsPath.js')
const isExistsFile = require('./utils/isExistsFile.js')

const showErrorMessage = vscode.window.showErrorMessage

module.exports = () => {
  // if (!checkPhantomjs()) {
  //   getPhantomjsBinary()
  // }
  const phantomPath = getPhantomjsPath()
  if (isExistsFile(phantomPath)) {
    return true
  }

  // which npm
  const npm = checkTool('npm')
  // which node
  const node = checkTool('node')

  // npm rebuild phantomjs-prebuilt
  if (isExistsFile(npm) && isExistsFile(node)) {
    try {
      const std = execSync('npm rebuild phantomjs-prebuilt', { cwd: __dirname })
      console.log(std.toString())
    } catch (e) {
      showErrorMessage('ERROR: "npm rebuild phantomjs-prebuilt"')
      showErrorMessage(e.message)
    }
  } else {
  // node_modules/phantomjs-prebuilt/install.js
    const install = path.join(__dirname, '../node_modules', 'phantomjs-prebuilt', 'install.js').replace(/\\/g, '/')
    try {
      require(install)
    } catch (e) {
      console.error(e.message)
    }
  }

  return true
}

function checkTool(moduleName) {
  let modulePath = ''
  try {
    modulePath = which.sync(moduleName)
  } catch (e) {
    console.warn(e.message)
  }

  return modulePath
}
