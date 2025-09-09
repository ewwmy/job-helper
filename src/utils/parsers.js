const { normalizeCurrency } = require('./normalizers')
const { getISODateFromString, getISODateFromAgoString } = require('./datetime')
const {
  VACANCY_SALARY_PERIOD_YEAR,
  VACANCY_SALARY_PERIOD_MONTH,
  VACANCY_SALARY_PERIOD_WEEK,
  VACANCY_SALARY_PERIOD_DAY,
  VACANCY_SALARY_PERIOD_HOUR,
} = require('../config/constants')

const parseTimeType = (sourceName, value) => {
  const FULL_TIME = 'full-time'
  const PART_TIME = 'part-time'
  const CONTRACT = 'contract'
  const PROJECT = 'project'
  if (sourceName === 'hh') {
    if (value.match(/полная занятость/i))
      return FULL_TIME
    else if (value.match(/частичная занятость/i))
      return PART_TIME
    else if (value.match(/контракт/i))
      return CONTRACT
    else if (value.match(/проект/i))
      return PROJECT
    else
      return null
  } else if (sourceName === 'linkedin') {
    if (value.match(/полный рабочий день|full/i))
      return FULL_TIME
    else if (value.match(/частичн|part/i))
      return PART_TIME
    else if (value.match(/договор|contract/i))
      return CONTRACT
    else if (value.match(/проект|project/i))
      return PROJECT
    else
      return null
  } else {
    throw new Error('Not implemented yet')
  }
}

const parseWorkType = (sourceName, value) => {
  const ON_SITE = 'on-site'
  const HYBRID = 'hybrid'
  const REMOTE = 'remote'
  if (sourceName === 'hh') {
    if (value.match(/удалённо/i))
      return REMOTE
    else if (value.match(/гибрид/i))
      return HYBRID
    else if (value.match(/на месте работодателя/i))
      return ON_SITE
    else
      return null
  } else if (sourceName === 'linkedin') {
      return null
  } else {
    throw new Error('Not implemented yet')
  }
}

