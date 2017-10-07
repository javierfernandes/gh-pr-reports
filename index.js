import fs from 'fs'
import { createClient } from './graphql'
import gql from 'graphql-tag'
import fetch from 'isomorphic-fetch'
import { processPRs } from './core'
import reporter from './reporter'
import _vorpal from 'vorpal'

const vorpal = _vorpal()

const config = fs.readFileSync(`${__dirname}/config.json`)

const { TOKEN, OWNER, REPO } = config

const client = createClient(TOKEN)


// const query = gql(fs.readFileSync(`${__dirname}/queries/prs.gql`))
// client.query({
//   query,
//   variables: { owner: OWNER, name: REPO }
// })
// .then(reporter)
// .catch(error => console.error(error))

vorpal.command('destroy database')
  .action(function(args, cb){
    const self = this
    return this.prompt({
      type: 'confirm',
      name: 'continue',
      default: false,
      message: 'That sounds like a really bad idea. Continue?',
    }, result => {
      if (!result.continue) {
        self.log('Good move.')
        cb()
      } else {
        self.log('Time to dust off that resume.')
      }
    })
  })

vorpal
  .delimiter('gh-reports$')
  .show()