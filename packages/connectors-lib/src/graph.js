import Config from './config.js'
import 'isomorphic-fetch'

import path from 'node:path'
import { ClientSecretCredential } from '@azure/identity'
import authProviders from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js'
import * as pkg from '@microsoft/microsoft-graph-client'
const { Client, StreamUpload, LargeFileUploadTask } = pkg

const CHUNK_SIZE = 1024 * 1024

export const GRAPH = {
  client: () => {
    const { TokenCredentialAuthenticationProvider } = authProviders
    // Users the client credentials grant
    // https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
    const { id, secret } = Config.powerApps.oauth.client
    const { tenant: tenantId, siteId, driveId } = Config.graph
    const credential = new ClientSecretCredential(tenantId, id, secret)

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default']
    })

    const base = Config.graph.base || 'https://graph.microsoft.com/v1.0'

    const client = Client.initWithMiddleware({
      debugLogging: true,
      authProvider
    })

    return ({
      /**
       * Upload a file to the sharepoint drive specified in the environment variables
       * @param filename - the filename
       * @param filesize - the size in bytes
       * @param readStream - a stream
       * @param path - the path from the sharepoint root
       * @returns {Promise<*>}
       */
      uploadFile: async (filename, filesize, readStream, filepath) => {
        // Create FileUpload object
        const options = {
          rangeSize: CHUNK_SIZE,
          uploadEventHandlers: {
            progress: (range, e) => {
              console.log(`Uploaded $filename bytes ${range?.minValue} to ${range?.maxValue} to ${path}`)
            }
          }
        }

        const location = path.join(filepath, filename)
        const fileObject = new StreamUpload(readStream, filename, filesize)

        try {
          const uploadSession = await LargeFileUploadTask.createUploadSession(client,
            `${base}/sites/${siteId}/drives/${driveId}/root:${location}:/createUploadSession`, {
              item: {
                '@microsoft.graph.conflictBehavior': 'rename'
              }
            })
          const largeFileUploadTask = new LargeFileUploadTask(client, fileObject, uploadSession, options)
          await largeFileUploadTask.upload()
        } catch (err) {
          console.error(`Error uploading file ${filename} to ${filepath}`, err)
          throw err
        }
      }
    })
  }
}
