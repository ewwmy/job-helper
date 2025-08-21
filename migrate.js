#!/usr/bin/env node

require('dotenv').config({
  quiet: true,
})

const Database = require('better-sqlite3')
const fs = require('node:fs')
const path = require('node:path')

const db = new Database(process.env.DB_FILE)

const UP = 'up'
const DOWN = 'down'

db.prepare(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run()

const migrate = (direction = UP) => {
  const applied = new Set(
    db.prepare('SELECT name FROM migrations').all().map(r => r.name)
  )

  const files = fs.readdirSync(process.env.MIGRATIONS_DIR)
    .filter(f => f.endsWith(`_${direction}.sql`))
    .sort()

  for (const file of files) {
    const name = file.replace(`_${direction}.sql`, '')
    if (direction === UP && applied.has(name)) continue
    if (direction === DOWN && !applied.has(name)) continue

    const sql = fs.readFileSync(path.join(process.env.MIGRATIONS_DIR, file), 'utf8')
    db.exec('BEGIN')
    try {
      db.exec(sql)
      if (direction === UP) {
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
  }
}

const main = () => {
  try {
    const args = process.argv
    const direction = args[2]
    if (!direction) {
      console.log('Migration script\nUsage: node migrate.js <up|down>')
      process.exit(0)
    }
    if (direction === DOWN)
      migrate(DOWN)
    else
      migrate(UP)
  } catch (error) {
    console.error('Error:', error?.message)
  }
}

main()