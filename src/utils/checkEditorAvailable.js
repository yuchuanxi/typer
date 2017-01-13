const vscode = require('vscode')

const isExistsFile = require('./isExistsFile.js')

const vscodeWindow = vscode.window
const showWarningMessage = vscodeWindow.showWarningMessage

module.exports = (isExport) => {
  const editor = vscodeWindow.activeTextEditor
  // check active window
  if (!editor) {
    showWarningMessage('No active Editor!')
    return false
  }
  // check markdown mode
  const editorDocument = editor.document
  const mode = editorDocument.languageId
  if (mode !== 'markdown') {
    showWarningMessage('It is not a markdown document!')
    return false
  }
  // get current file name
  if (isExport) {
    const mdfilename = editorDocument.fileName
    if (!isExistsFile(mdfilename)) {
      if (editorDocument.isUntitled) {
        showWarningMessage('Please save the file!')
        return false
      }
      showWarningMessage('File name does not get!')
      return false
    }
  }

  return true
}
