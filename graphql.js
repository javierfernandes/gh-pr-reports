import ApolloClient, { createNetworkInterface } from 'apollo-client'

export const createClient = token => {
  const networkInterface = createNetworkInterface({
    uri: 'https://api.github.com/graphql'
  })

  networkInterface.use([ {
    applyMiddleware (req, next) {
      if (!req.options.headers) {
        req.options.headers = {}
      }
      req.options.headers.authorization = `Bearer ${token}`
      next()
    }
  }])

  return new ApolloClient({ networkInterface })
}