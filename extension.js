const vscode = require('vscode')

const Provider = require('./src/TyperDocumentContentProvider.js')
const typerPreview = require('./src/typerPreview.js')

const initPhantomjs = require('./src/initPhantomjs.js')
const convertMdToHtml = require('./src/convertMdToHtml.js')
const convertMdToPdf = require('./src/convertMdToPdf.js')

const register = (context, name, fn) => {
  context.subscriptions.push(vscode.commands.registerCommand(`extension.${name}`, () => fn()))
}

exports.activate = (context) => {
  // Preview markdown
  const previewUri = vscode.Uri.parse('typer-preview://yuchuanxi/typer-preview')
  const provider = new Provider(context)
  const registredProvider = vscode.workspace.registerTextDocumentContentProvider('typer-preview', provider)

  context.subscriptions.push(registredProvider)
  register(context, 'markdown-preview', typerPreview(previewUri))

  // An event that is emitted when a text document is changed.
  vscode.workspace.onDidChangeTextDocument((e) => {
    if (e.document === vscode.window.activeTextEditor.document) {
      provider.update(previewUri)
    }
  })
  // An event which fires when the selection in an editor has changed.
  vscode.window.onDidChangeTextEditorSelection((e) => {
    if (e.textEditor === vscode.window.activeTextEditor) {
      provider.update(previewUri)
    }
  })

  // Export html/pdf
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
