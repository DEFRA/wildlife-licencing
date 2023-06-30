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
      (habitatSite.updateStatus === 'U' && (
        hash(data.habitatSite) !== hash(habitatSite.habitatSite) ||
        data.applicationId !== habitatSite.applicationId ||
        data.licenceId !== habitatSite.licenceId
      ))) {
      await models.habitatSites.update({
        habitatSite: data.habitatSite,
        applicationId: application?.id,
        licenceId: licence?.id,
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
    // There is a bit of a problem that applicationId appears in the keys object twice;
    // (a) Via habitatSite.licenceId.applicationId
    // (b) Via habitatSite.applicationId
    // So you get two keys objects for applicationId
    // The processor will only extract the key data once, so to be safe we need to
    // Search for the one where the powerapps key is set
    const sddsApplicationId = keys.find(k => k.apiTable === 'applications' && k.powerAppsKey)?.powerAppsKey
    const sddsLicenceId = keys.find(k => k.apiTable === 'licences')?.powerAppsKey
    const activityId = keys.find(k => k.apiTable === 'activities')?.powerAppsKey
    const speciesId = keys.find(k => k.apiTable === 'species')?.powerAppsKey
    const speciesSubjectId = keys.find(k => k.apiTable === 'speciesSubject')?.powerAppsKey
    const methodIds = keys.filter(k => k.apiTable === 'methods')?.map(k => k.powerAppsKey)

    // Look for the activity and method - if it does not have it then ignore it
    if (activityId && speciesId && methodIds && methodIds.length) {
      Object.assign(data.habitatSite, { activityId, speciesId, speciesSubjectId, methodIds })
      // Kludge here, the method M:M is mapped into the payload in an array in this case
      // This is because the relationship was changed so there is no join table in the API database
      // The relationship creates { data.methods: [] } which needs to be removed
      delete data.habitatSite.methods

      let application
      if (sddsApplicationId) {
        application = await models.applications.findOne({
          where: { sdds_application_id: sddsApplicationId }
        })
      }

      let licence
      if (sddsLicenceId) {
        licence = await models.licences.findByPk(sddsLicenceId)
      }

      if (application || licence) {
        await doHabitatSite(sddsHabitatSiteId, ts, data, counter, application, licence)
      }
    }

    return counter
  } catch (error) {
    console.error('Error updating HABITAT-SITES', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
