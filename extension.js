const vscode = require('vscode')

const Provider = require('./src/utils/TyperDocumentContentProvider.js')
const typerPreview = require('./src/typerPreview.js')

const initPhantomjs = require('./src/initPhantomjs.js')
const exportMarkdown = require('./src/exportMarkdown.js')

const pasteAction = require('./src/pasteAction.js')

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
    console.log('workspace.onDidChangeTextDocument')
  })
  // An event which fires when the selection in an editor has changed.
  vscode.window.onDidChangeTextEditorSelection((e) => {
    if (e.textEditor === vscode.window.activeTextEditor) {
      provider.update(previewUri)
    }
    console.log('window.onDidChangeTextEditorSelection')
  })

  // Export html/pdf
  initPhantomjs()

  register(context, 'markdown-html', exportMarkdown('html'))
  // register(context, 'markdown-pdf', exportMarkdown('pdf'))
  register(context, 'markdown-paste', pasteAction)
}

// this method is called when your extension is deactivated
exports.deactivate = () => {}

// for './node_modules/phantomjs-prebuilt/install.js'
// 'An extension called process.exit() and this was prevented.'
process.exit = () => {
  console.info('process.exit')
}
