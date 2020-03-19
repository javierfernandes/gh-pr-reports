import fs from 'fs'
import ApolloClient, { createNetworkInterface } from 'apollo-client'
import gql from 'graphql-tag'
import fetch from 'isomorphic-fetch'

export const createClient = token => {
  const networkInterface = createNetworkInterface({
    uri: 'https://api.github.com/graphql',
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

  return new Api(new ApolloClient({
    networkInterface,
  }))
}

class Api {
  constructor(client) {
    this.client = client
    this.queriesCache = {}
  }
  gql(fileName) {
    if (!this.queriesCache[fileName]) {
      this.queriesCache[fileName] = gql(fs.readFileSync(`${__dirname}/queries/${fileName}`).toString())
    }
    return this.queriesCache[fileName]
  }
  // paginated query
  queryAll(queryFileName, extractor, variables) {
    const query = this.gql(queryFileName)
    return this.queryPage(query, extractor, undefined, variables, [])
  }
  async queryPage(query, extractor, after, variables, elements) {
    try {
      const result = await this.client.query({
        query,
        variables: {
          ...variables,
          ...after && { after }
        }
      })

      if (result.stale && result.data === null) {
        return elements
      }
  
      const search = extractor(result.data)
      
      elements = elements.concat(search.nodes)

      if (!search.pageInfo.hasNextPage) {
        return elements
      }

      return this.queryPage(query, extractor, search.pageInfo.endCursor, variables, elements)
    } catch (error) {
      console.error('Error while querying', error, 'query is', query)
      throw error
    }
  }
  // simple query
  async query(queryFileName, extractor, variables) {
    const result = await this.client.query({
      query: this.gql(queryFileName),
      variables,
      fetchPolicy: 'no-cache'
    })
    return extractor(result.data)
  }
}