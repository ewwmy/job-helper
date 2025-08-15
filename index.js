#!/usr/bin/env node

const db = require('better-sqlite3')('/home/andrew/Документы/job-search.db')
const { URL } = require('node:url')
const https = require('node:https')

const jsdom = require('jsdom')

const { JSDOM } = jsdom

const RULES = {
  hh: {
    vacancy: {
      name: '//*/h1[@data-qa="vacancy-title"]',
      salary: '//*/span[contains(@data-qa, "vacancy-salary-compensation")]',
      timeType: '//*/div[@data-qa="common-employment-text"]',
      workType: '//*/p[@data-qa="work-formats-text"]',
      companyName: '//*/a[@data-qa="vacancy-company-name"]/span',
      head: '//*[@id="HH-React-Root"]/div/div[4]/div[1]/div/div/div/div/div[1]/div[1]/div[1]/div',
      body: '//*/div[@class="g-user-content"]',
      skills: '//*/ul[contains(@class, "vacancy-skill-list")]',
      address: '//*/span[@data-qa="vacancy-view-raw-address"]',
      published: '//*/p[@class="vacancy-creation-time-redesigned"]',
      archived: '//*/div[@data-qa="vacancy-title-archived-text"]',
    },
    company: {
      name: '//*/h1/span[@data-qa="company-header-title-name"]',
      url: '//*/span[@data-qa="sidebar-company-site-text"]',
      location: '//*/div[@class="employer-sidebar"]/div/div[@class="employer-sidebar-block"][1]',
      description: '//*/div[@data-qa="company-description-text"]',
      ratingDreamjob: '//*/div[contains(@class, "EmployerReviewsFront")]/div/div/div/div/div/div/div/div[1]/div/div/div/div[1]',
    }
  },
  // linkedin: {}
}

const transliterate = (value) => {
  const matches = [
    { match: 'а', replace: 'a', },
    { match: 'б', replace: 'b', },
    { match: 'в', replace: 'v', },
    { match: 'г', replace: 'g', },
    { match: 'д', replace: 'd', },
    { match: 'е', replace: 'e', },
    { match: 'ё', replace: 'yo', },
    { match: 'ж', replace: 'zh', },
    { match: 'з', replace: 'z', },
    { match: 'и', replace: 'i', },
    { match: 'й', replace: 'j', },
    { match: 'к', replace: 'k', },
    { match: 'л', replace: 'l', },
    { match: 'м', replace: 'm', },
    { match: 'н', replace: 'n', },
    { match: 'о', replace: 'o', },
    { match: 'п', replace: 'p', },
    { match: 'р', replace: 'r', },
    { match: 'с', replace: 's', },
    { match: 'т', replace: 't', },
    { match: 'у', replace: 'u', },
    { match: 'ф', replace: 'f', },
    { match: 'х', replace: 'h', },
    { match: 'ц', replace: 'c', },
    { match: 'ч', replace: 'ch', },
    { match: 'ш', replace: 'sh', },
    { match: 'щ', replace: 'sch', },
    { match: 'ъ', replace: '', },
    { match: 'ы', replace: 'y', },
    { match: 'ь', replace: '', },
    { match: 'э', replace: 'e', },
    { match: 'ю', replace: 'ju', },
    { match: 'я', replace: 'ja', },
    { match: 'a', replace: 'a', },
    { match: 'b', replace: 'b', },
    { match: 'c', replace: 'c', },
    { match: 'd', replace: 'd', },
    { match: 'e', replace: 'e', },
    { match: 'f', replace: 'f', },
    { match: 'g', replace: 'g', },
    { match: 'h', replace: 'h', },
    { match: 'i', replace: 'i', },
    { match: 'j', replace: 'j', },
    { match: 'k', replace: 'k', },
    { match: 'l', replace: 'l', },
    { match: 'm', replace: 'm', },
    { match: 'n', replace: 'n', },
    { match: 'o', replace: 'o', },
    { match: 'p', replace: 'p', },
    { match: 'q', replace: 'q', },
    { match: 'r', replace: 'r', },
    { match: 's', replace: 's', },
    { match: 't', replace: 't', },
    { match: 'u', replace: 'u' },
    { match: 'v', replace: 'v', },
    { match: 'w', replace: 'w', },
    { match: 'x', replace: 'x', },
    { match: 'y', replace: 'y', },
    { match: 'z', replace: 'z', },
  ]
  return Array
    .from(String(value))
    .map(char => {
      const match = matches.find(item => item.match === char.toLocaleLowerCase())
      if (match)
        return match.replace
      return '-'
    })
    .join('')
}

