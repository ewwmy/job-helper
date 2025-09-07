const { handleCommand } = require('./cli/commands')

const main = async (args) => {
  try {
    await handleCommand(args)
  } catch (error) {
    console.error('Error:', error?.message)
  }
}

module.exports = { main }
