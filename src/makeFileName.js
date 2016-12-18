const path = require('path')
const vscode = require('vscode')


module.exports = (type) => {
  const mdfilename = vscode.window.activeTextEditor.document.fileName
  const ext = path.extname(mdfilename)

  return mdfilename.replace(ext, `.${type}`)
}
