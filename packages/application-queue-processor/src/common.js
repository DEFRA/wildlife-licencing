import db from 'debug'
import { models } from '@defra/wls-database-model'
import { SEQUELIZE } from '@defra/wls-connectors-lib'

/**
 * Write the key information created from the batch response back into the tables
 * @param targetKeys
 * @returns {Promise<unknown[]>}
 */
export const postProcess = async targetKeys => {
  const debug = db('queue-processor:post-process')
  debug(`Post process batch response object: ${JSON.stringify(targetKeys, null, 4)}`)
  const MODEL_MAP = {
    applications: { sddsKey: 'sddsApplicationId' },
    sites: { sddsKey: 'sddsSiteId' },
    contacts: { sddsKey: 'sddsContactId' },
    accounts: { sddsKey: 'sddsAccountId' },
    habitatSites: { sddsKey: 'sddsHabitatSiteId' },
    previousLicences: { sddsKey: 'sddsPreviousLicenceId' },
    permissions: { sddsKey: 'sddsPermissionsId' },
    applicationDesignatedSites: { sddsKey: 'sddsDesignatedSiteId' },
    returns: { sddsKey: 'sddsReturnId' },
    feedbacks: { sddsKey: 'sddsFeedbackId' }
  }

  try {
    for (const tk of targetKeys.filter(k => k.apiTableName)) {
      await models[tk.apiTableName].update({
        submitted: SEQUELIZE.getSequelize().fn('NOW'),
        [MODEL_MAP[tk.apiTableName].sddsKey]: tk.keys.sddsKey,
        updateStatus: 'P'
      }, {
        where: {
          id: tk.keys.apiKey
        }
      })
    }
  } catch (error) {
    console.error('Error writing response data to database', error)
    throw new Error(error)
  }
}
