const vscode = require('vscode')

module.exports = class TyperDocumentContentProvider {
  constructor(context) {
    this._onDidChange = new vscode.EventEmitter()
    this.document = ''
    this.update = this.unthrottledUpdate
    this.context = context
  }

  provideTextDocumentContent(uri, token) {
    return '1111'
  }

  get onDidChange() {
    return this._onDidChange.event
  }

  unthrottledUpdate(uri) {
    const editor = vscode.window.activeTextEditor
    const text = editor.document.getText()
    const selStart = editor.document.offsetAt(editor.selection.anchor)
    const tempDocument = '222'

    this.document = tempDocument

    this._onDidChange.fire(uri)
  }
}
