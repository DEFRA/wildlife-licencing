import { models } from '@defra/wls-database-model'
import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'
import db from 'debug'
const debug = db('api:submission')

export default async (context, _req, h) => {
  try {
    const { applicationId } = context.request.params
    const application = await models.applications.findByPk(applicationId)

    // Check the application exists
    if (!application) {
      return h.response().code(404)
    }

    debug(`Received request for licence resend for applicationId: ${applicationId}`)
    const resendQueue = getQueue(queueDefinitions.LICENCE_RESEND_QUEUE)
    const resendJob = await resendQueue.add({ applicationId })
    debug(`Queued licence resend for application ${applicationId} - job: ${resendJob.id}`)

    return h.response().code(204)
  } catch (err) {
    console.error('Error updating into APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
