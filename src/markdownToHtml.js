/*
 * convert markdown to html (markdown-it)
 */
const path = require('path')
const url = require('url')
const fs = require('fs')

const vscode = require('vscode')
const hljs = require('highlight.js')
const cheerio = require('cheerio')
const markdownIt = require('markdown-it')
const markdownItCheckbox = require('markdown-it-checkbox')

const showErrorMessage = vscode.window.showErrorMessage
const vscodeConfigurations = vscode.workspace.getConfiguration('markdown-pdf')

module.exports = (mdName) => {
  const breaks = vscodeConfigurations.breaks
  const md = markdownIt({
    html: true,
    breaks,
    highlight,
  })

  // convert the img src of the markdown
  const type = vscodeConfigurations.type || 'pdf'

  const defaultRender = md.renderer.rules.image
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    let href = token.attrs[token.attrIndex('src')][1]
    if (type === 'html') {
      href = decodeURIComponent(href).replace(/("|')/g, '')
    } else {
      href = convertImgPath(href, mdName)
    }
    token.attrs[token.attrIndex('src')][1] = href
    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self)
  }

  if (type !== 'html') {
    // convert the img src of the html
    md.renderer.rules.html_block = (tokens, idx) => {
      const html = tokens[idx].content
      const $ = cheerio.load(html)
      $('img').each(() => {
        const src = $(this).attr('src')
        const href = convertImgPath(src, mdName)
        $(this).attr('src', href)
      })
      return $.html()
    }
  }

  // checkbox
  md.use(markdownItCheckbox)

  return md.render(fs.readFileSync(mdName, 'utf-8'))
}

function highlight(str, lang) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`
    } catch (e) {
      showErrorMessage('ERROR: markdown-it:highlight')
      showErrorMessage(e.message)
    }
  }

  return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
}

function convertImgPath(src, filename) {
  let href = decodeURIComponent(src)
  href = href.replace(/("|')/g, '')
         .replace(/\\/g, '/')
  const protocol = url.parse(href).protocol
  if (protocol === 'file:' && href.indexOf('file:///') !== 0) {
    return href.replace(/^file:\/\//, 'file:///')
  } else if (protocol === 'file:') {
    return href
  } else if (!protocol || path.isAbsolute(href)) {
    href = path.resolve(path.dirname(filename), href).replace(/\\/g, '/')
    if (href.indexOf('//') === 0) {
      return `file:${href}`
    } else if (href.indexOf('/') === 0) {
      return `file://${href}`
    }
    return `file:///${href}`
  }
  return src
}
