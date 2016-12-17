const path = require('path')

const vscode = require('vscode')

const isExistsFile = require('./src/isExistsFile.js')
const markdownToHtml = require('./src/markdownToHtml')
const makeHtml = require('./src/makeHtml.js')
const exportPdf = require('./src/exportPdf.js')

const vscodeWindow = vscode.window
const showWarningMessage = vscodeWindow.showWarningMessage
const showErrorMessage = vscodeWindow.showErrorMessage
const setStatusBarMessage = vscodeWindow.setStatusBarMessage
const vscodeConfigurations = vscode.workspace.getConfiguration('markdown-pdf')

module.exports = () => {
  // check active window
  const editor = vscodeWindow.activeTextEditor
  if (!editor) {
    showWarningMessage('No active Editor!');
    return;
  }
  // check markdown mode
  const mode = editor.document.languageId
  if (mode !== 'markdown') {
    showWarningMessage('It is not a markdown mode!');
    return;
  }
  // get current file name
  var mdfilename = editor.document.fileName;
  var ext = path.extname(mdfilename);
  if (!isExistsFile(mdfilename)) {
    if (editor.document.isUntitled) {
      showWarningMessage('Please save the file!');
      return;
    }
    showWarningMessage('File name does not get!');
    return;
  }

  // start convert
  setStatusBarMessage('$(markdown) Converting...');
  // convert markdown to html
  var content = markdownToHtml(mdfilename);

  // make html
  var html = makeHtml(content);

  var type =vscodeConfigurations'type'] || 'pdf';
  var types = ['html', 'pdf', 'png', 'jpeg'];
  var filename = '';
  // export html
  if (type == 'html') {
    // filename = mdfilename.replace(ext, '.' + type);
    // exportHtml(html, filename);
  // export pdf/png/jpeg
  } else if (types.indexOf(type) >= 1) {
    filename = mdfilename.replace(ext, '.' + type);
    exportPdf(html, filename);

    // var debug = vscodeConfigurations['debug'] || false;
    // if (debug) {
    //   var f = path.parse(mdfilename);
    //   filename = path.join(f.dir, f.name + '_debug.html');
    //   exportHtml(html, filename);
    // }
  } else {
    showErrorMessage('ERROR: Supported formats: html, pdf, png, jpeg.');
    return;
  }
}
