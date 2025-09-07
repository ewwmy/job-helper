const { XPathResult, getDOMDocumentFromURL, getTextWithParagraphs } = require('../utils/dom')
const { getISODateTime } = require('../utils/datetime')
const { saveCompany, saveVacancy } = require('../db/queries')
const { getNameFromUrl, getIdFromCompanyName, normalizeUrl } = require('../utils/normalizers')
const {
  parseSalary,
  parseTimeType,
  parseWorkType,
  extractDateFromPublished,
  extractDateFromArchived
} = require('../utils/parsers')
const { RULES } = require('../config/rules')
const {
  VACANCY_STATUS_DRAFT,
  VACANCY_STATUS_APPLIED,
  VACANCY_STATUS_PROPOSED
} = require('../config/constants')

const processVacancy = async (url, withCompany = false, status = VACANCY_STATUS_DRAFT) => {
  const sourceName = getNameFromUrl(url)
  if (!RULES.hasOwnProperty(sourceName)) throw new Error('Not implemented yet')

  const { document } = await getDOMDocumentFromURL(url)

  const data = {}

  for (let field in RULES[sourceName].vacancy) {
    data[field] = RULES[sourceName].vacancy[field].type === XPathResult.ORDERED_NODE_ITERATOR_TYPE ?
      getTextWithParagraphs(document.evaluate(RULES[sourceName].vacancy[field].xpath, document, null, RULES[sourceName].vacancy[field].type, null)) :
      document.evaluate(RULES[sourceName].vacancy[field].xpath, document, null, RULES[sourceName].vacancy[field].type, null)
  }

  let savedCompanyId = null

  if (withCompany) {
    const parsedUrl = new URL(url)
    const parsedCompanyUrl = new URL(parsedUrl.origin + data.companyUrl.stringValue)
    const preparedCompanyUrl = parsedCompanyUrl.origin + parsedCompanyUrl.pathname
    savedCompanyId = await processCompany(preparedCompanyUrl)
  }

  const salaryParsed = parseSalary(sourceName, data.salary.stringValue)

  const vacancy = {}

  vacancy.status_id = status
  vacancy.date_first_contact = null

  if (status === VACANCY_STATUS_APPLIED || status === VACANCY_STATUS_PROPOSED) {
    vacancy.date_first_contact = getISODateTime()
  }

  vacancy.company_id = savedCompanyId || null
  vacancy.name = data.name.stringValue.trim()
  vacancy.salary_from = salaryParsed?.from
  vacancy.salary_to = salaryParsed?.to
  vacancy.currency = salaryParsed?.currency
  vacancy.time_type_id = parseTimeType(sourceName, data.timeType.stringValue) || null
  vacancy.work_type_id = parseWorkType(sourceName, data.workType.stringValue) || null
  vacancy.location = data.address.stringValue || null
  vacancy.source_id = sourceName
  vacancy.description = data.head + '\n\n' + (data.body || data.bodyBranded) + '\n\n' + 'Ключевые навыки:\n\n' + data.skills + '\n\n' + data.published.stringValue
  vacancy.url = url
  vacancy.date_publication = extractDateFromPublished(sourceName, data.published.stringValue) || null
  vacancy.date_archived = extractDateFromArchived(sourceName, data.archived.stringValue) || null

  return saveVacancy(vacancy)
}

const processCompany = async (url) => {
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
  company.location = data.location.stringValue || null
  company.description = data.description || data.descriptionBrandedV1 || data.descriptionBrandedV2 || null
  company.rating_dreamjob = parseFloat(data.ratingDreamjob.stringValue.replace(',', '.')) || null

  return saveCompany(company)
}

module.exports = {
  processVacancy,
  processCompany,
}
