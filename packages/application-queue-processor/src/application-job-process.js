import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { models } from '@defra/wls-database-model'
import { batchUpdate, UnRecoverableBatchError } from '@defra/wls-powerapps-lib'

/**
 * Recoverable exceptions from the PowerApp processes are FAILED - and so will be retried
 * UnRecoverable exceptions from the PowerApp processes are ENDED - and an error reported
 * @returns {Promise<void>}
 */
export const applicationJobProcess = async job => {
  try {
    const { applicationId } = job.data
    const application = await models.applications.findByPk(applicationId)

    // Data error - unrecoverable
    if (!application) {
      console.error(`Cannot locate application: ${applicationId} in database`)
      return Promise.resolve()
    }

    const sequelize = SEQUELIZE.getSequelize()

    const result = await batchUpdate(application.dataValues.application)

    return models.applications.update({
      submitted: sequelize.fn('NOW'),
      targetKeys: result
    }, {
      where: {
        id: applicationId
      }
    })
  } catch (error) {
    if (error instanceof UnRecoverableBatchError) {
      console.error('Unrecoverable error', error.message)
    } else {
      console.log('Recoverable error', error.message)
      return Promise.reject(error)
    }
  }
}
