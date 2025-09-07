const { config } = require('../config/env')

const db = require('better-sqlite3')(config.DB_FILE)

module.exports = db
