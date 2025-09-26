const { updateInterviewStatus } = require('../db/queries')
const { getISODateTime, DATETIME_TYPE_DATE } = require('../utils/datetime')

const updateStatus = (id, statusId, dateStatusChange = getISODateTime(null, DATETIME_TYPE_DATE)) => {
  id = parseInt(id)
  if (!id)
    return null
  statusId = statusId?.trim()
  return updateInterviewStatus(id, statusId, dateStatusChange)
}

module.exports = {
  updateStatus,
}
