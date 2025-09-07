const { normalizeCurrency } = require('./normalizers')
const { getISODateFromString } = require('./datetime')

const parseTimeType = (sourceName, value) => {
  const FULL_TIME = 'full-time'
  const PART_TIME = 'part-time'
  const CONTRACT = 'contract'
  const PROJECT = 'project'
  if (sourceName === 'hh') {
    if (value.includes('Полная занятость') || value.includes('полная занятость'))
      return FULL_TIME
    else if (value.includes('Частичная занятость') || value.includes('частичная занятость'))
      return PART_TIME
    else if (value.includes('Контракт') || value.includes('контракт'))
      return CONTRACT
    else if (value.includes('Проект') || value.includes('проект'))
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
    if (value.includes('удалённо'))
      return REMOTE
    else if (value.includes('гибрид'))
      return HYBRID
    else if (value.includes('на месте работодателя'))
      return ON_SITE
    else
      return null
  } else {
    throw new Error('Not implemented yet')
  }
}

const parseSalary = (sourceName, value) => {
  const result = {
    from: null,
    to: null,
    currency: null,
  }
  if (sourceName === 'hh') {
    if (value.includes('месяц')) {
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
      return result
    } else {
      return null
    }

  } else {
    throw new Error('Not implemented yet')
  }
}

const extractDateFromPublished = (sourceName, value) => {
  if (sourceName === 'hh') {
    const regex = /Вакансия опубликована ((\d+) ([а-яА-Я]+) (\d+))/i
    if (regex.test(value))
      return getISODateFromString(value)
    return null
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
