const path = require('path')
const fs = require('fs')
const url = require('url')

const vscode = require('vscode')

const isExistsFile = require('./isExistsFile.js')

module.exports = () => {
  let style = ''
  let styles = ''
  let filename = ''
  let i

  // 1. read the style of the vscode.
  filename = path.join(__dirname, '../styles', 'markdown.css')
  style += readCss(filename)

  // 2. read the style of the markdown.styles setting.
  styles = vscode.workspace.getConfiguration('markdown').styles
  if (Array.isArray(styles) && styles.length > 0) {
    for (i = 0; i < styles.length; i++) {
      const href = filename = styles[i]
      const protocol = url.parse(href).protocol
      if (protocol === 'http:' || protocol === 'https:') {
        style += `<link rel="stylesheet" href="${href}" type="text/css">`
      } else if (protocol === 'file:') {
        style += readCss(filename)
      }
    }
  }

  // 3. read the style of the highlight.js.
  const highlightStyle = vscode.workspace.getConfiguration('markdown-pdf').highlightStyle || ''
  const ishighlight = vscode.workspace.getConfiguration('markdown-pdf').highlight
  if (ishighlight) {
    if (highlightStyle) {
      const css = vscode.workspace.getConfiguration('markdown-pdf').highlightStyle || 'github.css'
      filename = path.join(__dirname, 'node_modules', 'highlight.js', 'styles', css)
      style += readCss(filename)
    } else {
      filename = path.join(__dirname, '../styles', 'tomorrow.css')
      style += readCss(filename)
    }
  }

  // 4. read the style of the markdown-pdf.
  filename = path.join(__dirname, '../styles', 'markdown-pdf.css')
  style += readCss(filename)

  // 5. read the style of the markdown-pdf.styles settings.
  styles = vscode.workspace.getConfiguration('markdown-pdf').styles || ''
  if (Array.isArray(styles) && styles.length > 0) {
    for (i = 0; i < styles.length; i++) {
      filename = styles[i]
      style += readCss(filename)
    }
  }

  return style
}

function readCss(filename, encode = 'utf-8') {
  if (filename.length === 0) {
    return ''
  }

  if (filename.indexOf('file://') === 0) {
    if (process.platform === 'win32') {
      filename = filename.replace(/^file:\/\/\//, '')
                 .replace(/^file:\/\//, '')
    } else {
      filename = filename.replace(/^file:\/\//, '')
    }
  }
  if (isExistsFile(filename)) {
    return fs.readFileSync(filename, encode)
  }
  return ''
}
