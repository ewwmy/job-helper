const { URL } = require('node:url')
const { processCompany, processVacancy } = require('../services/vacancy-service')
const { processStat } = require('../services/stat-service')
const {
  VACANCY_STATUS_DRAFT,
  VACANCY_STATUS_APPLIED,
  VACANCY_STATUS_PROPOSED,
  USAGE_INFO,
} = require('../config/constants')

const handleCommand = async (args) => {
  const type = args[0]
  const url = args[1]
  const status =
    args[2] === VACANCY_STATUS_APPLIED ||
    args[2] === VACANCY_STATUS_PROPOSED ?
      args[2] :
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
}

module.exports = {
  handleCommand,
}
