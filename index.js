const fs = require('fs')
const marked = require('marked')

const sourcePath = 'index.md'
const targetPath = 'index.html'

const hljsStyle = 'googlecode'
const hljsVersion = '9.12.0'

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
})

Object.prototype.pipe = function(fn) {
  return fn(this)
}

const esc = s => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

const externalLink = '<i class="fas fa-xs fa-external-link-alt"></i>'

const html = fs
  .readFileSync(sourcePath)
  .toString()
  .pipe(s => marked(String(s)))
  .replace(/ id="a-[^"]*"/g, '')
  .replace(/ +$/gm, '')
  .replace(
    /<a href="(http[^"]*)">(([^<]|<[^/]|<[/][^a])*)<[/]a>/g,
    (match, href, content) =>
      content.startsWith('<img ')
        ? `<a target="_blank" href="${href}">${content}</a>`
        : `<a target="_blank" href="${href}">${content} ${externalLink}</a>`
  )
  .replace(/<code class="language-([a-z]*)">/g, '<code class="hljs lang-$1">')
  .pipe(
    s => `<!DOCTYPE html>
<html lang="en">
<head>
<link rel="stylesheet" type="text/css" href="github.css">
<link rel="stylesheet" type="text/css" href="styles.css">
<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${hljsVersion}/styles/${hljsStyle}.min.css">
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css" integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay" crossorigin="anonymous">
<meta charset="utf-8">
<title>C++ submodule manager</title>
</head>
<body class="markdown-body">
${s}
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${hljsVersion}/highlight.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${hljsVersion}/languages/bash.min.js"></script>
<script type="text/javascript" src="init-hljs.js"></script>
<script type="text/javascript" src="tooltips.js"></script>
</body>
</html>`
  )

fs.writeFileSync(targetPath, html)

const idRE = /\bid\s*=\s*"([^"]+)"/g
const ids = new Map()
for (;;) {
  const m = idRE.exec(html)
  if (!m) break
  if (ids.has(m[1])) console.warn(`Duplicate id '${m[1]}'`)
  ids.set(m[1], 1)
}

const hhrefRE = /\bhref="#([^"]+)"/g
for (;;) {
  const m = hhrefRE.exec(html)
  if (!m) break
  if (!ids.has(m[1]))
    console.warn(`Target of internal link '${m[1]}' does not exist.`)
}
