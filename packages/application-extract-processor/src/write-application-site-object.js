import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import pkg from 'sequelize'
const { Sequelize } = pkg
const Op = Sequelize.Op

async function doSite (application, site, counter) {
  // Test if the application-site exists using the power Apps Keys
  const applicationSitePAKeys = await models.applicationSites.findOne({
    where: {
      [Op.and]: [
        { sdds_application_id: application.sddsApplicationId },
        { sdds_site_id: site.sddsSiteId }
      ]
    }
  })

  // If the record is found using the power apps keys then there is nothing to do.
  // if the record is not found attempt to find it using the looked up API keys
  if (!applicationSitePAKeys) {
    const applicationSiteApiKeys = await models.applicationSites.findOne({
      where: {
        [Op.and]: [
          { application_id: application.id },
          { site_id: site.id }
        ]
      }
    })

    // If the record is not found then create it
    // If the record is found then only set the Power Apps keys
    if (!applicationSiteApiKeys) {
      await models.applicationSites.create({
        id: uuidv4(),
        applicationId: application.id,
        sddsApplicationId: application.sddsApplicationId,
        siteId: site.id,
        sddsSiteId: site.sddsSiteId
      })
      counter.insert++
    } else {
      await models.applicationSites.update({
        sddsApplicationId: application.sddsApplicationId,
        sddsSiteId: site.sddsSiteId
      }, {
        where: {
          id: applicationSiteApiKeys.id
        },
        returning: false
      })
      counter.update++
    }
  }
}

/**
 * Write the application-site relationship
 * @param obj
 * @returns {Promise<{pending: number, insert: number, update: number, error: number}>}
 */
export const writeApplicationSiteObject = async ({ _data, keys }) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }

  const sddsApplicationId = keys.find(k => k.apiTable === 'applications').powerAppsKey
  const sddsSiteIds = keys.filter(k => k.apiTable === 'sites').map(k => k.powerAppsKey)

  try {
    // Find the application record using the Power Apps keys
    const application = await models.applications.findOne({
      where: { sdds_application_id: sddsApplicationId }
    })

    // If the applications is not (yet) in the database do nothing
    if (application) {
      for (const sddsSiteId of sddsSiteIds) {
        // Find the site record using the Power Apps keys
        const site = await models.sites.findOne({
          where: { sdds_site_id: sddsSiteId }
        })

        // If these records are (yet) not in the database then do nothing
        if (site) {
          await doSite(application, site, counter)
        }
      }
    }

    return counter
  } catch (error) {
    console.error('Error updating APPLICATION-SITES', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
