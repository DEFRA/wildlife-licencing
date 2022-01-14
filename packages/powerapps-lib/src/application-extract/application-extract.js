import { Readable, Transform } from 'stream'
import { POWERAPPS } from '@defra/wls-connectors-lib'
import { model } from '../model/sdds-model.js'
import { buildRequestPath } from '../model/model-utils.js'
import { localObjectBuilder } from '../model/transformer.js'

const abortController = new global.AbortController()

// TODO Add filter &$filter=sdds_sourceremote eq true
async function * fetchApplications (path) {
  let p = path
  let next = false
  do {
    const result = await POWERAPPS.fetch(p)
    yield result.value
    const nextLink = result['@odata.nextLink']
    if (nextLink) {
      next = true
      p = nextLink.replace(POWERAPPS.getClientUrl() + '/', '')
    } else {
      next = false
    }
  } while (next)
}

/**
 * Extract the applications from Power Apps and return a readable stream of transformed application objects
 * @returns {module:stream.internal.Transform}
 */
export const extractApplications = () => {
  const stream = Readable.from(fetchApplications(buildRequestPath({ sdds_applications: model.sdds_applications })))
  /*
   * Use a transform stream to apply the Power Apps to API transformation
   * and to ungroup the objects in the stream.
   * Errors are reported and stepped over
   */
  const transformStream = new Transform({
    objectMode: true,
    transform (data, encoding, callback) {
      data.forEach(i => {
        try {
          this.push(localObjectBuilder({ sdds_applications: model.sdds_applications }, i))
        } catch (error) {
          console.error(error.message, error)
        }
      })
      callback()
    }
  })

  // Abort if stream closed by consumer
  stream.on('close', () => {
    abortController.abort()
  })

  // The stream starts flow on pipe
  stream.pipe(transformStream)

  // Return immediately
  return transformStream
}
