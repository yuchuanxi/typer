// const pug = require('pug')
const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
const url = require('url')
const pug = require('pug')

function isExistsFile(filename) {
  if (filename.length === 0) {
    return false;
  }
  try {
    if (fs.statSync(filename).isFile()) {
      return true;
    }
  } catch (e) {
    console.warn(e.message);
    return false;
  }
}

function readFile(filename, encode) {
  if (filename.length === 0) {
    return '';
  }
  if (!encode && encode !== null) {
    encode = 'utf-8';
  }
  if (filename.indexOf('file://') === 0) {
    if (process.platform === 'win32') {
      filename = filename.replace(/^file:\/\/\//, '')
                 .replace(/^file:\/\//, '');
    } else {
      filename = filename.replace(/^file:\/\//, '');
    }
  }
  if (isExistsFile(filename)) {
    return fs.readFileSync(filename, encode);
  } else {
    return '';
  }
}

function makeCss(filename) {

  return readFile(filename) || ''
}

function readStyles() {
  var style = '';
  var styles = '';
  var filename = '';
  var i;

  // 1. read the style of the vscode.
  filename = path.join(__dirname, '../styles', 'markdown.css');
  style += makeCss(filename);

  // 2. read the style of the markdown.styles setting.
  styles = vscode.workspace.getConfiguration('markdown')['styles'];
  if (Array.isArray(styles) && styles.length > 0) {
    for (i = 0; i < styles.length; i++) {
      var href = filename = styles[i];
      var protocol = url.parse(href).protocol;
      if (protocol === 'http:' || protocol === 'https:') {
        style += '<link rel=\"stylesheet\" href=\"" + href + "\" type=\"text/css\">';
      } else if (protocol === 'file:') {
        style += makeCss(filename);
      }
    }
  }

  // 3. read the style of the highlight.js.
  var highlightStyle = vscode.workspace.getConfiguration('markdown-pdf')['highlightStyle'] || '';
  var ishighlight = vscode.workspace.getConfiguration('markdown-pdf')['highlight'];
  if (ishighlight) {
    if (highlightStyle) {
      var css = vscode.workspace.getConfiguration('markdown-pdf')['highlightStyle'] || 'github.css';
      filename = path.join(__dirname, 'node_modules', 'highlight.js', 'styles', css);
      style += makeCss(filename);
    } else {
      filename = path.join(__dirname, '../styles', 'tomorrow.css');
      style += makeCss(filename);
    }
  }

  // 4. read the style of the markdown-pdf.
  filename = path.join(__dirname, '../styles', 'markdown-pdf.css');
  style += makeCss(filename);

  // 5. read the style of the markdown-pdf.styles settings.
  styles = vscode.workspace.getConfiguration('markdown-pdf')['styles'] || '';
  if (Array.isArray(styles) && styles.length > 0) {
    for (i = 0; i < styles.length; i++) {
      filename = styles[i];
      style += makeCss(filename);
    }
  }

  return style;
}

exports.makeHtml = (content) => {
  const style = readStyles()

  const filename = path.join(__dirname, '../template', 'template.pug')
  // get file name
  const title = path.basename(vscode.window.activeTextEditor.document.fileName).split('.')[0]

  return pug.renderFile(filename, {
    title,
    style,
    content,
  })
}
