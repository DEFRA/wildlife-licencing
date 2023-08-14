import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'
import db from 'debug'
const debug = db('api:organisation-details-request')

export default async (_context, req, h) => {
  try {
    const { organisationId } = req.payload
    debug(`Submitting organisation details request for organisationId: ${organisationId}`)
    const organisationDetailsQueue = getQueue(queueDefinitions.ORGANISATION_DETAILS_QUEUE)
    const organisationDetailsJob = await organisationDetailsQueue.add({ organisationId })
    debug(`Queued details request - job: ${organisationDetailsJob.id}`)
    return h.response().code(204)
  } catch (err) {
    console.error('Error queuing organisation details request', err)
    throw new Error(err.message)
  }
}
