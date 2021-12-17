import { POWERAPPS, SEQUELIZE } from '@defra/wls-connectors-lib'
import { models } from '@defra/wls-database-model'

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
  try {
    const { applicationId } = job.data
    const application = await models.applications.findByPk(applicationId)

    if (!application) {
      console.error(`Cannot locate application: ${applicationId} in database`)
      return Promise.resolve()
    }

    const token = await POWERAPPS.getToken()
    console.log(token)

    const sequelize = SEQUELIZE.getSequelize()
    return models.applications.update({
      submitted: sequelize.fn('NOW')
    }, {
      where: {
        id: applicationId
      }
    })
  } catch (error) {
    return Promise.reject(error)
  }
}
