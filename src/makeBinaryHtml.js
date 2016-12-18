const vscode = require('vscode')

const isExistsFile = require('./isExistsFile.js')
const markdownToHtml = require('./markdownToHtml')
const makeHtml = require('./makeHtml.js')

const vscodeWindow = vscode.window
const showWarningMessage = vscodeWindow.showWarningMessage
const setStatusBarMessage = vscodeWindow.setStatusBarMessage

module.exports = () => {
  const editor = vscodeWindow.activeTextEditor
  // check active window
  if (!editor) {
    showWarningMessage('No active Editor!')
    return
  }
  const editorDocument = editor.document
  // check markdown mode
  const mode = editorDocument.languageId
  if (mode !== 'markdown') {
    showWarningMessage('It is not a markdown mode!')
    return
  }
  // get current file name
  const mdfilename = editorDocument.fileName
  if (!isExistsFile(mdfilename)) {
    if (editorDocument.isUntitled) {
      showWarningMessage('Please save the file!')
      return
    }
    showWarningMessage('File name does not get!')
    return
  }
  // start convert
  setStatusBarMessage('$(markdown) Converting...')
  // convert markdown to html
  const content = markdownToHtml(mdfilename)

  // return binary html
  return makeHtml(content)
}
