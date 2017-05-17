const path = require('path')
const fs = require('fs')
const spawn = require('child_process').spawn

const vscode = require('vscode')
const copyPaste = require('copy-paste')

const checkEditorAvailable = require('./utils/checkEditorAvailable.js')

// function getImageSaveFolder(clipboardContext) {
function getImageSaveFolder() {
  // let imageName = ''
  // if (!clipboardContext) {
  //   imageName = `${Date.now()}.png`
  // }

  const editor = vscode.window.activeTextEditor
  const fileUri = editor.document.uri
  const filePath = fileUri.fsPath
  const folderPath = path.dirname(filePath)

  return path.join(folderPath, './images')
}

function createImageSaveFolder(folderPath) {
  return new Promise((resolve, reject) => {
    // const folder = path.dirname(folderPath)

    fs.exists(folderPath, (exists) => {
      if (exists) {
        resolve()
        return
      }

      fs.mkdir(folderPath, (err) => {
        if (err) {
          reject(err)
          return
        }

        resolve()
      })
    })
  })
}

function saveClipboardImage(folder, clipboardContext, callback) {
  let imageName = clipboardContext
  if (!clipboardContext) {
    imageName = `${Date.now()}.png`
  }

  const imageAbsolutePath = path.join(folder, imageName)

  const platform = process.platform
  if (platform === 'darwin') {
    const scriptPath = path.join(__dirname, './utils/shell/mac.applescript')
    const ascript = spawn('osascript', [scriptPath, imageAbsolutePath])
    ascript.on('exit', (code, signal) => {
      console.log('exit', code, signal)
    })
    ascript.stdout.on('data', (data) => {
      console.log(111, data)
      callback(data.toString().trim())
    })
  }
}

function renderFilePath(docPath, imagePath) {
  const imagePath2 = path.relative(path.dirname(docPath), imagePath)

  return `![${imagePath2}](${imagePath2})`
}

module.exports = () => {
  if (!checkEditorAvailable()) {
    return false
  }
  console.log('pasteActioin')
  // copyPaste.copy('some text', (a) => {
  //   console.log(a)
  // })
  // get image name, if exist
  copyPaste.paste((placeholder, clipboardContext) => {
    const folder = getImageSaveFolder(clipboardContext)
    // create folder if folder not exist
    createImageSaveFolder(folder).then(() => {
      // save image
      saveClipboardImage(folder, clipboardContext, (imagePath) => {
        console.log('222', imagePath)
        if (!imagePath) {
          console.log('333', 'empty')
          return false
        }

        if (imagePath === 'no image') {
          vscode.window.showInformationMessage('There is not a image in clipboard.')
          return false
        }

        const imagePath2 = renderFilePath(vscode.window.activeTextEditor.document.uri.fsPath, imagePath)
        copyPaste.copy(imagePath2, () => {
          vscode.commands.executeCommand('editor.action.clipboardPasteAction').then((aaa) => {
            console.log('after editor.action.clipboardPasteAction')
            console.log('aaa', aaa)
          })
        })

        return true
      })
    }).catch((err) => {
      vscode.window.showErrorMessage(`Failed make folder. ${err}`)
    })

    // console.log(clipboardContext)
    // copyPaste.copy('some text', (a) => {
    //   console.log(a)
    //   vscode.commands.executeCommand('editor.action.clipboardPasteAction').then((aaa) => {
    //     console.log('after editor.action.clipboardPasteAction')
    //     console.log('aaa', aaa)
    //   })
    // })
  })

  // vscode.commands.executeCommand('editor.action.clipboardPasteAction').then((aaa) => {
  //   console.log('after editor.action.clipboardPasteAction')
  //   console.log('aaa', aaa)
  // })

  return true
}
