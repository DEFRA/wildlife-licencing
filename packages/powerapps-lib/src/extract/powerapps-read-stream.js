import { Readable, Transform } from 'stream'
import { POWERAPPS } from '@defra/wls-connectors-lib'
import { buildRequestPath } from '../model/model-utils.js'
import { localObjectBuilder } from '../model/transformer.js'

async function * fetcher (path) {
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
 * Extract the a dataset from Power Apps based on a model and return a readable stream of transformed application objects
 * @returns {module:stream.internal.Transform}
 */
export const extractAndTransform = model => {
  const requestPath = buildRequestPath(model)
  const stream = Readable.from(fetcher(requestPath))
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
          this.push(localObjectBuilder(model, i))
        } catch (error) {
          console.error(error.message, error)
        }
      })
      callback()
    }
  })

  // The stream starts flow on pipe
  stream.pipe(transformStream)

  // Return immediately
  return transformStream
}
