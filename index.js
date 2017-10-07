import fs from 'fs'
import { createClient } from './graphql'
import { processPRs } from './core'
import reporter from './reporter'
import _vorpal from 'vorpal'
import gql from 'graphql-tag'
import commands from './src/cli/commands/all'

const vorpal = _vorpal()

const config = JSON.parse(fs.readFileSync(`${__dirname}/config.json`))

const { TOKEN } = config

const client = createClient(TOKEN)

// register commands
Object.keys(commands).forEach(c => {
  commands[c](vorpal, client)
})

vorpal
  .delimiter('gh-reports$')
  .show()

const run = async () => {
  await vorpal.exec('organizations') 
  await vorpal.exec('repositories') 
}

run()
