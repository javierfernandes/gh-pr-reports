import fs from 'fs'
import ghauth from 'github-oauth'

const config = fs.readFileSync(`${__dirname}/config.json`)

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
  baseURL: 'http://localhost:3000',
  loginURI: '/login',
  callbackURI: '/callback',
  scope: scopes.join(' ')
})

require('http').createServer((req, res) => {
  if (req.url.match(/login/)) return githubOAuth.login(req, res)
  if (req.url.match(/callback/)) return githubOAuth.callback(req, res)
}).listen(PORT)

githubOAuth.on('error', err => {
  console.error('there was a login error', err)
})

githubOAuth.on('token', (token, serverResponse) => {
  console.log('here is your shiny new github oauth token', token)
  serverResponse.end(JSON.stringify(token))
})