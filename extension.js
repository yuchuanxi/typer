const vscode = require('vscode')

const initPhantomjs = require('./src/initPhantomjs.js')
const convertMdToHtml = require('./src/convertMdToHtml.js')
const convertMdToPdf = require('./src/convertMdToPdf.js')

const register = (context, name, fn) => {
  context.subscriptions.push(vscode.commands.registerCommand(`extension.${name}`, () => fn()))
}

exports.activate = (context) => {
  initPhantomjs()

  register(context, 'markdown-html', convertMdToHtml)
  register(context, 'markdown-pdf', convertMdToPdf)
}

// this method is called when your extension is deactivated
exports.deactivate = () => {}

// for './node_modules/phantomjs-prebuilt/install.js'
// 'An extension called process.exit() and this was prevented.'
process.exit = () => {
  console.info('process.exit')
}
