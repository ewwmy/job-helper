
const { randomUUID } = require('node:crypto')
const { getHeadlines, getAnalyticsSources, saveAnalytics } = require('../db/queries')
const { config } = require('../config/env')
const { ANALYTICS_RULES } = require('../config/rules')
const { getDOMDocumentFromURL } = require('../utils/dom')
const { delay } = require('../utils/common')
const { parseIntGroups } = require('../utils/normalizers')

const processStat = async () => {
  const headlines = getHeadlines()
  const sources = getAnalyticsSources()
  const uuid = randomUUID()
  const maxAttempts = config.MAX_ATTEMPTS || 5
  const delayMs = config.DELAY || 3000

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

module.exports = {
  processStat,
}
