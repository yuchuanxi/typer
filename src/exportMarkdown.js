const path = require('path')
const fs = require('fs')

const vscode = require('vscode')
const htmlpdf = require('html-pdf')

const getPhantomjsPath = require('./getPhantomjsPath.js')
const isExistsFile = require('./utils/isExistsFile.js')
const checkEditorAvailable = require('./utils/checkEditorAvailable.js')
const createHtml = require('./utils/createHtml.js')

const vscodeWindow = vscode.window
const showErrorMessage = vscode.window.showErrorMessage
const showInformationMessage = vscode.window.showInformationMessage
const setStatusBarMessage = vscodeWindow.setStatusBarMessage


const phantomPath = getPhantomjsPath()
let phantomJsDisabled = false
if (!isExistsFile(phantomPath)) { // lose phantomJs
  phantomJsDisabled = true
}
const vscodeConfigurations = vscode.workspace.getConfiguration('typer')
const options = {
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

const exportCallback = (file) => {
  return (err) => {
    if (err) {
      showErrorMessage('ERROR: ./src/exportHtml.js')
      showErrorMessage(err.message)
      return
    }
    showInformationMessage(`OUTPUT: ${file}`)
    setStatusBarMessage('')
  }
}


module.exports = (type) => {
  return () => {
    if (!checkEditorAvailable(true)) {
      return false
    }
    // start convert
    setStatusBarMessage('$(Typer) Converting...')

    const mdFileName = vscodeWindow.activeTextEditor.document.fileName
    const mdFileExtName = path.extname(mdFileName)
    const markdownFragment = fs.readFileSync(mdFileName, 'utf-8')
    const html = createHtml(markdownFragment)

    // export html
    if (type === 'html') {
      const fileName = mdFileName.replace(mdFileExtName, '.html')
      fs.writeFile(fileName, html, 'utf-8', exportCallback(fileName))
    // export pdf
    } else if (type === 'pdf') {
      if (phantomJsDisabled) {
        showErrorMessage(`ERROR: phantomjs binary does not exist: ${phantomPath}`)
        return false
      }
      const fileName = mdFileName.replace(mdFileExtName, '.pdf')
      htmlpdf.create(html, options).toFile(fileName, exportCallback(fileName))
    }

    return true
  }
}
