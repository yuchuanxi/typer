'use strict';
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const url = require('url');

const makeHtml = require('./src/makeHtml.js').makeHtml

function activate(context) {

  init();
  let disposable_command = vscode.commands.registerCommand('extension.markdown-html', () => MarkdownHTML())
  context.subscriptions.push(disposable_command)
  let disposable_commandPDF = vscode.commands.registerCommand('extension.markdown-pdf', () => MarkdownPdf())
  context.subscriptions.push(disposable_commandPDF)

  // let isConvertOnSave = vscode.workspace.getConfiguration('markdown-pdf')['convertOnSave']
  // if (isConvertOnSave) {
  //   let disposable_onsave = vscode.workspace.onDidSaveTextDocument(() => MarkdownPdfOnSave())
  //   context.subscriptions.push(disposable_onsave)
  // }
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;


function MarkdownHTML() {
  // check active window
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showWarningMessage('No active Editor!');
    return;
  }
  // check markdown mode
  const mode = editor.document.languageId
  if (mode != 'markdown') {
    vscode.window.showWarningMessage('It is not a markdown mode!');
    return;
  }
  // get current file name
  var mdfilename = editor.document.fileName;
  var ext = path.extname(mdfilename);
  if (!isExistsFile(mdfilename)) {
    if (editor.document.isUntitled) {
      vscode.window.showWarningMessage('Please save the file!');
      return;
    }
    vscode.window.showWarningMessage('File name does not get!');
    return;
  }

  // start convert
  vscode.window.setStatusBarMessage('$(markdown) Converting...');
  // convert markdown to html
  var content = convertMarkdownToHtml(mdfilename);

  // make html
  var html = makeHtml(content);

  // var type = vscode.workspace.getConfiguration('markdown-pdf')['type'] || 'pdf';
  // var types = ['html', 'pdf', 'png', 'jpeg'];
  var filename = '';
  // export html
  filename = mdfilename.replace(ext, '.html');
  exportHtml(html, filename);
}
function MarkdownPdf() {
  // check active window
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showWarningMessage('No active Editor!');
    return;
  }
  // check markdown mode
  const mode = editor.document.languageId
  if (mode != 'markdown') {
    vscode.window.showWarningMessage('It is not a markdown mode!');
    return;
  }
  // get current file name
  var mdfilename = editor.document.fileName;
  var ext = path.extname(mdfilename);
  if (!isExistsFile(mdfilename)) {
    if (editor.document.isUntitled) {
      vscode.window.showWarningMessage('Please save the file!');
      return;
    }
    vscode.window.showWarningMessage('File name does not get!');
    return;
  }

  // start convert
  vscode.window.setStatusBarMessage('$(markdown) Converting...');
  // convert markdown to html
  var content = convertMarkdownToHtml(mdfilename);

  // make html
  var html = makeHtml(content);

  var type = vscode.workspace.getConfiguration('markdown-pdf')['type'] || 'pdf';
  var types = ['html', 'pdf', 'png', 'jpeg'];
  var filename = '';
  // export html
  if (type == 'html') {
    filename = mdfilename.replace(ext, '.' + type);
    exportHtml(html, filename);
  // export pdf/png/jpeg
  } else if (types.indexOf(type) >= 1) {
    filename = mdfilename.replace(ext, '.' + type);
    exportPdf(html, filename);

    // var debug = vscode.workspace.getConfiguration('markdown-pdf')['debug'] || false;
    // if (debug) {
    //   var f = path.parse(mdfilename);
    //   filename = path.join(f.dir, f.name + '_debug.html');
    //   exportHtml(html, filename);
    // }
  } else {
    vscode.window.showErrorMessage('ERROR: Supported formats: html, pdf, png, jpeg.');
    return;
  }
}

// function MarkdownPdfOnSave () {
//   var editor = vscode.window.activeTextEditor;
//   var mode = editor.document.languageId;
//   if (mode != 'markdown') {
//     return;
//   }
//   MarkdownPdf();
// }
/*
 * convert markdown to html (markdown-it)
 */
