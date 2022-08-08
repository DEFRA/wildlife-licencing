import 'isomorphic-fetch'
import { Client } from '@microsoft/microsoft-graph-client'
import { ClientSecretCredential } from '@azure/identity'
import pkg from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js'
const { TokenCredentialAuthenticationProvider } = pkg

/*
 * https://github.com/microsoftgraph/msgraph-sdk-javascript/blob/dev/docs/tasks/LargeFileUploadTask.md
 * Use the stream upload
 */

export const initialize = () => {
  // Users the client credentials grant
  // https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
  const credential = new ClientSecretCredential(
    '6f504113-6b64-43f2-ade9-242e05780007', // Will this always be the same ?
    'e582baa3-7e5d-41fd-85fc-37a1256f6040',
    'hKJ7Q~JXiPIyYR2ROKq31DRqGKN4QUh9-FFR9' // Will this always be the same ?
  )

  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default']
  })

  const client = Client.initWithMiddleware({
    debugLogging: true,
    authProvider
  })

  return client
}
