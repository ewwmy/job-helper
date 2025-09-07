const path = require('node:path')
const fs = require('node:fs')
const dotenv = require('dotenv')

const specificEnvPath = '~/.config/ewwmy/job-helper/.env'
const localEnvPath = path.resolve(path.join(__dirname, '..', '..'), '.env')
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

module.exports = {
  envPath,
  config: process.env,
}