function convertMarkdownToHtml(filename) {

  var hljs = require('highlight.js');
  var breaks = vscode.workspace.getConfiguration('markdown-pdf')['breaks'];
  try {
    var md = require('markdown-it')({
      html: true,
      breaks: breaks,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return '<pre class="hljs"><code>' +
                hljs.highlight(lang, str, true).value +
                '</code></pre>';
          } catch (e) {
            vscode.window.showErrorMessage('ERROR: markdown-it:highlight');
            vscode.window.showErrorMessage(e.message);
          }
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
      }
    });
  } catch (e) {
    vscode.window.showErrorMessage('ERROR: require(\'markdown-it\')');
    vscode.window.showErrorMessage(e.message);
  }

  // convert the img src of the markdown
  var type = vscode.workspace.getConfiguration('markdown-pdf')['type'] || 'pdf';
  var cheerio = require('cheerio');
  var defaultRender = md.renderer.rules.image;
  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    var token = tokens[idx];
    var href = token.attrs[token.attrIndex('src')][1];
    if (type === 'html') {
      href = decodeURIComponent(href).replace(/("|')/g, '');
    } else {
      href = convertImgPath(href, filename);
    }
    token.attrs[token.attrIndex('src')][1] = href;
    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self);
  };

  if (type !== 'html') {
    // convert the img src of the html
    md.renderer.rules.html_block = function (tokens, idx) {
      var html = tokens[idx].content;
      var $ = cheerio.load(html);
      $('img').each(function () {
        var src = $(this).attr('src');
        var href = convertImgPath(src, filename);
        $(this).attr('src', href);
      });
      return $.html();
    };
  }

  // checkbox
  md.use(require('markdown-it-checkbox'));

  // emoji
  // var f = vscode.workspace.getConfiguration('markdown-pdf')['emoji'];
  // if (f) {
  //   var emojies_defs = require(path.join(__dirname, 'data', 'emoji.json'));
  //   try {
  //     var options = {
  //       defs: emojies_defs
  //     };
  //   } catch (e) {
  //     vscode.window.showErrorMessage('ERROR: markdown-it-emoji:options');
  //     vscode.window.showErrorMessage(e.message);
  //   }
  //   md.use(require('markdown-it-emoji'), options);
  //   md.renderer.rules.emoji = function(token, idx) {
  //     var emoji = token[idx].markup;
  //     var emojipath = path.join(__dirname, 'node_modules', 'emoji-images', 'pngs', emoji + '.png');
  //     var emojidata = readFile(emojipath, null).toString('base64');
  //     if (emojidata) {
  //       return '<img class="emoji" alt="' + emoji + '" src="data:image/png;base64,' + emojidata + '" />';
  //     } else {
  //       return ':' + emoji + ':';
  //     }
  //   };
  // }

  return md.render(fs.readFileSync(filename, 'utf-8'));
}
/*
 * make html
 */
// function makeHtml(content) {
//   // read styles
//   const style = readStyles()

//   // read template
//   var filename = path.join(__dirname, 'template', 'template.html');
//   var template = readFile(filename);

//   // compile template
//   var mustache = require('mustache');

//   return mustache.render(template, {
//     style,
//     content,
//   });
// }

/*
 * export a html to a html file
 */
function exportHtml(data, filename) {
  fs.writeFile(filename, data, 'utf-8', function(err) {
    if (err) {
      vscode.window.showErrorMessage('ERROR: exportHtml()');
      vscode.window.showErrorMessage(err.message);
      return;
    }
    vscode.window.showInformationMessage('OUTPUT: ' + filename);
    vscode.window.setStatusBarMessage('');
  });
}

function getPhantomjsPath () {
  var phantomPath = process.platform === 'win32' ?
    path.join(__dirname, 'node_modules', 'phantomjs-prebuilt', 'lib', 'phantom', 'bin', 'phantomjs.exe') :
    path.join(__dirname, 'node_modules', 'phantomjs-prebuilt', 'lib', 'phantom', 'bin', 'phantomjs');

  return phantomPath;
}
function checkPhantomjs () {
  var phantomPath = getPhantomjsPath();
  if (isExistsFile(phantomPath)) {
    return true;
  } else {
    return false;
  }
}
/*
 * export a html to a pdf file (html-pdf)
 */
