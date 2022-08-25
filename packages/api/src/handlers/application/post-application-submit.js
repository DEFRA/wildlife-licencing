import { models } from '@defra/wls-database-model'
import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { clearCaches } from './application-cache.js'

export default async (context, req, h) => {
  try {
    const { applicationId } = context.request.params
    const application = await models.applications.findByPk(applicationId)

    // Check the application exists
    if (!application) {
      return h.response().code(404)
    }

    await clearCaches(applicationId)
    const applicationQueue = getQueue(queueDefinitions.APPLICATION_QUEUE)
    const applicationJob = await applicationQueue.add({ applicationId })
    console.log(`Queued application ${applicationId} - job: ${applicationJob.id}`)

    const fileQueue = getQueue(queueDefinitions.FILE_QUEUE)

    const applicationUploads = await models.applicationUploads.findAll({
      where: {
        applicationId
      }
    })

    for await (const upload of applicationUploads) {
      const fileJob = await fileQueue.add({ id: upload.dataValues.id, applicationId })
      console.log(`Queued files for application ${applicationId} - job: ${fileJob.id}`)
    }

    await models.applications.update({ userSubmission: true }, { where: { id: applicationId } })

    return h.response().code(204)
  } catch (err) {
    console.error('Error updating into APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
