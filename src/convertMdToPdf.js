const vscode = require('vscode')

const makeFileName = require('./makeFileName.js')
const makeBinaryHtml = require('./makeBinaryHtml.js')
const exportHtml = require('./exportHtml.js')
const exportPdf = require('./exportPdf.js')

const vscodeWindow = vscode.window
const showErrorMessage = vscodeWindow.showErrorMessage
const vscodeConfigurations = vscode.workspace.getConfiguration('markdown-pdf')

module.exports = () => {
  const html = makeBinaryHtml()

  const type = vscodeConfigurations.type || 'pdf'
  const types = ['html', 'pdf', 'png', 'jpeg']
  const fileName = makeFileName(type)

  if (type === 'html') { // export html
    exportHtml(html, fileName)
  } else if (types.indexOf(type) >= 1) { // export pdf/png/jpeg
    exportPdf(html, fileName)
  } else {
    showErrorMessage('ERROR: Supported formats: html, pdf, png, jpeg.')
  }
}
