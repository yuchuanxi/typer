const path = require('path')

const vscode = require('vscode')

const isExistsFile = require('./src/isExistsFile.js')
const markdownToHtml = require('./src/markdownToHtml')
const makeHtml = require('./src/makeHtml.js')
const exportHtml = require('./src/exportHtml.js')

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
  var mdfilename = editorDocument.fileName
  var ext = path.extname(mdfilename)
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
  var content = markdownToHtml(mdfilename)

  // make html
  var html = makeHtml(content)

  // var type = vscode.workspace.getConfiguration('markdown-pdf')['type'] || 'pdf';
  // var types = ['html', 'pdf', 'png', 'jpeg'];
  var filename = ''
  // export html
  filename = mdfilename.replace(ext, '.html')
  exportHtml(html, filename)
}
