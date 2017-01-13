const vscode = require('vscode')

const createHtml = require('./createHtml.js')

module.exports = class TyperDocumentContentProvider {
  constructor(context) {
    this.onDidChangeEvent = new vscode.EventEmitter()
    this.markdownFragment = '' // preview html's document
    this.update = this.unthrottledUpdate
    this.context = context
    // 初始化的时候获取一次markdown text
    this.convertMarkdown()

    console.log('TyperDocumentContentProvider.constructor')
  }

  provideTextDocumentContent(uri, token) {
    return createHtml(this.markdownFragment)
  }

  get onDidChange() {
    return this.onDidChangeEvent.event
  }

  unthrottledUpdate(uri) {
    this.convertMarkdown()
    this.onDidChangeEvent.fire(uri)
  }

  convertMarkdown() {
    console.log('TyperDocumentContentProvider#convertMarkdown')

    this.markdownFragment = vscode.window.activeTextEditor.document.getText()
  }
}
