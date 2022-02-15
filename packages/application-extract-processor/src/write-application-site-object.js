import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import pkg from 'sequelize'
const { Sequelize } = pkg

export const writeApplicationSiteObject = async (obj, ts) => {
  const { data, keys } = obj
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
              sddsApplicationId: data.application.id,
              siteId: site.id,
              sddsSiteId: s.id
            })
            counter.insert++
          }
        } else {
          await models.applicationSites.update({
            userId: application.userId,
            applicationId: application.id,
            sddsApplicationId: data.application.id,
            siteId: site.id,
            sddsSiteId: s.id
          }, {
            where: {
              id: applicationSite.dataValues.id
            },
            returning: false
          })
          counter.update++
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
