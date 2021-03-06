import { Readable, Transform } from 'stream'
import { POWERAPPS } from '@defra/wls-connectors-lib'
import db from 'debug'
const debug = db('powerapps-lib:powerapps-read-stream')

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

export const powerAppsReadStream = (requestPath, objectTransformer) => {
  debug(`Open stream for reading with: ${requestPath}`)
  const stream = Readable.from(fetcher(requestPath))
  /*
   * Use a transform stream to apply the Power Apps to API transformation
   * and to ungroup the objects in the stream.
   * Errors are reported and stepped over
   */
  const transformStream = new Transform({
    objectMode: true,
    transform (data, _encoding, callback) {
      Promise.all(data.map(src => objectTransformer(src))).then(results => {
        if (results) {
          results.forEach(r => r && this.push(r))
        }
        callback()
      })
    }
  })

  stream.pipe(transformStream)

  // Return immediately
  return transformStream
}
