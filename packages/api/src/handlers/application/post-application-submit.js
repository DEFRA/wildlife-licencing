import { models } from '@defra/wls-database-model'
import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { clearCaches } from './application-cache.js'

export default async (context, req, h) => {
  try {
    const { userId, applicationId } = context.request.params
    const application = await models.applications.findByPk(applicationId)

    // Check the application exists
    if (!application) {
      return h.response().code(404)
    }

    await clearCaches(applicationId)
    const applicationQueue = getQueue(queueDefinitions.APPLICATION_QUEUE)
    const job = await applicationQueue.add({
      userId, applicationId
    })

    console.log(`Queued application ${applicationId} - job: ${job.id}`)

    return h.response().code(204)
  } catch (err) {
    console.error('Error updating into APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
