import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import pkg from 'sequelize'
const { Sequelize } = pkg

export const writeApplicationSiteObject = async obj => {
  const { data } = obj
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }
  try {
    const Op = Sequelize.Op
    if (data.application.sites.length > 0) {
      for (const s of data.application.sites) {
        const applicationSite = await models.applicationSites.findOne({
          where: {
            [Op.and]: [
              { sdds_application_id: data.application.id },
              { sdds_site_id: s.id }
            ]
          }
        })

        const application = await models.applications.findOne({
          where: { sdds_application_id: data.application.id }
        })

        const site = await models.sites.findOne({
          where: { sdds_site_id: s.id }
        })

        if (!applicationSite) {
          if (application && site) {
            await models.applicationSites.create({
              id: uuidv4(),
              userId: application.userId,
              applicationId: application.id,
              sddsApplicationId: application.sddsApplicationId,
              siteId: site.id,
              sddsSiteId: site.sddsSiteId
            })
            counter.insert++
          }
        } else {
          if (application && site) {
            await models.applicationSites.update({
              userId: application.userId,
              applicationId: application.id,
              sddsApplicationId: application.sddsApplicationId,
              siteId: site.id,
              sddsSiteId: site.sddsSiteId
            }, {
              where: {
                id: applicationSite.dataValues.id
              },
              returning: false
            })
            counter.update++
          }
        }

        // If a site was created on Power Apps and does not have a user assigned then the user
        // Can be transferred from the application to the site.
        // It is possible that a site without a user is created in Power Apps
        // and subsequently assigned to an application created in the API with a user
        // In this case the user can be assigned to the site. The site may also
        // be attached to a user-less application is which case we ignore.
        if (application && site && !site.dataValues.user && application.dataValues.userId) {
          await models.sites.update({
            userId: application.dataValues.userId
          }, {
            where: { id: site.dataValues.id }
          })
        }
      }

      return counter
    } else {
      // No sites for an application - nothing to do
      return { insert: 0, update: 0, pending: 0, error: 0 }
    }
  } catch (error) {
    console.error('Error updating sites', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
