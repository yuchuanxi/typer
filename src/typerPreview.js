const vscode = require('vscode')

module.exports = uri => () => vscode.commands.executeCommand('vscode.previewHtml', uri, vscode.ViewColumn.Two, 'Typer Privew').then((success) => {
  // success
  console.log(success)
}, (reason) => {
  vscode.window.showErrorMessage(reason)
})
