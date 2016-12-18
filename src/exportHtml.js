/*
 * export a html to a html file
 */
const fs = require('fs')

const vscode = require('vscode')

module.exports = (data, file) => {
  fs.writeFile(file, data, 'utf-8', (err) => {
    if (err) {
      vscode.window.showErrorMessage('ERROR: ./src/exportHtml.js::exportHtml()')
      vscode.window.showErrorMessage(err.message)
      return
    }
    vscode.window.showInformationMessage(`OUTPUT: ${file}`)
    vscode.window.setStatusBarMessage('')
  })
}
