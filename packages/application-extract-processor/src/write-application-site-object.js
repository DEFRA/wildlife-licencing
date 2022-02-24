import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import pkg from 'sequelize'
const { Sequelize } = pkg
const Op = Sequelize.Op

/**
 * If a site was created on Power Apps and does not have a user assigned then the user
 * Can be transferred from the application to the site.
 * It is possible that a site without a user is created in Power Apps
 * and subsequently assigned to an application created in the API with a user
 * In this case the user can be assigned to the site. The site may also
 * be attached to a user-less application is which case we ignore.
 * @param site
 * @param application
 * @returns {Promise<void>}
 */
async function updateOwnership (site, application) {
  if (!site.dataValues.userId && application.dataValues.userId) {
    await models.sites.update({
      userId: application.dataValues.userId
    }, {
      where: { id: site.dataValues.id }
    })
  }
}

async function doSite (data, s, application, site, counter) {
  // Test if the application-site exists using the power Apps Keys
  const applicationSitePAKeys = await models.applicationSites.findOne({
    where: {
      [Op.and]: [
        { sdds_application_id: data.application.id },
        { sdds_site_id: s.id }
      ]
    }
  })

  // If the record is found using the power apps keys then there is nothing to do.
  // if the record is not found attempt to find it using the looked up API keys
  if (!applicationSitePAKeys) {
    const applicationSiteApiKeys = await models.applicationSites.findOne({
      where: {
        [Op.and]: [
          { application_id: application.dataValues.id },
          { site_id: site.dataValues.id }
        ]
      }
    })

    // If the record is not found then create it
    // If the record is found then only set the Power Apps keys
    if (!applicationSiteApiKeys) {
      await models.applicationSites.create({
        id: uuidv4(),
        userId: application.userId,
        applicationId: application.dataValues.id,
        sddsApplicationId: data.application.id,
        siteId: site.dataValues.id,
        sddsSiteId: s.id
      })
      counter.insert++
    } else {
      await models.applicationSites.update({
        sddsApplicationId: data.application.id,
        sddsSiteId: s.id
      }, {
        where: {
          id: applicationSiteApiKeys.dataValues.id
        },
        returning: false
      })
      counter.update++
    }
  }

  await updateOwnership(site, application)
}

/**
 * Write the application-site relationship
 * @param obj
 * @returns {Promise<{pending: number, insert: number, update: number, error: number}>}
 */
export const writeApplicationSiteObject = async obj => {
  const { data } = obj
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }

  try {
    // Find the application record using the Power Apps keys
    const application = await models.applications.findOne({
      where: { sdds_application_id: data.application.id }
    })

    // If the applications is not (yet) in the database do nothing
    if (application) {
      for (const s of data.application.sites) {
        // Find the site record using the Power Apps keys
        const site = await models.sites.findOne({
          where: { sdds_site_id: s.id }
        })

        // If these records are (yet) not in the database then do nothing
        if (site) {
          await doSite(data, s, application, site, counter)
        }
      }
    }

    return counter
  } catch (error) {
    console.error('Error updating sites', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
