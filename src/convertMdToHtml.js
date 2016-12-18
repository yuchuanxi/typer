const makeFileName = require('./makeFileName.js')
const makeBinaryHtml = require('./makeBinaryHtml.js')
const exportHtml = require('./exportHtml.js')

module.exports = () => {
  const html = makeBinaryHtml()
  const fileName = makeFileName('html')
  exportHtml(html, fileName)
}
