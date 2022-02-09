import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { models } from '@defra/wls-database-model'
import { applicationUpdate, UnRecoverableBatchError, BaseKeyMapping } from '@defra/wls-powerapps-lib'

// async function applicationProcess (applicationId, job) {
//   const application = await models.applications.findByPk(applicationId)
//
//   // Data error - unrecoverable
//   if (!application) {
//     console.error(`Cannot locate application: ${applicationId} for job: ${JSON.stringify(job.data)}`)
//     return Promise.resolve()
//   }
//
//   const { application: applicationJson, targetKeys } = application.dataValues
//
//   const result = await applicationUpdate(applicationJson, targetKeys)
//
//   // Set the status to pending which disallows overwriting by the extraction process
//   return models.applications.update({
//     submitted: SEQUELIZE.getSequelize().fn('NOW'),
//     targetKeys: result,
//     sddsApplicationId: result.sdds_applications.eid,
//     updateStatus: 'P'
//   }, {
//     where: {
//       id: applicationId
//     }
//   })
// }

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
  const { application, targetKeys, id } = await models.applications.findByPk(applicationId)

  // Not found application - data corrupted
  if (!application) {
    return null
  }

  const keys = {
    application: targetKeys || new BaseKeyMapping('applications', id, 'sdds_applications')
  }

  const applicationSites = await models.applicationSites.findAll({
    where: { userId, applicationId: id }
  })

  const s = await models.sites.findAll({
    where: { id: applicationSites.map(s => s.dataValues.siteId) }
  })

  const sites = s.map(s => ({ id: s.dataValues.id, site: s.dataValues.site, targetKeys: s.dataValues.targetKeys }))
  keys.sites =
    sites.map(s => s.targetKeys || new BaseKeyMapping('sites', s.id, 'sdds_sites'))

  // Arrays need to have the Api Id merged in to protect the sequence. Expect Id
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

    const { data, keys } = apiObject
    await applicationUpdate(data, keys)
    // await applicationProcess(applicationId, job)
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
