import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { models } from '@defra/wls-database-model'
import { applicationUpdate, UnRecoverableBatchError } from '@defra/wls-powerapps-lib'

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
      console.error(`Cannot locate application: ${applicationId} for job: ${JSON.stringify(job.data)}`)
      return Promise.resolve()
    }

    const { application: applicationJson, targetKeys } = application.dataValues

    const result = await applicationUpdate(applicationJson, targetKeys)

    return models.applications.update({
      submitted: SEQUELIZE.getSequelize().fn('NOW'),
      targetKeys: result,
      sddsApplicationId: result.sdds_applications.eid,
      updateStatus: 'P'
    }, {
      where: {
        id: applicationId
      }
    })
  } catch (error) {
    if (error instanceof UnRecoverableBatchError) {
      console.error(`Unrecoverable error for job: ${JSON.stringify(job.data)}`, error.message)
      return Promise.resolve()
    } else {
      console.log(`Recoverable error for job: ${JSON.stringify(job.data)}`, error.message)
      return Promise.reject(error)
    }
  }
}
