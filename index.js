const fs = require('fs')
const marked = require('marked')

const sourcePath = 'README.md'
const targetPath = 'index.html'

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
  .pipe(
    s => `<!DOCTYPE html>
<html lang="en">
<head>
<link rel="stylesheet" href="github.css">
<link rel="stylesheet" href="styles.css">
<meta charset="utf-8">
<title>C++ submodule manager</title>
</head>
<body class="markdown-body">
${s}
</body>
</html>`
  )
  .pipe(s => fs.writeFileSync(targetPath, s))
