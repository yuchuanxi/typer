const path = require('path')

const vscode = require('vscode')
const pug = require('pug')

const readStyles = require('./readStyles.js')

module.exports = (content) => {
  const style = readStyles()
  const filePath = path.join(__dirname, '../template', 'template.pug')
  // get file name
  const title = path.basename(vscode.window.activeTextEditor.document.fileName).split('.')[0]

  return pug.renderFile(filePath, {
    title,
    style,
    content,
  })
}
