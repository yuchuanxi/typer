/*
 * export a html to a pdf file (html-pdf)
 */
const path = require('path')

const vscode = require('vscode')
const htmlpdf = require('html-pdf')

const isExistsFile = require('./isExistsFile.js')
const getPhantomjsPath = require('./getPhantomjsPath.js')

const showErrorMessage = vscode.window.showErrorMessage
const showInformationMessage = vscode.window.showInformationMessage
const setStatusBarMessage = vscode.window.setStatusBarMessage
const vscodeConfigurations = vscode.workspace.getConfiguration('markdown-pdf')

module.exports = (binaryData, filename) => {
  const phantomPath = getPhantomjsPath()

  if (!isExistsFile(phantomPath)) { // lose phantomJs
    showErrorMessage(`ERROR: phantomjs binary does not exist: ${phantomPath}`)
    return
  }

  let options = null
  try {
    options = {
      format: vscodeConfigurations.format || 'A4',
      orientation: vscodeConfigurations.orientation || 'portrait',
      border: {
        top: vscodeConfigurations.border.top || '',
        right: vscodeConfigurations.border.right || '',
        bottom: vscodeConfigurations.border.bottom || '',
        left: vscodeConfigurations.border.left || '',
      },
      type: vscodeConfigurations.type || 'pdf',
      quality: vscodeConfigurations.quality || 90,
      header: {
        height: vscodeConfigurations.header.height || '',
        contents: vscodeConfigurations.header.contents || '',
      },
      footer: {
        height: vscodeConfigurations.footer.height || '',
        contents: vscodeConfigurations.footer.contents || '',
      },
      phantomPath,
    }
  } catch (e) {
    showErrorMessage('ERROR: html-pdf:options')
    showErrorMessage(e.message)
  }

  htmlpdf.create(binaryData, options).toFile(filename, (err) => {
    if (err) {
      showErrorMessage('ERROR: htmlpdf.create()')
      showErrorMessage(err.message)
      return
    }

    showInformationMessage(`OUTPUT: ${filename}`)
    setStatusBarMessage('')
  })
}
