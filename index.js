const fs = require('fs')
const marked = require('marked')

const sourcePath = 'README.md'
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

fs.readFileSync(sourcePath)
  .toString()
  .pipe(s => marked(String(s)))
  .replace(/ id="a-[^"]*"/g, '')
  .replace(/ +$/gm, '')
  .replace(/<code class="language-([a-z]*)">/g, '<code class="hljs lang-$1">')
  .pipe(
    s => `<!DOCTYPE html>
<html lang="en">
<head>
<link rel="stylesheet" type="text/css" href="github.css">
<link rel="stylesheet" type="text/css" href="styles.css">
<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${hljsVersion}/styles/${hljsStyle}.min.css">
<meta charset="utf-8">
<title>C++ submodule manager</title>
</head>
<body class="markdown-body">
${s}
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${hljsVersion}/highlight.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${hljsVersion}/languages/bash.min.js"></script>
<script type="text/javascript" src="init-hljs.js"></script>
</body>
</html>`
  )
  .pipe(s => fs.writeFileSync(targetPath, s))
