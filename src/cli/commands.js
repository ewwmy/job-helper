const { processVacancy, updateStatus: updateVacancyStatus } = require('../services/vacancy-service')
const { processCompany } = require('../services/compnay-service')
const { updateStatus: updateInterviewStatus } = require('../services/interview-service')
const { processStat } = require('../services/stat-service')
const {
  USAGE_INFO,
} = require('../config/constants')

const handleCommand = async (args) => {
  const type = args[0]
  const url = args[1]
  const status = args[2]
  const date = args[3] || null

  if (type === 'stat') {
    await processStat()
  } else {
    if (!url) {
      console.log(USAGE_INFO)
      process.exit(0)
    }

    switch (type) {
      case 'company':
        await processCompany(url)
        break
      case 'vacancy':
        await processVacancy(url, false, status)
        break
      case 'vacancy+company':
        await processVacancy(url, true, status)
        break
      case 'vacancy-status':
        if (date)
          await updateVacancyStatus(url, status, date)
        else
          await updateVacancyStatus(url, status)
        break
      case 'interview-status':
        if (date)
          await updateInterviewStatus(url, status, date)
        else
          await updateInterviewStatus(url, status)
        break
      default:
        console.log(USAGE_INFO)
        process.exit(0)
    }
  }

  console.log('Done')
}

module.exports = {
  handleCommand,
}