const parseSalary = (sourceName, value) => {
  value = value?.trim()
  const result = {
    from: null,
    to: null,
    currency: null,
    period: null,
  }
  if (sourceName === 'hh') {
      if (value.match(/от[\s\t]+\d/i) && value.match(/до[\s\t]+\d/)) {
        const regex = /(от)\s+(\d+(?:[ \u00A0\u202F]\d+)*)\s+(до)\s+(\d+(?:[ \u00A0\u202F]\d+)*)\s*([^\d\s]+)/i
        const matches = value.match(regex)
        result.from = matches[2] ? Number(matches[2].trim().replace(' ', '')) : null
        result.to = matches[4] ? Number(matches[4].trim().replace(' ', '')) : null
        result.currency = matches[5] ? normalizeCurrency(matches[5].trim().toLocaleLowerCase()) : null
      } else if (value.match(/от[\s\t]+\d/i)) {
        const regex = /(от)\s+(\d+(?:[ \u00A0\u202F]\d+)*)\s*([^\d\s]+)/i
        const matches = value.match(regex)
        result.from = matches[2] ? Number(matches[2].trim().replace(' ', '')) : null
        result.currency = matches[3] ? normalizeCurrency(matches[3].trim().toLocaleLowerCase()) : null
      } else if (value.match(/до[\s\t]+\d/)) {
        const regex = /(до)\s+(\d+(?:[ \u00A0\u202F]\d+)*)\s*([^\d\s]+)/i
        const matches = value.match(regex)
        result.to = matches[2] ? Number(matches[2].trim().replace(' ', '')) : null
        result.currency = matches[3] ? normalizeCurrency(matches[3].trim().toLocaleLowerCase()) : null
      } else {
        const regex = /(\d+(?:[ \u00A0\u202F]\d+)*)\s*([^\d\s]+)/i
        const matches = value.match(regex)
        result.from = matches[1] ? Number(matches[1].trim().replace(' ', '')) : null
        result.to = result.from
        result.currency = matches[2] ? normalizeCurrency(matches[2].trim().toLocaleLowerCase()) : null
      }
      result.period =
        value.toLocaleLowerCase().match(/год|year/i) ?
          VACANCY_SALARY_PERIOD_YEAR :
          value.toLocaleLowerCase().match(/месяц|month/i) ?
            VACANCY_SALARY_PERIOD_MONTH :
            value.toLocaleLowerCase().match(/недел|week/i) ?
              VACANCY_SALARY_PERIOD_WEEK :
              value.toLocaleLowerCase().match(/день|day/i) ?
                VACANCY_SALARY_PERIOD_DAY :
                value.toLocaleLowerCase().match(/час|hour/i) ?
                  VACANCY_SALARY_PERIOD_HOUR :
        null
      return result
  } else if (sourceName === 'linkedin') {
    const regexRu = /^(\d+(?:[,\. \u00A0\u202F]\d+)*)\s*([^\d\s]+)(\s*-\s*(\d+(?:[,\. \u00A0\u202F]\d+)*))?\s*([^\d\s]+)\s(.*)$/i
    const regexEn = /^([^\d\s]+)\s*(\d+(?:[,\. \u00A0\u202F]\d+)*)(\s*(\/|per\s+)(\w+))?(\s*-\s*([^\d\s]+)\s*(\d+(?:[,\. \u00A0\u202F]\d+)*)\s*(\/|per\s+)(\w+))?$/i

    let matches

    if (matches = value.match(regexRu)) {
      result.from = matches[1] ? parseMoneyAmount(matches[1].trim()) : null
      result.to = matches[4] ? parseMoneyAmount(matches[4].trim()) : null
      result.currency = matches[2] ? normalizeCurrency(matches[2].trim().toLocaleLowerCase()) : null
      result.period =
        matches[6] ?
          matches[6].toLocaleLowerCase().match(/год|year/i) ?
            VACANCY_SALARY_PERIOD_YEAR :
            matches[6].toLocaleLowerCase().match(/месяц|month/i) ?
              VACANCY_SALARY_PERIOD_MONTH :
              matches[6].toLocaleLowerCase().match(/недел|week/i) ?
                VACANCY_SALARY_PERIOD_WEEK :
                matches[6].toLocaleLowerCase().match(/день|day/i) ?
                  VACANCY_SALARY_PERIOD_DAY :
                  matches[6].toLocaleLowerCase().match(/час|hour/i) ?
                  VACANCY_SALARY_PERIOD_HOUR :
                  null :
          null
    } else if (matches = value.match(regexEn)) {
      result.from = matches[2] ? parseMoneyAmount(matches[2].trim()) : null
      result.to = matches[8] ? parseMoneyAmount(matches[8].trim()) : null
      result.currency = matches[1] ? normalizeCurrency(matches[1].trim().toLocaleLowerCase()) : null
      result.period =
        matches[10] ?
          matches[10].toLocaleLowerCase().match(/yr|year/i) ?
            VACANCY_SALARY_PERIOD_YEAR :
            matches[10].toLocaleLowerCase().match(/mo|mnd|mnth|month/i) ?
              VACANCY_SALARY_PERIOD_MONTH :
              matches[10].toLocaleLowerCase().match(/w|week/i) ?
                VACANCY_SALARY_PERIOD_WEEK :
                matches[10].toLocaleLowerCase().match(/d|day/i) ?
                  VACANCY_SALARY_PERIOD_DAY :
                  matches[10].toLocaleLowerCase().match(/hr|hour/i) ?
                  VACANCY_SALARY_PERIOD_HOUR :
                  null :
          null
    } else {
      return null
    }

    return result
  } else {
    throw new Error('Not implemented yet')
  }
}

const parseMoneyAmount = (value) => {
  if (!value) return null

  let str = value.replace(/[^\d.,]/g, '').trim()

  if (!str) return null

  const commaMatch = str.match(/,(\d{2})$/)
  const dotMatch = str.match(/\.(\d{2})$/)

  if (commaMatch) {
    str = str.replace(/\./g, '')
    str = str.replace(',', '.')
  } else if (dotMatch) {
    str = str.replace(/,/g, '')
  } else {
    str = str.replace(/[.,]/g, '')
  }

  const result = parseFloat(str)
  return Number.isNaN(result) ? null : result
}

const extractDateFromPublished = (sourceName, value) => {
  if (sourceName === 'hh') {
    const regex = /Вакансия опубликована ((\d+) ([а-яА-Я]+) (\d+))/i
    if (regex.test(value))
      return getISODateFromString(value)
    return null
  } else if (sourceName === 'linkedin') {
    return getISODateFromAgoString(value)
  } else {
    throw new Error('Not implemented yet')
  }
}

const extractDateFromArchived = (sourceName, value) => {
  if (sourceName === 'hh') {
    const regex = /В архиве с ((\d+) ([а-яА-Я]+) (\d+))/i
    if (regex.test(value))
      return getISODateFromString(value)
    return null
  } else if (sourceName === 'linkedin') {
    return null
  } else {
    throw new Error('Not implemented yet')
  }
}

module.exports = {
  parseTimeType,
  parseWorkType,
  parseSalary,
  extractDateFromPublished,
  extractDateFromArchived,
}
