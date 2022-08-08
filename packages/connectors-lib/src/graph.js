import Config from './config.js'
import 'isomorphic-fetch'
import { Client } from '@microsoft/microsoft-graph-client'
import { ClientSecretCredential } from '@azure/identity'
import pkg from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js'
const { TokenCredentialAuthenticationProvider } = pkg

export const GRAPH = {
  getClient: () => {
    // Users the client credentials grant
    // https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
    const { tenant, client: cli, secret } = Config.graph
    const credential = new ClientSecretCredential(tenant, cli, secret)

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default']
    })

    const client = Client.initWithMiddleware({
      debugLogging: true,
      authProvider
    })

    return client
  }
}
