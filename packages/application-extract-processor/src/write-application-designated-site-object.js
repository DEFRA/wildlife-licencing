import { models } from '@defra/wls-database-model'
import { v4 as uuidv4 } from 'uuid'
import * as pkg from 'object-hash'
const hash = pkg.default

const doDesignatedSite = async (sddsApplicationDesignatedSiteId, designatedSiteId, ts, data, counter, application) => {
  const applicationDesignatedSite = await models.applicationDesignatedSites.findOne({
    where: { sdds_designated_site_id: sddsApplicationDesignatedSiteId }
  })

  if (applicationDesignatedSite) {
    if ((applicationDesignatedSite.updateStatus === 'P' && ts > applicationDesignatedSite.updatedAt) ||
      (applicationDesignatedSite.updateStatus === 'U' && hash(data.applicationDesignatedSites) !== hash(applicationDesignatedSite.designatedSite))) {
      await models.applicationDesignatedSites.update({
        designatedSiteId: designatedSiteId,
        designatedSite: data.applicationDesignatedSites,
        updateStatus: 'U'
      }, {
        where: {
          id: applicationDesignatedSite.id
        },
        returning: false
      })
      counter.update++
    }
  } else {
    // Create
    await models.applicationDesignatedSites.create({
      id: uuidv4(),
      applicationId: application.id,
      designatedSiteId: designatedSiteId,
      updateStatus: 'U',
      designatedSite: data.applicationDesignatedSites,
      sddsDesignatedSiteId: sddsApplicationDesignatedSiteId
    })
    counter.insert++
  }
}

export const writeApplicationDesignatedSiteObject = async ({ data, keys }, ts) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }
  try {
    const sddsApplicationDesignatedSiteId = keys.find(k => k.apiTable === 'applicationDesignatedSites').powerAppsKey
    const sddsApplicationId = keys.find(k => k.apiTable === 'applications' && k.powerAppsKey)?.powerAppsKey
    const designatedSiteId = keys.find(k => k.apiTable === 'designatedSites')?.powerAppsKey

    // Look for the application, and permission
    if (sddsApplicationId) {
      const application = await models.applications.findOne({
        where: { sdds_application_id: sddsApplicationId }
      })

      if (application) {
        await doDesignatedSite(sddsApplicationDesignatedSiteId, designatedSiteId, ts, data, counter, application)
      }
    }

    return counter
  } catch (error) {
    console.error('Error updating APPLICATION_DESIGNATED_SITES', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
