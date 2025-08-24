#!/usr/bin/env node

require('dotenv').config({
  quiet: true,
})

const Database = require('better-sqlite3')
const fs = require('node:fs')
const path = require('node:path')

const db = new Database(process.env.DB_FILE)

const DIRECTION_UP = 'up'
const DIRECTION_DOWN = 'down'
const USAGE_INFO = 'Migration script\nUsage: node migrate.js <up|down> <[migration_name]|all confirm>'

db.prepare(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run()

const migrate = (direction = DIRECTION_UP, migrationName = null) => {
  const applied = db.prepare('SELECT name FROM migrations').all().map(r => r.name)

  let files = fs.readdirSync(process.env.MIGRATIONS_DIR)
    .filter(f => f.endsWith(`_${direction}.sql`))
    .toSorted()

  if (direction === DIRECTION_DOWN)
    files = files.reverse()

  if (migrationName) {
    if (direction === DIRECTION_UP) {
      if (!files.includes(`${migrationName}_${direction}.sql`) || applied.includes(migrationName)) return
    } else if (direction === DIRECTION_DOWN) {
      if (!files.includes(`${migrationName}_${direction}.sql`) || !applied.includes(migrationName)) return
    }
  }

  for (const file of files) {
    const name = file.replace(`_${direction}.sql`, '')
    if (direction === DIRECTION_UP && applied.includes(name)) continue
    if (direction === DIRECTION_DOWN && !applied.includes(name)) continue

    if (migrationName && direction === DIRECTION_DOWN) {
      if (migrationName === name) break
    }

    const sql = fs.readFileSync(path.join(process.env.MIGRATIONS_DIR, file), 'utf8')
    db.exec('BEGIN')
    try {
      db.exec(sql)
      if (direction === DIRECTION_UP) {
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run(name)
      } else {
        db.prepare('DELETE FROM migrations WHERE [name] = ?').run(name)
      }
      db.exec('COMMIT')
      console.log(`✔ ${direction} ${name}`)
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }

    if (migrationName && direction === DIRECTION_UP) {
      if (migrationName === name) break
    }
  }
}

const main = () => {
  try {
    const args = process.argv

    const direction = args[2]
    const name = args[3]
    const confirm = args[4]

    if (!direction || !name) {
      console.log(USAGE_INFO)
      process.exit(0)
    }
    
    let all = false
    if (name && confirm) {
      if (name === 'all' && confirm === 'confirm') {
        all = true
      } else {
        console.log(USAGE_INFO)
        process.exit(0)
      }
    }

    if (direction === DIRECTION_DOWN)
      migrate(DIRECTION_DOWN, all ? null : name)
    else
      migrate(DIRECTION_UP, all ? null : name)
  } catch (error) {
    console.error('Error:', error?.message)
  }
}

main()