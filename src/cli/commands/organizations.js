import state from './state'

export default (vorpal, client) => {
  vorpal
    .command('organizations')
    .action(toAction(async cli => {
      await promptOrganization(cli, client, state)
      await promptRepository(cli, client, state)
      await promptTags(cli, client, state)

      console.log('State', state)
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
  const organization = await prompt({
    message: 'Which organization should we use?',
    query: 'organizations.gql',
    extractor: data => data.viewer.organizations,
    toOptions: o => ({ name: o.login, value: o.login })
  }, cli, client)
  state.organization = organization
}

const promptRepository = async (cli, client, state) => {
  cli.log('Fetching ...')
  const repository = await prompt({
    message: 'Which repository should we use?',
    query: 'repositories.gql',
    variables: { organization: state.organization },
    extractor: data => data.organization.repositories,
    toOptions: o => ({ name: o.name, value: o.name })
  }, cli, client)

  state.repository = repository
}
const promptTags = async (cli, client, state) => {
  cli.log('Fetching ...')
  const tag = await prompt({
    message: 'Which tag should we use?',
    query: 'tags.gql',
    variables: { owner: state.organization, name: state.repository },
    extractor: data => data.repository.refs,
    toOptions: o => ({ name: o.name, value: o })
  }, cli, client)

  state.tag = tag
}

// generic prompt

const prompt = async ({ message, query, extractor, variables = {}, toOptions }, cli, client) => {
  const objects = await client.queryAll(query, extractor, variables)
  const result = await cli.prompt({
    type: 'list',
    choices: objects.map(toOptions),
    name: 'value',
    default: false,
    message,
  })
  return result.value
}