const getIdFromCompanyName = (value) => {
  value = normalizeSpaces(value)?.trim()
  return transliterate(value)
}

const getNameFromUrl = (value) => {
  const { host } = new URL(value)
  const matches = host.match(/(www\.)?([^\.]+)/i)
  if (Array.isArray(matches) && matches[2])
    return matches[2]
  return null
}

const getHtmlFrom = async (url) => {
  return new Promise((resolve, reject) => {
    let data
    https.get(url, (res) => {
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        resolve(data)
      })
      res.on('error', (error) => {
        reject(error)
      })
    })
  })
}

const normalizeUrl = (str) => {
  try {
    return new URL(str).href
  } catch {
    return new URL("https://" + str).href
  }
}

const normalizeCurrency = (value) => {
  const currencies = [
    { match: '₽', code: 'RUB' },
    { match: '$', code: 'USD' },
    { match: '€', code: 'EUR' },
    { match: '£', code: 'GBP' },
    { match: '¥', code: 'JPY' },
    { match: '₴', code: 'UAH' },
    { match: '₺', code: 'TRY' },
    { match: '₩', code: 'KRW' },
    { match: '₦', code: 'NGN' },
    { match: '₹', code: 'INR' },
    { match: '₫', code: 'VND' },
    { match: '₵', code: 'GHS' },
    { match: '₲', code: 'PYG' },
    { match: '₡', code: 'CRC' },
    { match: '₸', code: 'KZT' },
    { match: 'сом', code: 'KGS' },
    { match: 'тенге', code: 'KZT' },
    { match: 'лей', code: 'MDL' },
    { match: 'сомони', code: 'TJS' },
    { match: 'манат', code: 'AZN' },
    { match: 'песо', code: 'MXN' },
    { match: 'бат', code: 'THB' },
    { match: 'шекель', code: 'ILS' },
    { match: 'рупия', code: 'IDR' },
    { match: 'драм', code: 'AMD' },
    { match: 'лари', code: 'GEL' },
    { match: 'сомалийский шиллинг', code: 'SOS' },
    { match: 'боливар', code: 'VES' },
    { match: 'динар', code: 'DZD' },
    { match: 'франк', code: 'CHF' },
  ]
  const result = currencies.find(item => item.match === value)
  if (result)
    return result.code
  return null
}

const normalizeSpaces = (value) => {
  return value.replace(/[\u00A0\u202F\t]/gi, ' ')
}

const getISODateFromString = (value) => {
  value = normalizeSpaces(value)

  const regex = /(\d+)\s+([а-яА-Я]+)\s+(\d+)/i
  const matches = value.match(regex)

  if (!matches) return null

  const months = {
    'января': '01',
    'февраля': '02',
    'марта': '03',
    'апреля': '04',
    'мая': '05',
    'июня': '06',
    'июля': '07',
    'августа': '08',
    'сентября': '09',
    'октября': '10',
    'ноября': '11',
    'декабря': '12',
  }
  
  const [dayStr, monthName, yearStr] = [matches[1], matches[2], matches[3]]

  const day = dayStr.padStart(2, '0')
  const month = months[monthName.toLocaleLowerCase()]
  const year = yearStr

  return `${year}-${month}-${day}`
}

const extractDateFromPublished = (value) => {
  value = normalizeSpaces(value)
  const regex = /Вакансия опубликована ((\d+) ([а-яА-Я]+) (\d+))/i
  if (regex.test(value))
    return getISODateFromString(value)
  return null
}

const extractDateFromArchived = (value) => {
  value = normalizeSpaces(value)
  const regex = /В архиве с ((\d+) ([а-яА-Я]+) (\d+))/i
  if (regex.test(value))
    return getISODateFromString(value)
  return null
}

