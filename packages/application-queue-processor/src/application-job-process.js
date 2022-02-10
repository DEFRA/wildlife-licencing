import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { models } from '@defra/wls-database-model'
import { applicationUpdate, UnRecoverableBatchError, BaseKeyMapping } from '@defra/wls-powerapps-lib'

/**
 * Write the key information found in the response back into the table
 * @param targetKeys
 * @returns {Promise<unknown[]>}
 */
const postProcess = async targetKeys => {
  const applicationsKeys = targetKeys.filter(t => t.contentId).map(({ contentId, ...t }) => t).filter(t => t.apiTable === 'applications')
  const applicationId = applicationsKeys.filter(t => t.apiBasePath === 'application').map(t => t.apiKey)[0]
  const sddsApplicationsId = applicationsKeys.filter(t => t.apiBasePath === 'application').map(t => t.powerAppsKey)[0]

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
  const sitesKeys = targetKeys.filter(t => t.contentId).map(({ contentId, ...t }) => t).filter(t => t.apiTable === 'sites')
  return Promise.all(sitesKeys.map(s =>
    models.sites.update({
      submitted: SEQUELIZE.getSequelize().fn('NOW'),
      targetKeys: s,
      sddsSiteId: s.powerAppsKey,
      updateStatus: 'P'
    }, {
      where: {
        id: s.apiKey
      }
    })
  ))
}

/**
 * Merge the application and sites into a single API payload object
 * Read or construct targetKeys objects for each table instance
 * (Except the M2M relations which are managed only in Power Apps)
 *
 * The targetKeys are created or read from the database, then used to determine
 * each request method (POST, PATCH...). They are decorated by the response
 * from Power Apps and finally written back into the database tables
 *
 * @param userId
 * @param application
 * @returns {Promise<{application: any}>}
 */
async function buildApiObject (userId, applicationId) {
  const { application, targetKeys } = await models.applications.findByPk(applicationId)

  // Not found application - data corrupted
  if (!application) {
    return null
  }

  const keys = targetKeys
    ? targetKeys.map(t => BaseKeyMapping.copy(t))
    : [new BaseKeyMapping('applications',
        applicationId, 'sdds_applications')]

  const applicationSites = await models.applicationSites.findAll({
    where: { userId, applicationId }
  })

  const s = await models.sites.findAll({
    where: { id: applicationSites.map(s => s.dataValues.siteId) }
  })

  const sites = s.map(s => ({ id: s.dataValues.id, site: s.dataValues.site, targetKeys: s.dataValues.targetKeys }))
  keys.push(...sites.map(s => BaseKeyMapping.copy(s.targetKeys) ||
    new BaseKeyMapping('sites', s.id, 'applications.sites')))

  // Merge the Api Id into the update object as field **id**
  Object.assign(application, { id: applicationId })
  return {
    data: {
      application: Object.assign(application, { sites: sites.map(s => ({ id: s.id, ...s.site })) })
    },
    keys
  }
}

/**
 * The job process will read the data from the Postgres database and submit it to Power Apps.
 * Fot the application submission there are three components which are atomic and idempotent
 * and so may be treated in three independent batch updates; the application, the sites and the
 * application site relationship. The relationship must be done last.
 *
 * Recoverable exceptions from the PowerApp processes are FAILED - and so will be retried
 * UnRecoverable exceptions from the PowerApp processes are ENDED - and an error reported
 * @returns {Promise<void>}
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
    return postProcess(targetKeys, job)
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
