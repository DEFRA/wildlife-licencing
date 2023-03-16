import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import * as pkg from 'object-hash'
const hash = pkg.default

const doHabitatSite = async (sddsHabitatSiteId, ts, data, counter, application, licence) => {
  const habitatSite = await models.habitatSites.findOne({
    where: { sdds_habitat_site_id: sddsHabitatSiteId }
  })
  if (habitatSite) {
    if ((habitatSite.updateStatus === 'P' && ts > habitatSite.updatedAt) ||
      (habitatSite.updateStatus === 'U' && hash(data.habitatSite) !== hash(habitatSite.habitatSite))) {
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
      applicationId: application?.id,
      licenceId: licence?.id,
      updateStatus: 'U',
      habitatSite: data.habitatSite,
      sddsHabitatSiteId: sddsHabitatSiteId
    })
    counter.insert++
  }
}

export const writeHabitatSiteObject = async ({ data, keys }, ts) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }
  try {
    const sddsHabitatSiteId = keys.find(k => k.apiTable === 'habitatSites').powerAppsKey
    const sddsApplicationId = keys.find(k => k.apiTable === 'applications')?.powerAppsKey
    const sddsLicenceId = keys.find(k => k.apiTable === 'licences')?.powerAppsKey
    const activityId = keys.find(k => k.apiTable === 'activities')?.powerAppsKey
    const speciesId = keys.find(k => k.apiTable === 'species')?.powerAppsKey
    const speciesSubjectId = keys.find(k => k.apiTable === 'speciesSubject')?.powerAppsKey

    // Look for the activity and method - if it does not have it then ignore it
    if (activityId && speciesId) {
      Object.assign(data.habitatSite, { activityId, speciesId, speciesSubjectId })

      // The habitat-site is either attached to an application of a licence, not both
      if (sddsApplicationId) {
        const application = await models.applications.findOne({
          where: { sdds_application_id: sddsApplicationId }
        })

        if (application) {
          // Create or update the habitable sites
          await doHabitatSite(sddsHabitatSiteId, ts, data, counter, application)
        }
      } else if (sddsLicenceId) {
        const licence = await models.licences.findByPk(sddsLicenceId)
        if (licence) {
          // Create or update the habitable sites
          await doHabitatSite(sddsHabitatSiteId, ts, data, counter, null, licence)
        }
      }
    }

    return counter
  } catch (error) {
    console.error('Error updating HABITAT-SITES', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
