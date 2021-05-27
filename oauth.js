import fs from 'fs'
import ghauth from 'github-oauth'
import { createServer } from 'http'

const config = JSON.parse(fs.readFileSync(`${__dirname}/config.json`).toString('utf-8'))

const { PORT, CLIENT_ID, CLIENT_SECRET } = config

const scopes = [
  'user',
  'public_repo',
  'repo',
  'repo_deployment',
  'repo:status',
  'read:repo_hook',
  'read:org',
  'read:public_key',
  'read:gpg_key'
]

const githubOAuth = ghauth({
  githubClient: CLIENT_ID,
  githubSecret: CLIENT_SECRET,
  baseURL: `http://localhost:${PORT}`,
  loginURI: '/login',
  callbackURI: '/callback',
  scope: scopes.join(' ')
})

const app = createServer((req, res) => {
  if (req.url.match(/login/)) return githubOAuth.login(req, res)
  if (req.url.match(/callback/)) return githubOAuth.callback(req, res)
})
app.listen(PORT)
console.log('Http server started at localhost and port', config.PORT)
console.log('Please go to', `http://localhost:${PORT}/login` );


githubOAuth.on('error', err => {
  console.error('there was a login error', err)
})

githubOAuth.on('token', (token, serverResponse) => {
  console.log('here is your shiny new github oauth token', token)
  serverResponse.end(JSON.stringify(token))
})
