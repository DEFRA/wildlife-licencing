import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'
import db from 'debug'
const debug = db('api:user-details-request')
export default async (_context, req, h) => {
  try {
    const { userId } = req.payload
    debug(`Submitting user details request for userId: ${userId} `)
    const userDetailsQueue = getQueue(queueDefinitions.USER_DETAILS_QUEUE)
    const userDetailsJob = await userDetailsQueue.add({ userId })
    debug(`Queued details request - job: ${userDetailsJob.id}`)
    return h.response().code(204)
  } catch (err) {
    console.error('Error queuing user details request', err)
    throw new Error(err.message)
  }
}
