const path = require('path')
const fs = require('fs')

const vscode = require('vscode')

const isExistsFile = require('./src/isExistsFile.js')
const convertMdToHtml = require('./src/convertMdToHtml.js')
const convertMdToPdf = require('./src/convertMdToPdf.js')

const register = (name, fn) => {
  context.subscriptions.push(vscode.commands.registerCommand(`extension.${name}`, () => fn()))
}

exports.activate = (context) => {
  console.log('typer activated!!!')
  if (!checkPhantomjs()) {
    getPhantomjsBinary()
  }

  register('markdown-html', convertMdToHtml)
  register('markdown-pdf', convertMdToPdf)
}

// this method is called when your extension is deactivated
exports.deactivate = () => {}

function checkPhantomjs () {
  var phantomPath = getPhantomjsPath();
  if (isExistsFile(phantomPath)) {
    return true;
  } else {
    return false;
  }
}
function getPhantomjsPath () {
  var phantomPath = process.platform === 'win32' ?
    path.join(__dirname, 'node_modules', 'phantomjs-prebuilt', 'lib', 'phantom', 'bin', 'phantomjs.exe') :
    path.join(__dirname, 'node_modules', 'phantomjs-prebuilt', 'lib', 'phantom', 'bin', 'phantomjs');

  return phantomPath;
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

// for './node_modules/phantomjs-prebuilt/install.js'
// 'An extension called process.exit() and this was prevented.'
process.exit = function() {
  console.info('process.exit');
};