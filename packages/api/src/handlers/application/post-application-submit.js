import { models } from '../../../../database-model/src/sequentelize-model.js'
import { clearCaches } from './application-cache.js'
import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'

export default async (context, req, h) => {
  try {
    const { userId, applicationId } = context.request.params
    const application = await models.applications.findByPk(applicationId)

    // Check the user exists
    if (!application) {
      return h.response().code(404)
    }

    await clearCaches(userId, applicationId)
    const applicationQueue = getQueue(queueDefinitions.APPLICATION_QUEUE)
    const job = await applicationQueue.add({
      userId, applicationId
    })

    console.log(`Added job: ${job.id}`)

    return h.response().code(204)
  } catch (err) {
    console.error('Error updating into APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
