;(function() {
  'use strict'

  function removeIds(elem) {
    if (elem instanceof Element) {
      elem.removeAttribute('id')
      for (var i = 0, n = elem.childElementCount; i < n; ++i)
        removeIds(elem.children[i])
    }
    return elem
  }

  function addTips() {
    var tips = []

    function headerOf(elem) {
      if (!elem) return null
      if (/^H[1-6]$/.test(elem.tagName)) return elem
      if (elem.previousElementSibling)
        return headerOf(elem.previousElementSibling)
      return headerOf(elem.parentElement)
    }

    function contextOf(elem) {
      if (!elem) return null
      if (/^H[1-6]$/.test(elem.tagName)) return elem
      if (/^(P|LI)$/.test(elem.tagName)) return elem
      return contextOf(elem.parentElement)
    }

    Array.prototype.slice
      .call(document.querySelectorAll('a'))
      .forEach(function(link) {
        var href = link.getAttribute('href')
        if (!href || href[0] !== '#' || href === '#') return
        if (link.onclick) return

        var target = document.querySelector(href)

        var context = contextOf(target)
        if (!context) return

        if (contextOf(link) === context) return

        if (/^(P|LI)$/.test(context.tagName)) {
          var targetHeader = headerOf(context)
          if (!targetHeader) return

          var targetSibling = document.createElement('p')

          var child = context.firstChild
          while (child) {
            targetSibling.appendChild(removeIds(child.cloneNode(true)))
            child = child.nextSibling
          }

          tips.push({
            link: link,
            targetHeader: removeIds(targetHeader.cloneNode(true)),
            targetSibling: targetSibling
          })
        } else {
          var targetHeader = context

          var targetSibling = targetHeader.nextElementSibling
          if (!targetSibling) return
          if (targetSibling.tagName !== 'P') return

          tips.push({
            link: link,
            targetHeader: removeIds(targetHeader.cloneNode(true)),
            targetSibling: removeIds(targetSibling.cloneNode(true))
          })
        }
      })

    tips.forEach(function(args) {
      var preview = document.createElement('div')
      preview.setAttribute('class', 'preview')
      if (args.targetHeader) preview.appendChild(args.targetHeader)
      preview.appendChild(args.targetSibling)
      args.link.setAttribute('class', 'preview-anchor')
      args.link.appendChild(preview)
    })
  }

  window.addEventListener('load', addTips)
})()
