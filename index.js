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
  const ru = ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  const en = ['a', 'b', 'v', 'g', 'd', 'e', 'yo', 'zh', 'z', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'c', 'ch', 'sh', 'sch', '', 'y', '', 'e', 'ju', 'ja', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  return Array
    .from(String(value))
    .map(char => {
      if (ru.includes(char.toLocaleLowerCase())) {
        const pos = ru.indexOf(char.toLocaleLowerCase())
        return en.at(pos)
      }
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

const parseSalary = (sourceName, value) => {
  if (sourceName === 'hh') {
    if (value.includes('месяц')) {
      const regex = /^\s*(?:от\s*([\d\s\u00A0\u202F]+)\s*([^\d\s]+))?\s*(?:до\s*([\d\s\u00A0\u202F]+)\s*([^\d\s]+))?/i
      const matches = value.match(regex)
      return matches
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
  console.log(salaryParsed)
  const id = transliterate(companyName.stringValue)

  const vacancy = {}
  vacancy.id = id
  vacancy.name = name.stringValue

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

  // CREATE TABLE "vacancies" (
  //   "id"	TEXT NOT NULL,
  //   "project_id"	TEXT,
  //   "company_id"	TEXT,
  //   "hr_agency_id"	TEXT,
  //   "contact_id"	INTEGER,
  //   "status_id"	TEXT NOT NULL DEFAULT 'draft',
  //   "work_type_id"	TEXT,
  //   "time_type_id"	TEXT,
  //   "source_id"	TEXT,
  //   "country_id"	TEXT,
  //   "location"	TEXT,
  //   "name"	TEXT NOT NULL,
  //   "url"	TEXT,
  //   "description"	TEXT,
  //   "salary_from"	REAL,
  //   "salary_to"	REAL,
  //   "currency"	TEXT,
  //   "cover_letter"	TEXT,
  //   "time_create"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  //   "time_edit"	TEXT,
  //   "date_status_change"	TEXT,
  //   "date_publication"	TEXT,
  //   "date_first_contact"	TEXT,
  //   "date_archived"	TEXT,
  //   "is_favorite"	INTEGER NOT NULL DEFAULT 0,
  //   "is_contacted_by_me"	INTEGER NOT NULL DEFAULT 1,
  //   "communication_log"	TEXT,
  //   "comment"	TEXT,
  //   PRIMARY KEY("id"),
  //   FOREIGN KEY("company_id") REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  //   FOREIGN KEY("contact_id") REFERENCES "contacts"("id"),
  //   FOREIGN KEY("country_id") REFERENCES "countries"("id"),
  //   FOREIGN KEY("hr_agency_id") REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  //   FOREIGN KEY("project_id") REFERENCES "projects"("id"),
  //   FOREIGN KEY("source_id") REFERENCES "sources"("id"),
  //   FOREIGN KEY("status_id") REFERENCES "vacancy_statuses"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  //   FOREIGN KEY("time_type_id") REFERENCES "vacancy_time_types"("id"),
  //   FOREIGN KEY("work_type_id") REFERENCES "vacancy_work_types"("id")
  // )
}

const main = async () => {
  // console.log(processVacancy('https://hh.ru/employer/11548656?hhtmFrom=vacancy'))
  // console.log(await getHtmlFrom('https://hh.ru/vacancy/123744583'))
  console.log(await processVacancy('https://hh.ru/vacancy/123744583'))
}

try {
  main()
} catch (error) {
  console.error(error)
}
