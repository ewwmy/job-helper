const { XPathResult, getDOMDocumentFromURL, getTextWithParagraphs } = require('../utils/dom')
const { getISODateTime, DATETIME_TYPE_DATE } = require('../utils/datetime')
const { saveVacancy, updateVacancyStatus } = require('../db/queries')
const { processCompany } = require('./compnay-service')
const { getNameFromUrl } = require('../utils/normalizers')
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
  new URL(url) // to make sure URL is valid

  status = status === VACANCY_STATUS_APPLIED ||
  status === VACANCY_STATUS_PROPOSED ?
    status :
    VACANCY_STATUS_DRAFT

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

  if (withCompany && data.companyUrl.stringValue) {
    const parsedUrl = new URL(url)

    let isCompanyURLAbsolute
    let parsedCompanyUrl
    let preparedCompanyUrl

    try {
      new URL(data.companyUrl.stringValue)
      isCompanyURLAbsolute = true
    } catch {
      isCompanyURLAbsolute = false
    }

    if (isCompanyURLAbsolute) {
      parsedCompanyUrl = new URL(data.companyUrl.stringValue)
    } else {
      parsedCompanyUrl = new URL(parsedUrl.origin + data.companyUrl.stringValue)
    }

    preparedCompanyUrl = parsedCompanyUrl.origin + parsedCompanyUrl.pathname

    savedCompanyId = await processCompany(preparedCompanyUrl)
  }

  const salaryParsed = parseSalary(sourceName, data.salary.stringValue.trim())

  const vacancy = {}

  vacancy.status_id = status
  vacancy.date_first_contact = null

  if (status === VACANCY_STATUS_APPLIED || status === VACANCY_STATUS_PROPOSED) {
    vacancy.date_first_contact = getISODateTime()
  }

  if (status === VACANCY_STATUS_APPLIED) {
    vacancy.is_contacted_by_me = 1
  } else if (status === VACANCY_STATUS_PROPOSED) {
    vacancy.is_contacted_by_me = 0
  }

  vacancy.company_id = savedCompanyId || null
  vacancy.name = data.name.stringValue.trim()
  vacancy.salary_from = salaryParsed?.from
  vacancy.salary_to = salaryParsed?.to
  vacancy.salary_currency = salaryParsed?.currency
  vacancy.salary_period_id = salaryParsed?.period
  vacancy.time_type_id = parseTimeType(sourceName, data?.timeType?.stringValue) || null
  vacancy.work_type_id = parseWorkType(sourceName, data?.workType?.stringValue) || null
  vacancy.location = data?.address?.stringValue?.trim() || null
  vacancy.source_id = sourceName
  vacancy.description = data.head + '\n\n' + (data.body || data.bodyBranded) + '\n\n' + 'Ключевые навыки:\n\n' + data.skills + '\n\n' + data.published.stringValue
  vacancy.url = url
  vacancy.date_publication = extractDateFromPublished(sourceName, data?.published?.stringValue?.trim()) || null
  vacancy.date_archived = extractDateFromArchived(sourceName, data?.archived?.stringValue?.trim()) || null

  return saveVacancy(vacancy)
}

const updateStatus = (url, statusId, dateStatusChange = getISODateTime(null, DATETIME_TYPE_DATE)) => {
  new URL(url) // to make sure URL is valid
  statusId = statusId?.trim()
  return updateVacancyStatus(url, statusId, dateStatusChange)
}

module.exports = {
  processVacancy,
  updateStatus
}
