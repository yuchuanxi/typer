const vscode = require('vscode')

const checkEditorAvailable = require('./utils/checkEditorAvailable.js')

module.exports = uri => () => {
  if (!checkEditorAvailable()) {
    return false
  }

  return vscode.commands.executeCommand('vscode.previewHtml', uri, vscode.ViewColumn.Two, 'Typer Privew').then((success) => {
    // success
    console.log('typerPreview success', success)
  }, (reason) => {
    vscode.window.showErrorMessage(reason)
  })
}
