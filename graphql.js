import fs from 'fs'
import ApolloClient, { createNetworkInterface } from 'apollo-client'
import gql from 'graphql-tag'
import fetch from 'isomorphic-fetch'

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

  return new Api(new ApolloClient({ networkInterface }))
}

class Api {
  constructor(client) {
    this.client = client
  }
  gql(fileName) {
    return gql(fs.readFileSync(`${__dirname}/queries/${fileName}`).toString())
  }
  queryAll(queryFileName, extractor, variables) {
    const query = this.gql(queryFileName)
    return this.queryPage(query, extractor, undefined, variables, [])
  }
  async queryPage(query, extractor, after, variables, elements) {
    const result = await this.client.query({
      query,
      variables: {
        ...variables,
        // ...after && { after }
      }
    })

    const search = extractor(result.data)
    elements = elements.concat(search.nodes)
    return search.pageInfo.hasNextPage ?
      this.queryPage(query, extractor, search.pageInfo.endCursor, variables, elements)
      : elements
  }
}