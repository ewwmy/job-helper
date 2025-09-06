#!/usr/bin/env node

const path = require('node:path')
const fs = require('node:fs')
const dotenv = require('dotenv')

const specificEnvPath = '~/.config/ewwmy/job-analytics/.env'
const localEnvPath = path.resolve(__dirname, '.env')
const cwdEnvPath = path.resolve(process.cwd(), '.env')

let envPath = null

if (fs.existsSync(cwdEnvPath)) {
  envPath = cwdEnvPath
} else if (fs.existsSync(localEnvPath)) {
  envPath = localEnvPath
} else if (fs.existsSync(specificEnvPath)) {
  envPath = specificEnvPath
}

if (envPath) {
  dotenv.config({
    path: envPath,
    quiet: true,
  })
  console.log('Loaded .env:', envPath)
} else {
  console.error('No .env file found')
  process.exit(1)
}

const { URL } = require('node:url')
const https = require('node:https')
const zlib = require('node:zlib')
const { randomUUID } = require('node:crypto')

const jsdom = require('jsdom')

const { JSDOM } = jsdom
const { window } = new JSDOM()
const { XPathResult } = window

const db = require('better-sqlite3')(process.env.DB_FILE)

const USAGE_INFO = 'Usage:\n\tjob-helper stat\n\tjob-helper <vacancy+company | vacancy | company> <url> [draft | applied | proposed]\nDefault: draft'

const VACANCY_STATUS_DRAFT = 'draft'
const VACANCY_STATUS_APPLIED = 'applied'
const VACANCY_STATUS_PROPOSED = 'proposed'