const parseSalary = (sourceName, value) => {
  const result = {
    from: null,
    to: null,
    currency: null,
  }
  if (sourceName === 'hh') {
    if (value.includes('месяц')) {
      value = normalizeSpaces(value)
      if (value.includes('от ') && value.includes('до ')) {
        const regex = /(от)\s+(\d+(?:[ \u00A0\u202F]\d+)*)\s+(до)\s+(\d+(?:[ \u00A0\u202F]\d+)*)\s*([^\d\s]+)/i
        const matches = value.match(regex)
        result.from = matches[2] ? Number(matches[2].trim().replace(' ', '')) : null
        result.to = matches[4] ? Number(matches[4].trim().replace(' ', '')) : null
        result.currency = matches[5] ? normalizeCurrency(matches[5].trim().toLocaleLowerCase()) : null
      } else if (value.includes('от ')) {
        const regex = /(от)\s+(\d+(?:[ \u00A0\u202F]\d+)*)\s*([^\d\s]+)/i
        const matches = value.match(regex)
        result.from = matches[2] ? Number(matches[2].trim().replace(' ', '')) : null
        result.currency = matches[3] ? normalizeCurrency(matches[3].trim().toLocaleLowerCase()) : null
      } else if (value.includes('до ')) {
        const regex = /(до)\s+(\d+(?:[ \u00A0\u202F]\d+)*)\s*([^\d\s]+)/i
        const matches = value.match(regex)
        result.to = matches[2] ? Number(matches[2].trim().replace(' ', '')) : null
        result.currency = matches[3] ? normalizeCurrency(matches[3].trim().toLocaleLowerCase()) : null
      }
      return result
    } else {
      return null
    }

  } else {
    throw new Error('Not implemented yet')
  }
}

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

