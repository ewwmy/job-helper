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

const parseIntGroups = (value) => {
  value = String(value)
  
  if (value.match(/(could\s+not|couldn.?t)\s+find|can(.|\s*no)?t\s+find|не\s+найден|не\s+нашл/i)) return 0
  
  const regex = /(\d+([\s\t]+[\d]+)*)/i
  const matches = value.match(regex)
  if (!matches) return null
  return parseInt(matches[0].replace(/[\s\t]+/g, ''))
}

const sanitizeHTML = (value) => {
  return value
    .replace(/[\t\u00A0\u202F\u200B\u200C\u200D\uFEFF]/gi, ' ')
}

module.exports = {
  transliterate,
  getIdFromCompanyName,
  getNameFromUrl,
  normalizeUrl,
  normalizeCurrency,
  parseIntGroups,
  sanitizeHTML,
}
