const { JSDOM } = require('jsdom')
const { window } = new JSDOM()
const { XPathResult } = window

const { getHtmlFrom } = require('./network')
const { sanitizeHTML } = require('./normalizers')

const getDOMDocumentFromURL = async (url) => {
  const html = await getHtmlFrom(url)
  const dom = new JSDOM(sanitizeHTML(html))
  return { dom, document: dom.window.document }
}

const extractTextWithBreaks = (el) => {
  let result = []

  function traverse(node) {
    if (node.nodeType === 3) { // текстовый узел
      const text = node.nodeValue.replace(/\s+/g, ' ').trim()
      if (text) result.push(text)
    } else if (node.nodeType === 1) { // элемент
      const tag = node.tagName.toLowerCase()
      const blockTags = ['p', 'div', 'section', 'br', 'li', 'ul', 'ol', 'table', 'tr']

      for (let child of node.childNodes) {
        traverse(child)
      }

      // После блочного элемента добавляем перенос
      if (blockTags.includes(tag)) {
        result.push('\n')
      }
    }
  }

  traverse(el)

  // Склеиваем и убираем лишние пустые строки
  return result.join(' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{2,}/g, '\n\n')
    .trim()
}

const getTextWithParagraphs = (iterator) => {
  let node
  let parts = []
  while ((node = iterator.iterateNext())) {
    parts.push(extractTextWithBreaks(node))
  }
  return parts.join('\n\n').trim()
}

module.exports = {
  getDOMDocumentFromURL,
  extractTextWithBreaks,
  getTextWithParagraphs,
  XPathResult,
}
