import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { models } from '@defra/wls-database-model'
import { SEQUELIZE } from '@defra/wls-connectors-lib'

/**
 * Should fail on:
 * - exceptions due to connectivity
 * - 500 errors from dynamics
 * - authentication errors
 * - unexpected exceptions
 * Log error AND resolve on:
 * - Any 400 errors
 * - Data not found
 * @returns {Promise<void>}
 */
export const applicationJobProcess = async job => {
  const { applicationId } = job.data
  const application = await models.applications.findByPk(applicationId)

  if (!application) {
    console.error(`Cannot locate application: ${applicationId} in database`)
    return Promise.resolve()
  }

  const sequelize = SEQUELIZE.getSequelize()
  await models.applications.update({
    submitted: sequelize.fn('NOW')
  }, {
    where: {
      id: applicationId
    }
  })
}

export const jobProcess = async () => {
  const applicationQueue = getQueue(queueDefinitions.APPLICATION_QUEUE)
  applicationQueue.process(applicationJobProcess)
}
