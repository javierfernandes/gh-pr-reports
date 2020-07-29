import fs from 'fs'
import moment from 'moment'
import state from './state'
import reporter from '../../reporter'
import toPDF from '../../htmlToPdf'

const IGNORE_PR_LABEL = 'no-release-notes'

export default (vorpal, client) => {
  vorpal
    .command('organizations')
    .action(toAction(async cli => {
      await promptOrganization(cli, client, state)
      await promptRepository(cli, client, state)
      await promptTags(cli, client, state)

      await fetchPRs(cli, client, state)

      await fetchPRBodies(cli, client, state)

      const report = reporter(state)
      const fileName = saveToFile(state, report)

      await toPDF(fileName)
    
      cli.log(`Generated file ${fileName}`)

      // console.log('State', state)
    }))
}

const toAction = fn => {
  return function (args, cb) {
    const cli = this
    fn(cli, args)
      .then(cb, cb)
  }
}

const promptOrganization = async (cli, client, state) => {
  cli.log('Fetching ...')
  const result = await prompt({
    message: 'Which organization should we use?',
    query: 'organizations.gql',
    extractor: data => data.viewer.organizations,
    toOptions: o => ({ name: o.login, value: o.login })
  }, cli, client)
  state.organization = result.selected
}

const promptRepository = async (cli, client, state) => {
  cli.log('Fetching ...')
  const result = await prompt({
    message: 'Which repository should we use?',
    query: 'repositories.gql',
    variables: { organization: state.organization },
    extractor: data => data.organization.repositories,
    toOptions: o => ({ name: o.name, value: o.name })
  }, cli, client)

  state.repository = result.selected
}
const promptTags = async (cli, client, state) => {
  cli.log('Fetching ...')
  const result = await prompt({
    message: 'Which tag should we use?',
    query: 'tags.gql',
    variables: { owner: state.organization, name: state.repository },
    extractor: data => data.repository.refs,
    toOptions: o => ({ name: o.name, value: o })
  }, cli, client)

  state.tag = tagToMoment(result.selected)
  state.previousTag = previousTagTo(state.tag, result.objects)
}

const previousTagTo = (tag, tags) => {
  const tagTime = tag.target.committedDate
  const otherTags = tags
    .filter(t => t !== state.tag)
    .map(tagToMoment)
    .filter(t => t.target.committedDate.isBefore(tagTime))
  otherTags.sort((t1, t2) => compareDates(t1.target.committedDate, t2.target.committedDate))
  
  return otherTags.length > 0 ? otherTags[otherTags.length - 1] : undefined
}

const fetchPRs = async (cli, client, state) => {
  const variables = {
    owner: state.organization,
    name: state.repository
  }
  const prs = await client.queryAll('prs.gql', data => data.repository.pullRequests, variables)
  console.log(`Got ${prs.length} PRs`)
  state.prs = prs
    .map(pr => ({
      ...pr,
      mergedAt: moment(pr.mergedAt)
    }))
    .filter(pr => 
      pr.mergedAt.isSameOrBefore(state.tag.target.committedDate)
      && (!state.previousTag || pr.mergedAt.isAfter(state.previousTag.target.committedDate, 'minute'))
      && (!pr.labels.nodes.some(label => label.name === IGNORE_PR_LABEL))
    )
}

const fetchPRBodies = async (cli, client, state) => {
  state.prs = await Promise.all(state.prs.map(pr =>
    client.query('pr.gql', data => data.repository.pullRequest, {
      owner: state.organization,
      name: state.repository,
      number: pr.number
    })
  ))
}

const saveToFile = (state, report) => {
  const fileName = `${__dirname}/../../../changelog-${state.repository}-${state.tag.name}.html`
  console.log('Saving to file', fileName)
  fs.writeFileSync(fileName, report)
  return fileName
}

// generic prompt

const compareDates = (t1, t2) => {
  if (t1.isBefore(t2)) return -1
  else if (t1.isAfter(t2)) return 1
  else return 0
}

const tagToMoment = t => ({ 
  ...t,
  target: {
    ...t.target,
    committedDate: moment(t.target.committedDate)
  }
})

const prompt = async ({ message, query, extractor, variables = {}, toOptions }, cli, client) => {
  const objects = await client.queryAll(query, extractor, variables)

  const choices = objects.map(toOptions)

  const result = await cli.prompt({
    type: 'list',
    choices: choices,
    name: 'value',
    default: false,
    message,
  })
  return { objects, selected: result.value }
}