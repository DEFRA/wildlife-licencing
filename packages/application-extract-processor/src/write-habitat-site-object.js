import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import * as pkg from 'object-hash'
const hash = pkg.default

export const writeHabitatSiteObject = async ({ data, keys }, ts) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }
  try {
    const sddsApplicationId = keys.find(k => k.apiTable === 'applications')?.powerAppsKey

    // Look for the application - if it does not exist then ignore
    if (sddsApplicationId) {
      const application = await models.applications.findOne({
        where: { sdds_application_id: sddsApplicationId }
      })

      if (application) {
        const sddsHabitatSiteIds = keys.filter(k => k.apiTable === 'habitatSites').map(k => k.powerAppsKey)
        // Create or update the habitable sites
        for (const sddsHabitatSiteId of sddsHabitatSiteIds) {
          const habitatSite = await models.habitatSites.findOne({
            where: { sdds_habitat_site_id: sddsHabitatSiteId }
          })
          if (habitatSite) {
            if ((habitatSite.updateStatus === 'P' && ts > habitatSite.updatedAt) || (habitatSite.updateStatus === 'U' && hash(data.habitatSite) !== hash(habitatSite.habitatSite))) {
              await models.habitatSites.update({
                habitatSite: data.habitatSite,
                updateStatus: 'U'
              }, {
                where: {
                  id: habitatSite.id
                },
                returning: false
              })
              counter.update++
            }
          } else {
            // Create
            await models.habitatSites.create({
              id: uuidv4(),
              applicationId: application.id,
              updateStatus: 'U',
              habitatSite: data.habitatSite,
              sddsHabitatSiteId: sddsHabitatSiteId
            })
            counter.insert++
          }
        }
      }
    }

    return counter
  } catch (error) {
    console.error('Error updating HABITAT-SITES', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
