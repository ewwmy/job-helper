#!/usr/bin/env node

const db = require('better-sqlite3')('/home/andrew/Документы/job-search.db')
const url = require('node:url')
const https = require('node:https')

const jsdom = require('jsdom')

const { JSDOM } = jsdom

const RULES = {
  hh: {
    vacancy: {
      name: '/html/body/div[5]/div/div[4]/div[1]/div/div/div/div/div[1]/div[1]/div[1]/div/div[1]/div/div/div/div[1]/div[1]/div/div/div/div[1]/h1',
      salary: '//*[@id="HH-React-Root"]/div/div[4]/div[1]/div/div/div/div/div[1]/div[1]/div[1]/div/div[1]/div/div/div/div[1]/div[1]/div/div/div/div[1]/div[2]/span',
      companyName: '//*[@id="HH-React-Root"]/div/div[4]/div[1]/div/div/div/div/div[2]/div/div[1]/div[1]/div/div[1]/div/div/div[1]/div/div[1]/span/a/span'
    },
    company: {}
  },
  linkedin: {}
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

const getNameFromUrl = (value) => {
  const { host } = new url.URL(value)
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

const parseSalary = (sourceName, value) => {
  const result = {
    from: null,
    to: null,
    currency: null,
  }
  if (sourceName === 'hh') {
    if (value.includes('месяц')) {
      value = value.replace(/[\u00A0\u202F\t]/gi, ' ')
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

const processVacancy = async (url) => {
  const sourceName = getNameFromUrl(url)
  if (!RULES.hasOwnProperty(sourceName)) return null

  const data = await getHtmlFrom(url)

  const dom = new JSDOM(data)
  const document = dom.window.document

  const name = document.evaluate(RULES[sourceName].vacancy.name, document, null, dom.window.XPathResult.STRING_TYPE, null)
  const companyName = document.evaluate(RULES[sourceName].vacancy.companyName, document, null, dom.window.XPathResult.STRING_TYPE, null)
  const salary = document.evaluate(RULES[sourceName].vacancy.salary, document, null, dom.window.XPathResult.STRING_TYPE, null)

  const salaryParsed = parseSalary(sourceName, salary.stringValue)
  const id = transliterate(companyName.stringValue)

  const vacancy = {}
  vacancy.id = id
  vacancy.name = name.stringValue
  vacancy.salary_from = salaryParsed.from
  vacancy.salary_to = salaryParsed.to
  vacancy.currency = salaryParsed.currency

  saveVacancy(vacancy)
}

const saveCompany = (company) => {
  const query = `INSERT INTO companies (id, country_id, [name], name_variants, description, url, source_url, rating_dreamjob)
VALUES (:id, :country_id, :name, :name_variants, :description, :url, :source_url, :rating_dreamjob)
ON CONFLICT(id) DO UPDATE SET
  country_id = excluded.country_id,
  name = excluded.name,
  name_variants = excluded.name_variants,
  description = excluded.description,
  url = excluded.url,
  source_url = excluded.source_url,
  rating_dreamjob = excluded.rating_dreamjob`
  const result = db.prepare(query).run({
    id: company.id,
    country_id: companyny.country_id,
    name: company.name,
    name_variants: company.name_variants,
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
  const query = `INSERT INTO vacancies (id, project_id, company_id, contact_id, work_type_id, time_type_id, source_id, country_id, location, [name], url, description, salary_from, salary_to, currency, date_publication)
VALUES (:id, :project_id, :company_id, :contact_id, :work_type_id, :time_type_id, :source_id, :country_id, :location, :name, :url, :description, :salary_from, :salary_to, :currency, :date_publication)
ON CONFLICT(id) DO UPDATE SET
  id = excluded.id,
  project_id = excluded.project_id,
  company_id = excluded.company_id,
  contact_id = excluded.contact_id,
  work_type_id = excluded.work_type_id,
  time_type_id = excluded.time_type_id,
  source_id = excluded.source_id,
  country_id = excluded.country_id,
  location = excluded.location,
  name = excluded.name,
  url = excluded.url,
  description = excluded.description,
  salary_from = excluded.salary_from,
  salary_to = excluded.salary_to,
  currency = excluded.currency,
  date_publication = excluded.date_publication`
  const result = db.prepare(query).run({
    id: vacancy.id,
    project_id: vacancy.project_id,
    company_id: vacancy.company_id,
    contact_id: vacancy.contact_id,
    work_type_id: vacancy.work_type_id,
    time_type_id: vacancy.time_type_id,
    source_id: vacancy.source_id,
    country_id: vacancy.country_id,
    location: vacancy.location,
    name: vacancy.name,
    url: vacancy.url,
    description: vacancy.description,
    salary_from: vacancy.salary_from,
    salary_to: vacancy.salary_to,
    currency: vacancy.currency,
    date_publication: vacancy.date_publication,
  })
  if (result)
    return vacancy.id
  return null
}

const main = async () => {
  await processVacancy('https://hh.ru/vacancy/123744583')
}

try {
  main()
} catch (error) {
  console.error(error)
}
