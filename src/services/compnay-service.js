const { XPathResult, getDOMDocumentFromURL, getTextWithParagraphs } = require('../utils/dom')
const { saveCompany } = require('../db/queries')
const { getNameFromUrl, getIdFromCompanyName, normalizeUrl } = require('../utils/normalizers')
const { RULES } = require('../config/rules')

const processCompany = async (url) => {
  new URL(url) // to make sure URL is valid

  const sourceName = getNameFromUrl(url)
  if (!RULES.hasOwnProperty(sourceName)) throw new Error('Not implemented yet')

  const { document } = await getDOMDocumentFromURL(url)

  const data = {}

  for (let field in RULES[sourceName].company) {
    data[field] = RULES[sourceName].company[field].type === XPathResult.ORDERED_NODE_ITERATOR_TYPE ?
      getTextWithParagraphs(document.evaluate(RULES[sourceName].company[field].xpath, document, null, RULES[sourceName].company[field].type, null)) :
      document.evaluate(RULES[sourceName].company[field].xpath, document, null, RULES[sourceName].company[field].type, null)
  }

  const company = {}
  company.id = getIdFromCompanyName(data.name.stringValue)
  company.name = data.name.stringValue.trim()
  company.name_variants = data.url.stringValue.trim() ? JSON.stringify([
    getNameFromUrl(normalizeUrl(data.url.stringValue.trim()))
  ]) : null
  company.url = data.url.stringValue.trim() ? normalizeUrl(data.url.stringValue.trim()) : null
  company.source_url = url
  company.location = data?.location?.stringValue?.trim() || null
  company.description = data.description || data.descriptionBrandedV1 || data.descriptionBrandedV2 || null
  company.rating_dreamjob = parseFloat(data?.ratingDreamjob?.stringValue?.replace(',', '.')) || null

  return saveCompany(company)
}

module.exports = {
  processCompany,
}
