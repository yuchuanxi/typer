const vscode = require('vscode')
const hljs = require('highlight.js')
const MarkdownIt = require('markdown-it')
const markdownItNamedHeaders = require('markdown-it-named-headers')
// const markdownItCheckbox = require('markdown-it-checkbox')

const showErrorMessage = vscode.window.showErrorMessage
const md = new MarkdownIt({
  html: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`
      } catch (e) {
        showErrorMessage('ERROR: markdown-it:highlight')
        showErrorMessage(e.message)
      }
    }

    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})
md.use(markdownItNamedHeaders, {})

function addLineNumberRenderer(tokens, idx, options, env, self) {
  const token = tokens[idx]
  if (token.level === 0 && token.map && token.map.length) {
    token.attrSet('data-line', token.map[0])
  }
  return self.renderToken(tokens, idx, options, env, self)
}

md.renderer.rules.paragraph_open = addLineNumberRenderer
md.renderer.rules.heading_open = addLineNumberRenderer

module.exports = (markdownFragment) => {
  // console.log(1)
  // console.log(1)
  return md.render(markdownFragment)
}