const RULES = {
  hh: {
    vacancy: {
      name: {
        xpath: '//*/h1[@data-qa="vacancy-title"]/text()',
        type: XPathResult.STRING_TYPE,
      },
      salary: {
        xpath: '//*/span[contains(@data-qa, "vacancy-salary-compensation")]',
        type: XPathResult.STRING_TYPE,
      },
      timeType: {
        xpath: '//*/div[@data-qa="common-employment-text"]',
        type: XPathResult.STRING_TYPE,
      },
      workType: {
        xpath: '//*/p[@data-qa="work-formats-text"]',
        type: XPathResult.STRING_TYPE,
      },
      companyName: {
        xpath: '//*/a[@data-qa="vacancy-company-name"]/span',
        type: XPathResult.STRING_TYPE,
      },
      companyUrl: {
        xpath: '//*/a[@data-qa="vacancy-company-name"]/@href',
        type: XPathResult.STRING_TYPE,
      },
      head: {
        xpath: '//*[@id="HH-React-Root"]/div/div[4]/div[1]/div/div/div/div/div[1]/div[1]/div[1]/div',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      body: {
        xpath: '//*/div[@class="g-user-content"]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      bodyBranded: {
        xpath: '//*/div[@class="vacancy-branded-description"]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      skills: {
        xpath: '//*/ul[contains(@class, "vacancy-skill-list")]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      address: {
        xpath: '//*/span[@data-qa="vacancy-view-raw-address"]',
        type: XPathResult.STRING_TYPE,
      },
      published: {
        xpath: '//*/p[@class="vacancy-creation-time-redesigned"]',
        type: XPathResult.STRING_TYPE,
      },
      archived: {
        xpath: '//*/div[@data-qa="vacancy-title-archived-text"]',
        type: XPathResult.STRING_TYPE,
      },
    },
    company: {
      name: {
        xpath: '//*/h1[@data-qa="title"]',
        type: XPathResult.STRING_TYPE,
      },
      url: {
        xpath: '//*/span[@data-qa="sidebar-company-site-text"]',
        type: XPathResult.STRING_TYPE,
      },
      location: {
        xpath: '//*/div[@data-qa="company-info-address"]//*/div[contains(@class, "magritte-wrapper")][1]//*/span[@data-qa="cell-text-content"]',
        type: XPathResult.STRING_TYPE,
      },
      description: {
        xpath: '//*/div[@class="g-user-content"]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      descriptionBrandedV1: {
        xpath: '//*/div[contains(@class, "employer-branded")]//div[@class="tmpl_hh_wrapper"]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      descriptionBrandedV2: {
        xpath: '//*/div[contains(@class, "employer-branded")]//div[@class="tmpl-hh-brand-container"]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      ratingDreamjob: {
        xpath: '//*/div[contains(@class, "EmployerReviewsFront")]/div/div/div/div/div/div/div/div[1]/div/div/div/div[1]',
        type: XPathResult.STRING_TYPE,
      },
    },
  },
  // linkedin: {}
}

const ANALYTICS_RULES = {
  hh: {
    url: 'https://hh.ru/search/vacancy?text={$headline}&search_field=name&excluded_text=&salary=&salary=&salary_mode=&currency_code=RUR&experience=doesNotMatter&order_by=relevance&search_period=0&items_on_page=50&L_save_area=true&hhtmFrom=vacancy_search_filter',
    replacer: '{$headline}',
    xpath: '//*/h1[@data-qa="title"]',
    type: XPathResult.STRING_TYPE,
  },
  linkedin: {
    url: 'https://www.linkedin.com/jobs/search/?currentJobId=4223707724&geoId=91000025&keywords={$headline}&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true',
    replacer: '{$headline}',
    xpath: '//*/h1',
    type: XPathResult.STRING_TYPE,
	// # russia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4266159978&geoId=101728296&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_LOCATION_AUTOCOMPLETE&refresh=true

	// # united states
	// # https://www.linkedin.com/jobs/search/?currentJobId=4282419315&geoId=103644278&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # canada
	// # https://www.linkedin.com/jobs/search/?currentJobId=4219897401&geoId=101174742&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # eurasia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4223707724&geoId=91000025&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # european union
	// # https://www.linkedin.com/jobs/search/?currentJobId=4270271974&geoId=91000000&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # netherlands
	// # https://www.linkedin.com/jobs/search/?currentJobId=4280124242&geoId=102890719&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # united kingdom
	// # https://www.linkedin.com/jobs/search/?currentJobId=4271864680&geoId=101165590&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # germany
	// # https://www.linkedin.com/jobs/search/?currentJobId=4278238645&geoId=101282230&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # spain
	// # https://www.linkedin.com/jobs/search/?currentJobId=4281490999&geoId=105646813&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # portugal
	// # https://www.linkedin.com/jobs/search/?currentJobId=4261113369&geoId=100364837&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # cyprus
	// # https://www.linkedin.com/jobs/search/?currentJobId=4278333385&geoId=106774002&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # georgia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4278329763&geoId=106315325&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # armenia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4278329770&geoId=103030111&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # latin america
	// # https://www.linkedin.com/jobs/search/?currentJobId=4270514484&geoId=91000011&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # south asia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4143880596&geoId=91000013&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # southeast asia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4269126376&geoId=91000014&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # east asia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4267645152&geoId=91000012&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # kyrgyzstan
	// # https://www.linkedin.com/jobs/search/?currentJobId=4275382913&geoId=103490790&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # kazakhstan
	// # https://www.linkedin.com/jobs/search/?currentJobId=4278327882&geoId=106049128&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # united arab emirates (uae)
	// # https://www.linkedin.com/jobs/search/?currentJobId=4281931860&geoId=104305776&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # australia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4277140431&geoId=101452733&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # new zealand
	// # https://www.linkedin.com/jobs/search/?currentJobId=4278957985&geoId=105490917&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # australia and new zealand
	// # https://www.linkedin.com/jobs/search/?currentJobId=4277140431&geoId=91000015&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// http -b GET "https://www.linkedin.com/jobs/search/?currentJobId=4223707724&geoId=91000025&keywords=$title&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true" | tr -d '\n' | grep -oP '<h1 class="results-context-header__context">.*</h1>' | grep -oP '<span class="results-context-header__job-count">[^<]+|<span class="results-context-header__query-search">[^<]+' | sed -e 'N;s/\n/: /;s/<[^>]*>//g;s/.*span.//'
  },
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
    { match: '0', replace: '0', },
    { match: '1', replace: '1', },
    { match: '2', replace: '2', },
    { match: '3', replace: '3', },
    { match: '4', replace: '4', },
    { match: '5', replace: '5', },
    { match: '6', replace: '6', },
    { match: '7', replace: '7', },
    { match: '8', replace: '8', },
    { match: '9', replace: '9', },
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
  value = value?.trim()
  return transliterate(value)
}

const getNameFromUrl = (value) => {
  const { host } = new URL(value)
  const matches = host.match(/(www\.)?([-\w\d]+\.)?([-\w\d]+)(\.\w+)/i)
  if (Array.isArray(matches) && matches[3])
    return matches[3]
  return null
}

const getHtmlFrom = async (url) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const options = {
      protocol: parsedUrl.protocol,
      port: parsedUrl.port,
      host: parsedUrl.host,
      hostname: parsedUrl.hostname,
      origin: parsedUrl.origin,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "dnt": "1",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
      },
    }

    let data
    https.get(options, (res) => {
      let stream = res
  
      const encoding = res.headers['content-encoding']
      if (encoding === 'gzip') {
        stream = res.pipe(zlib.createGunzip())
      } else if (encoding === 'deflate') {
        stream = res.pipe(zlib.createInflate())
      } else if (encoding === 'br') {
        stream = res.pipe(zlib.createBrotliDecompress())
      }

      stream.on('data', (chunk) => data += chunk)
      stream.on('end', () => {
        resolve(data)
      })
      stream.on('error', (error) => {
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

const getISODateFromString = (value) => {
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
  const regex = /Вакансия опубликована ((\d+) ([а-яА-Я]+) (\d+))/i
  if (regex.test(value))
    return getISODateFromString(value)
  return null
}

const extractDateFromArchived = (value) => {
  const regex = /В архиве с ((\d+) ([а-яА-Я]+) (\d+))/i
  if (regex.test(value))
    return getISODateFromString(value)
  return null
}

const parseIntGroups = (value) => {
  value = String(value)
  
  if (value.match(/(could\s+not|couldn.?t)\s+find|can(.|\s*no)?t\s+find|не\s+найден|не\s+нашл/i)) return 0
  
  const regex = /(\d+([\s\t]+[\d]+)*)/i
  const matches = value.match(regex)
  if (!matches) return null
  return parseInt(matches[0].replace(/[\s\t]+/g, ''))
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

const sanitizeHTML = (value) => {
  return value
    .replace(/[\t\u00A0\u202F\u200B\u200C\u200D\uFEFF]/gi, ' ')
}

const delay = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms)
  })
}

const DATETIME_TYPE_DATE = 'date'
const DATETIME_TYPE_TIME = 'time'
const DATETIME_TYPE_DATETIME = 'datetime'

const DATETIME_ZONE_UTC = 'utc'
const DATETIME_ZONE_LOCAL = 'local'

const getISODateTime = (unixTimestampMs, type = DATETIME_TYPE_DATE, zone = DATETIME_ZONE_UTC) => {
  const date = unixTimestampMs ? new Date(unixTimestampMs) : new Date()
  const year = zone === DATETIME_ZONE_UTC ? date.getUTCFullYear() : date.getFullYear()
  const month = String((zone === DATETIME_ZONE_UTC ? date.getUTCMonth() : date.getMonth()) + 1).padStart(2, '0')
  const day = String((zone === DATETIME_ZONE_UTC ? date.getUTCDate() : date.getDate())).padStart(2, '0')
  const hours = String((zone === DATETIME_ZONE_UTC ? date.getUTCHours() : date.getHours())).padStart(2, '0')
  const minutes = String((zone === DATETIME_ZONE_UTC ? date.getUTCMinutes() : date.getMinutes())).padStart(2, '0')
  const seconds = String((zone === DATETIME_ZONE_UTC ? date.getUTCSeconds() : date.getSeconds())).padStart(2, '0')
  return type === DATETIME_TYPE_DATE ?
    `${year}-${month}-${day}` :
    type === DATETIME_TYPE_TIME ?
      `${hours}:${minutes}:${seconds}` :
      `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

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
  vacancy.date_publication = extractDateFromPublished(data.published.stringValue)
  vacancy.date_archived = extractDateFromArchived(data.archived.stringValue) || null

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

const processStat = async () => {
  const headlines = getHeadlines()
  const sources = getAnalyticsSources()
  const uuid = randomUUID()
  const maxAttempts = process.env.MAX_ATTEMPTS || 5
  const delayMs = process.env.DELAY || 3000

  if (Array.isArray(headlines) && Array.isArray(sources)) {
    for (const source of sources) {
      if (!(source.id in ANALYTICS_RULES)) continue

      for (const headline of headlines) {
        const analytics = {}

        analytics.headline_id = headline.id
        analytics.source_id = source.id
        analytics.session_uuid = uuid

        const url = ANALYTICS_RULES[source.id]
        .url
        .replace(
          ANALYTICS_RULES[source.id].replacer,
          headline.name
        )

        let amountValue = null
        let attempt = 0

        while (attempt < maxAttempts && !amountValue) {
          attempt++

          const { document } = await getDOMDocumentFromURL(url)

          if (attempt > 1) {
            console.log(`Retry #${attempt - 1}\nSource: ${source.id}\nHeadline: ${headline.id} (${headline.name})\n\n`)
          }

          amountValue = document.evaluate(
            ANALYTICS_RULES[source.id].xpath,
            document,
            null,
            ANALYTICS_RULES[source.id].type,
            null
          ).stringValue

          await delay(delayMs)
        }

        analytics.amount = parseIntGroups(amountValue)

        saveAnalytics(analytics)

        await delay(delayMs)
      }
    }
  }
}

