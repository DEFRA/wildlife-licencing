import { Readable } from 'stream'
import { POWERAPPS } from '@defra/wls-connectors-lib'
import { model } from '../model/sdds-model.js'
import { buildRequestPath } from '../model/model-utils.js'
import { localObjectBuilder } from '../model/transformer.js'

const abortController = new global.AbortController()

async function * fetchApplications () {
  const path = buildRequestPath({ sdds_applications: model.sdds_applications })
  let p = path
  let next = false
  do {
    const result = await POWERAPPS.fetch(p)
    yield result.value.map(i => localObjectBuilder({ sdds_applications: model.sdds_applications }, i))
    const nextLink = result['@odata.nextLink']
    if (nextLink) {
      next = true
      p = nextLink.replace(POWERAPPS.getClientUrl() + '/', '')
    } else {
      next = false
    }
  } while (next)
}

export const extractApplications = () => {
  const stream = Readable.from(fetchApplications())

  // Abort if stream closed by consumer
  stream.on('close', () => {
    abortController.abort()
  })

  stream.on('data', (chunk) => {
    console.log(JSON.stringify(chunk, null, 2))
  })

  return stream
}
