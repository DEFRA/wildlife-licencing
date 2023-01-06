import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { models } from '@defra/wls-database-model'
import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { clearApplicationCaches } from './application-cache.js'
import db from 'debug'
const debug = db('api:submission')

export default async (context, req, h) => {
  try {
    const { applicationId } = context.request.params
    const application = await models.applications.findByPk(applicationId)

    // Check the application exists
    if (!application) {
      return h.response().code(404)
    }

    await clearApplicationCaches(applicationId)

    debug(`Received submission for applicationId: ${applicationId}`)
    const applicationQueue = getQueue(queueDefinitions.APPLICATION_QUEUE)
    const applicationJob = await applicationQueue.add({ applicationId })
    debug(`Queued application ${applicationId} - job: ${applicationJob.id}`)

    const fileQueue = getQueue(queueDefinitions.FILE_QUEUE)

    const applicationUploads = await models.applicationUploads.findAll({
      where: {
        applicationId
      }
    })

    for await (const upload of applicationUploads) {
      const fileJob = await fileQueue.add({ id: upload.dataValues.id, applicationId })
      debug(`Queued files for application ${applicationId} - job: ${fileJob.id}`)
    }

    await models.applications.update({ userSubmission: SEQUELIZE.getSequelize().fn('NOW') }, { where: { id: applicationId } })

    return h.response().code(204)
  } catch (err) {
    console.error('Error updating into APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