const getDOMDocumentFromURL = async (url) => {
  const data = await getHtmlFrom(url)
  const dom = new JSDOM(data)
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

const processVacancy = async (url) => {
  const sourceName = getNameFromUrl(url)
  if (!RULES.hasOwnProperty(sourceName)) throw new Error('Not implemented yet')

  const { dom, document } = await getDOMDocumentFromURL(url)

  if (sourceName === 'hh') {
    const name = document.evaluate(RULES[sourceName].vacancy.name, document, null, dom.window.XPathResult.STRING_TYPE, null)
    const companyName = document.evaluate(RULES[sourceName].vacancy.companyName, document, null, dom.window.XPathResult.STRING_TYPE, null)
    const timeType = document.evaluate(RULES[sourceName].vacancy.timeType, document, null, dom.window.XPathResult.STRING_TYPE, null)
    const workType = document.evaluate(RULES[sourceName].vacancy.workType, document, null, dom.window.XPathResult.STRING_TYPE, null)
    const salary = document.evaluate(RULES[sourceName].vacancy.salary, document, null, dom.window.XPathResult.STRING_TYPE, null)
    const address = document.evaluate(RULES[sourceName].vacancy.address, document, null, dom.window.XPathResult.STRING_TYPE, null)
  
    const published = document.evaluate(RULES[sourceName].vacancy.published, document, null, dom.window.XPathResult.STRING_TYPE, null)
    const archived = document.evaluate(RULES[sourceName].vacancy.archived, document, null, dom.window.XPathResult.STRING_TYPE, null)
  
    const head = getTextWithParagraphs(document.evaluate(
      RULES[sourceName].vacancy.head,
      document,
      null,
      dom.window.XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    ))
  
    const body = getTextWithParagraphs(document.evaluate(
      RULES[sourceName].vacancy.body,
      document,
      null,
      dom.window.XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    ))
  
    const skills = getTextWithParagraphs(document.evaluate(
      RULES[sourceName].vacancy.skills,
      document,
      null,
      dom.window.XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    ))
  
    const salaryParsed = parseSalary(sourceName, salary.stringValue)
    const companyId = getIdFromCompanyName(companyName.stringValue)
  
    const vacancy = {}
    vacancy.id = companyId + '_' + getIdFromCompanyName(name.stringValue)
    vacancy.name = name.stringValue.trim()
    vacancy.salary_from = salaryParsed?.from
    vacancy.salary_to = salaryParsed?.to
    vacancy.currency = salaryParsed?.currency
    vacancy.time_type_id = parseTimeType(sourceName, timeType.stringValue) || null
    vacancy.work_type_id = parseWorkType(sourceName, workType.stringValue) || null
    vacancy.location = address.stringValue || null
    vacancy.source_id = sourceName
    vacancy.description = head + '\n\n' + body + '\n\n' + 'Ключевые навыки:\n\n' + skills + '\n\n' + published.stringValue
    vacancy.url = url
    vacancy.date_publication = extractDateFromPublished(published.stringValue)
    vacancy.date_archived = extractDateFromArchived(archived.stringValue) || null
  
    return saveVacancy(vacancy)
  } else {
    throw new Error(`A handler for "${sourceName}" vacancy is not implemented yet`)
  }
}

const processCompany = async (url) => {
  const sourceName = getNameFromUrl(url)
  if (!RULES.hasOwnProperty(sourceName)) throw new Error('Not implemented yet')

  const { dom, document } = await getDOMDocumentFromURL(url)

  if (sourceName === 'hh') {
    const name = document.evaluate(RULES[sourceName].company.name, document, null, dom.window.XPathResult.STRING_TYPE, null)
    const website = document.evaluate(RULES[sourceName].company.url, document, null, dom.window.XPathResult.STRING_TYPE, null)
    const location = document.evaluate(RULES[sourceName].company.location, document, null, dom.window.XPathResult.STRING_TYPE, null)
    const ratingDreamjob = document.evaluate(RULES[sourceName].company.ratingDreamjob, document, null, dom.window.XPathResult.STRING_TYPE, null)
    
    const description = getTextWithParagraphs(document.evaluate(
      RULES[sourceName].company.description,
      document,
      null,
      dom.window.XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    ))

    const company = {}
    company.id = getIdFromCompanyName(name.stringValue)
    company.name = name.stringValue.trim()
    company.name_variants = website.stringValue.trim() ? JSON.stringify([
      website.stringValue.trim().split('.')[0].toLocaleLowerCase()
    ]) : null
    company.url = normalizeUrl(website.stringValue.trim()) || null
    company.source_url = url
    company.location = location.stringValue || null
    company.description = description || null
    company.rating_dreamjob = parseFloat(ratingDreamjob.stringValue.replace(',', '.')) || null

    return saveCompany(company)
  } else {
    throw new Error(`A handler for "${sourceName}" company is not implemented yet`)
  }
}

const saveCompany = (company) => {
  const query = `INSERT INTO companies (id, [name], name_variants, location, description, url, source_url, rating_dreamjob)
VALUES (:id, :name, :name_variants, :location, :description, :url, :source_url, :rating_dreamjob)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  name_variants = excluded.name_variants,
  location = excluded.location,
  description = excluded.description,
  url = excluded.url,
  source_url = excluded.source_url,
  rating_dreamjob = excluded.rating_dreamjob`
  const result = db.prepare(query).run({
    id: company.id,
    name: company.name,
    name_variants: company.name_variants,
    location: company.location,
    description: company.description,
    url: company.url,
    source_url: company.source_url,
    rating_dreamjob: company.rating_dreamjob,
  })
  if (result)
    return company.id
  return null
}

const saveVacancy = (vacancy) => {
  const query = `INSERT INTO vacancies (id, project_id, company_id, contact_id, work_type_id, time_type_id, source_id, location, [name], url, description, salary_from, salary_to, currency, date_publication, date_archived)
VALUES (:id, :project_id, :company_id, :contact_id, :work_type_id, :time_type_id, :source_id, :location, :name, :url, :description, :salary_from, :salary_to, :currency, :date_publication, :date_archived)
ON CONFLICT(id) DO UPDATE SET
  id = excluded.id,
  project_id = excluded.project_id,
  company_id = excluded.company_id,
  contact_id = excluded.contact_id,
  work_type_id = excluded.work_type_id,
  time_type_id = excluded.time_type_id,
  source_id = excluded.source_id,
  location = excluded.location,
  name = excluded.name,
  url = excluded.url,
  description = excluded.description,
  salary_from = excluded.salary_from,
  salary_to = excluded.salary_to,
  currency = excluded.currency,
  date_publication = excluded.date_publication,
  date_archived = excluded.date_archived`
  const result = db.prepare(query).run({
    id: vacancy.id,
    project_id: vacancy.project_id,
    company_id: vacancy.company_id,
    contact_id: vacancy.contact_id,
    work_type_id: vacancy.work_type_id,
    time_type_id: vacancy.time_type_id,
    source_id: vacancy.source_id,
    location: vacancy.location,
    name: vacancy.name,
    url: vacancy.url,
    description: vacancy.description,
    salary_from: vacancy.salary_from,
    salary_to: vacancy.salary_to,
    currency: vacancy.currency,
    date_publication: vacancy.date_publication,
    date_archived: vacancy.date_archived,
  })
  if (result)
    return vacancy.id
  return null
}

const main = async () => {
  try {
    const args = process.argv
    const url = args[2]
    const type = args[3] || 'vacancy'
    if (!url) {
      console.log('Usage: node <script-name>.js <url> [vacancy|company]\nDefault: vacancy')
      process.exit(0)
    }
    new URL(url) // make sure URL is valid
    if (type === 'company')
      await processCompany(url)
    else
      await processVacancy(url)
    console.log('Done')
  } catch (error) {
    console.error('Error:', error?.message)
  }
}

main()