const saveCompany = (company) => {
  const query = `INSERT INTO companies (id, name, name_variants, location, description, url, source_url, rating_dreamjob)
VALUES (:id, :name, :name_variants, :location, :description, :url, :source_url, :rating_dreamjob)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  name_variants = excluded.name_variants,
  location = excluded.location,
  description = excluded.description,
  url = excluded.url,
  source_url = excluded.source_url,
  rating_dreamjob = excluded.rating_dreamjob
ON CONFLICT(name) DO UPDATE SET
  id = excluded.id,
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
  const query = `INSERT INTO vacancies (project_id, company_id, contact_id, status_id, work_type_id, time_type_id, source_id, location, [name], url, description, salary_from, salary_to, currency, date_publication, date_first_contact, date_archived)
VALUES (:project_id, :company_id, :contact_id, :status_id, :work_type_id, :time_type_id, :source_id, :location, :name, :url, :description, :salary_from, :salary_to, :currency, :date_publication, :date_first_contact, :date_archived)
ON CONFLICT(url) DO UPDATE SET
  company_id = excluded.company_id,
  work_type_id = excluded.work_type_id,
  time_type_id = excluded.time_type_id,
  source_id = excluded.source_id,
  name = excluded.name,
  salary_from = excluded.salary_from,
  salary_to = excluded.salary_to,
  currency = excluded.currency,
  date_archived = excluded.date_archived`
  const result = db.prepare(query).run({
    project_id: vacancy.project_id,
    company_id: vacancy.company_id,
    contact_id: vacancy.contact_id,
    status_id: vacancy.status_id,
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
    date_first_contact: vacancy.date_first_contact,
    date_archived: vacancy.date_archived,
  })
  if (result)
    return result.id
  return null
}

const saveAnalytics = (analytics) => {
  const query = `INSERT INTO vacancy_analytics (headline_id, source_id, amount, session_uuid) VALUES (:headline_id, :source_id, :amount, :session_uuid)`
  const result = db.prepare(query).run({
    headline_id: analytics.headline_id,
    source_id: analytics.source_id,
    amount: analytics.amount,
    session_uuid: analytics.session_uuid,
  })
  if (result)
    return analytics.id
  return null
}

const getHeadlines = (activeOnly = true) => {
  const query = 'SELECT id, name FROM vacancy_analytics_headlines' + (activeOnly ? ' WHERE is_active = 1' : '')
  const result = db.prepare(query).all()
  if (!result) return null
  return result
}

const getAnalyticsSources = (activeOnly = true) => {
  const query = 'SELECT id FROM vacancy_analytics_sources' + (activeOnly ? ' WHERE is_active = 1' : '')
  const result = db.prepare(query).all()
  if (!result) return null
  return result
}

const main = async () => {
  try {
    const args = process.argv

    const type = args[2]
    const url = args[3]
    const status =
      args[4] === VACANCY_STATUS_APPLIED ||
      args[4] === VACANCY_STATUS_PROPOSED ?
        args[4] :
        VACANCY_STATUS_DRAFT

    if (type === 'stat') {
      await processStat()
    } else {
      if (!url) {
        console.log(USAGE_INFO)
        process.exit(0)
      }

      new URL(url) // to make sure URL is valid

      if (type === 'company') {
        await processCompany(url)
      } else if (type === 'vacancy') {
        await processVacancy(url, false, status)
      } else if (type === 'vacancy+company') {
        await processVacancy(url, true, status)
      } else {
        console.log(USAGE_INFO)
        process.exit(0)
      }
    }

    console.log('Done')
  } catch (error) {
    console.error('Error:', error?.message)
  }
}

main()
