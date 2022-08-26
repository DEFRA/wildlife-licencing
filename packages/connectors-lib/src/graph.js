import Config from './config.js'
import 'isomorphic-fetch'
import path from 'node:path'
import db from 'debug'
import { ClientSecretCredential } from '@azure/identity'
import authProviders from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js'
import * as pkg from '@microsoft/microsoft-graph-client'
const { Client, StreamUpload, LargeFileUploadTask } = pkg

const debug = db('connectors-lib:graph')
const CHUNK_SIZE = 1024 * 1024

// Just in case we can try setting a different root for v2
const base = Config.graph.base || 'https://graph.microsoft.com/v1.0'
const graphQueryEntities = {}

export const GRAPH = {
  client: () => {
    const { TokenCredentialAuthenticationProvider } = authProviders
    // Users the client credentials grant
    // https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
    const { id, secret } = Config.powerApps.oauth.client
    const { tenant: tenantId } = Config.graph
    const credential = new ClientSecretCredential(tenantId, id, secret)

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default']
    })

    const client = Client.initWithMiddleware({
      debugLogging: true,
      authProvider
    })

    return ({
      init: async () => {
        const siteResponse = await client.api(`${base}/sites/${Config.sharepoint.root}:/sites/${Config.sharepoint.site}`).get()
        graphQueryEntities.siteId = siteResponse.id
        const driveResponse = await client.api(`${base}/sites/${graphQueryEntities.siteId}/drives`).get()
        graphQueryEntities.drives = driveResponse.value
        debug('initializing sharepoint graph interface: ' + JSON.stringify(graphQueryEntities, null, 4))
      },
      /**
       * Upload a file to the sharepoint drive
       * @param filename - the filename
       * @param filesize - the size in bytes
       * @param readStream - a stream
       * @param driveName - the name of the sharepoint drive to upload the file to
       * @param path - the path from the sharepoint root
       * @returns {Promise<*>}
       */
      uploadFile: async (filename, filesize, readStream, driveName, filepath) => {
        // Create FileUpload object
        const options = {
          rangeSize: CHUNK_SIZE,
          uploadEventHandlers: {
            progress: range => {
              console.log(`Uploaded $filename bytes ${range?.minValue} to ${range?.maxValue} to ${path}`)
            }
          }
        }
        const driveId = graphQueryEntities.drives.find(d => d.name === driveName).id
        const location = path.join(filepath, filename)
        const fileObject = new StreamUpload(readStream, filename, filesize)

        try {
          const uploadSession = await LargeFileUploadTask.createUploadSession(client,
            `${base}/sites/${graphQueryEntities.siteId}/drives/${driveId}/root:${location}:/createUploadSession`, {
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
