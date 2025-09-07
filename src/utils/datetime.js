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

module.exports = {
  DATETIME_TYPE_DATE,
  DATETIME_TYPE_TIME,
  DATETIME_TYPE_DATETIME,
  DATETIME_ZONE_UTC,
  DATETIME_ZONE_LOCAL,
  getISODateTime,
  getISODateFromString,
}
