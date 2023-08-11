import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'
import db from 'debug'
const debug = db('api:user-details-request')
export const postUserUpdateSubmit = async (_context, req, h) => {
  try {
    const { userId, organisationId } = req.payload
    debug(`Submitting user details request for userId: ${userId} and organisationId: ${organisationId}`)
    const userDetailsQueue = getQueue(queueDefinitions.USER_DETAILS_QUEUE)
    const userDetailsJob = await userDetailsQueue.add({ userId, organisationId })
    debug(`Queued details request - job: ${userDetailsJob.id}`)
    return h.response().code(204)
  } catch (err) {
    console.error('Error queuing user details request', err)
    throw new Error(err.message)
  }
}