function exportPdf(data, filename) {

  const phantomPath = getPhantomjsPath();

  if (!isExistsFile(phantomPath)) { // lose phantomJs
    vscode.window.showErrorMessage('ERROR: phantomjs binary does not exist: ' + phantomPath);
    return;
  }

  var htmlpdf = require('html-pdf');
  try {
    var options = {
      "format": vscode.workspace.getConfiguration('markdown-pdf')['format'] || 'A4',
      "orientation": vscode.workspace.getConfiguration('markdown-pdf')['orientation'] || 'portrait',
      "border": {
        "top":  vscode.workspace.getConfiguration('markdown-pdf')['border']['top'] || '',
        "right": vscode.workspace.getConfiguration('markdown-pdf')['border']['right'] || '',
        "bottom": vscode.workspace.getConfiguration('markdown-pdf')['border']['bottom'] || '',
        "left": vscode.workspace.getConfiguration('markdown-pdf')['border']['left'] || ''
      },
      "type": vscode.workspace.getConfiguration('markdown-pdf')['type'] || 'pdf',
      "quality": vscode.workspace.getConfiguration('markdown-pdf')['quality'] || 90,
      "header": {
        "height": vscode.workspace.getConfiguration('markdown-pdf')['header']['height'] || '',
        "contents": vscode.workspace.getConfiguration('markdown-pdf')['header']['contents'] || ''
      },
      "footer": {
        "height": vscode.workspace.getConfiguration('markdown-pdf')['footer']['height'] || '',
        "contents": vscode.workspace.getConfiguration('markdown-pdf')['footer']['contents'] || ''
      },
      "phantomPath": phantomPath
    };
  } catch (e) {
    vscode.window.showErrorMessage('ERROR: html-pdf:options');
    vscode.window.showErrorMessage(e.message);
  }

  try {
    htmlpdf.create(data, options).toFile(filename, function(error) {
      if (error) {
        vscode.window.showErrorMessage('ERROR: htmlpdf.create()');
        vscode.window.showErrorMessage(error.message);
        return;
      }
      vscode.window.showInformationMessage('OUTPUT: ' + filename);
      vscode.window.setStatusBarMessage('');
    });
  } catch (e) {
    vscode.window.showErrorMessage('ERROR: htmlpdf.create()');
    vscode.window.showErrorMessage(e.message);
  }
}

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



function convertImgPath(src, filename) {
  var href = decodeURIComponent(src);
  href = href.replace(/("|')/g, '')
         .replace(/\\/g, '/');
  var protocol = url.parse(href).protocol;
  if (protocol === 'file:' && href.indexOf('file:///') !==0) {
    return href.replace(/^file:\/\//, 'file:///');
  } else if (protocol === 'file:') {
    return href;
  } else if (!protocol || path.isAbsolute(href)) {
    href = path.resolve(path.dirname(filename), href).replace(/\\/g, '/');
    if (href.indexOf('//') === 0) {
      return 'file:' + href;
    } else if (href.indexOf('/') === 0) {
      return 'file://' + href;
    } else {
      return 'file:///' + href;
    }
  } else {
    return src;
  }
}





function getPhantomjsBinary() {
  // which npm
  var which = require('which');
  var npm = '';
  try {
    npm = which.sync('npm');
  } catch (e) {
    console.warn(e.message);
  }

  // which node
  var node = '';
  try {
    node = which.sync('node');
  } catch (e) {
    console.warn(e.message);
  }

  // npm rebuild phantomjs-prebuilt
  var execSync = require('child_process').execSync;
  if (isExistsFile(npm) && isExistsFile(node)) {
    try {
      var std = execSync('npm rebuild phantomjs-prebuilt', {cwd: __dirname});
      console.log(std.toString());
    } catch (e) {
      vscode.window.showErrorMessage('ERROR: "npm rebuild phantomjs-prebuilt"');
      vscode.window.showErrorMessage(e.message);
    }
  } else {
  // node_modules/phantomjs-prebuilt/install.js
    var install = path.join(__dirname, 'node_modules', 'phantomjs-prebuilt', 'install.js').replace(/\\/g, '/');
    try {
      if (isExistsFile(install)) {
        require(install);
      }
    } catch (e) {
      console.error(e.message);
    }
  }

  if (checkPhantomjs()) {
    return;
  }
}

function init () {
  if (!checkPhantomjs()) {
    getPhantomjsBinary();
  }
}

// for './node_modules/phantomjs-prebuilt/install.js'
// 'An extension called process.exit() and this was prevented.'
process.exit = function() {
  console.info('process.exit');
};