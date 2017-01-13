const path = require('path')

const vscode = require('vscode')
const pug = require('pug')

const convertMarkdownToHtmlFragment = require('./convertMarkdownToHtmlFragment.js')
// TODO: 修改样式拼接方式
const readStyles = require('./readStyles.js')

module.exports = (markdownFragment) => {
  const style = readStyles()
  const filePath = path.join(__dirname, '../../template', 'template.pug')
  // get file name
  const title = path.basename(vscode.window.activeTextEditor.document.fileName).split('.')[0]

  const htmlFragment = convertMarkdownToHtmlFragment(markdownFragment)

  return pug.renderFile(filePath, {
    title,
    style,
    content: htmlFragment,
  })
}
