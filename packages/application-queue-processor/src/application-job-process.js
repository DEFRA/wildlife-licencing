import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { models } from '@defra/wls-database-model'
import { applicationUpdate, UnRecoverableBatchError, BaseKeyMapping } from '@defra/wls-powerapps-lib'

/**
 * Write the key information created from the batch response back into the tables
 * @param targetKeys
 * @returns {Promise<unknown[]>}
 */
export const postProcess = async targetKeys => {
  try {
    const applicationsKeys = targetKeys.filter(t => t.contentId).map(({
      contentId,
      ...t
    }) => t).filter(t => t.apiTable === 'applications')

    // Get keys from top level entry
    const top = applicationsKeys.find(t => t.powerAppsTable === 'sdds_applications')
    const applicationId = top.apiKey
    const sddsApplicationsId = top.powerAppsKey

    // Save keys in applications table
    await models.applications.update({
      submitted: SEQUELIZE.getSequelize().fn('NOW'),
      targetKeys: applicationsKeys,
      sddsApplicationId: sddsApplicationsId,
      updateStatus: 'P'
    }, {
      where: {
        id: applicationId
      }
    })

    // Save the keys into the sites table
    // The contentId is only used during the transaction and not persisted
    const sitesKeys = targetKeys.filter(t => t.contentId).map(({
      contentId,
      ...t
    }) => t).filter(t => t.apiTable === 'sites')

    // Make the updates to the site and application-sites
    await Promise.all(sitesKeys.map(async s => {
      await models.sites.update({
        submitted: SEQUELIZE.getSequelize().fn('NOW'),
        targetKeys: s,
        sddsSiteId: s.powerAppsKey,
        updateStatus: 'P'
      }, {
        where: {
          id: s.apiKey
        }
      })

      await models.applicationSites.update({
        sddsSiteId: s.powerAppsKey,
        sddsApplicationId: sddsApplicationsId
      }, {
        where: {
          applicationId: applicationId,
          siteId: s.apiKey
        }
      })
    }))
  } catch (error) {
    console.error('Error writing response data to database', error)
    throw new Error(error)
  }
}

/**
 * Merge the application and sites into a single API payload object
 * Read or construct targetKeys objects for each table
 *
 * The targetKeys are created or read from the database, then used to determine
 * each request method (POST, PATCH...). They are decorated by the response
 * from Power Apps and finally written back into the database tables
 *
 * @param userId
 * @param applicationId
 * @returns {Promise<{application: any}>}
 */
export const buildApiObject = async (userId, applicationId) => {
  try {
    const applicationResult = await models.applications.findByPk(applicationId)

    // Not found application - data corrupted
    if (!applicationResult) {
      return null
    }

    const { targetKeys, application } = applicationResult.dataValues
    application.id = applicationId
    const data = { application }

    const keys = targetKeys
      ? targetKeys.map(t => BaseKeyMapping.copy(t))
      : [new BaseKeyMapping('applications', applicationId, 'application', 'sdds_applications')]

    const applicationSites = await models.applicationSites.findAll({
      where: { userId, applicationId }
    })

    if (applicationSites.length) {
      const sitesFound = await models.sites.findAll({
        where: { id: applicationSites.map(s => s.dataValues.siteId) }
      })

      const sites = sitesFound.map(s => ({
        id: s.dataValues.id,
        site: s.dataValues.site,
        targetKeys: s.dataValues.targetKeys
      }))
      data.application.sites = sites.map(s => ({ id: s.id, ...s.site }))
      keys.push(...sites.map(s => BaseKeyMapping.copy(s.targetKeys) ||
        new BaseKeyMapping('sites', s.id, 'application.sites', 'sdds_sites')))
    }

    return { data, keys }
  } catch (error) {
    console.error('Error building source object and keys', error)
    throw new Error(error)
  }
}

/**
 * The job process will read the data from the Postgres database and submit it to Power Apps.
 * The application submission is atomic and idempotent.
 *
 * Recoverable exceptions from the PowerApp processes are FAILED - and so will be retried
 * UnRecoverable exceptions from the PowerApp processes are ENDED - and an error reported
 *
 * @param job - The job object from the queue
 * @returns {Promise<*[]|void>}
 */
export const applicationJobProcess = async job => {
  try {
    const { userId, applicationId } = job.data
    const apiObject = await buildApiObject(userId, applicationId)

    if (!apiObject) {
      console.error(`Cannot locate application: ${applicationId} for job: ${JSON.stringify(job.data)}`)
      return Promise.resolve()
    }

    // Update the application and associated data in Power Apps
    const { data, keys } = apiObject
    const targetKeys = await applicationUpdate(data, keys)
    await postProcess(targetKeys)
    return Promise.resolve()
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
