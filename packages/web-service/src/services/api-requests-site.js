
import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'

export const SITE = {
  /**
   * Create a site and associate it with an application
   * @param applicationId
   * @param site
   * @returns {Promise<void>}
   */
  create: async (applicationId, payload) => {
    return apiRequestsWrapper(
      async () => {
        const site = await API.post(apiUrls.SITE, payload)
        await API.post(apiUrls.APPLICATION_SITE, { applicationId, siteId: site.id })
        return site
      },
      `Error creating site with applicationId ${applicationId}`,
      500
    )
  },
  findByApplicationId: async applicationId => {
    return apiRequestsWrapper(
      async () => {
        const applicationSites = await API.get(`${apiUrls.APPLICATION_SITES}`, `applicationId=${applicationId}`)
        return Promise.all(applicationSites.map(async as => API.get(`${apiUrls.SITE}/${as.siteId}`)))
      },
      `Error finding sites with applicationId ${applicationId}`,
      500
    )
  },
  update: async (siteId, payload) => {
    return apiRequestsWrapper(
      async () => {
        await API.put(`${apiUrls.SITE}/${siteId}`, payload)
      },
      `Error updating site with siteId ${siteId}`,
      500
    )
  },
  destroy: async (applicationId, siteId) => {
    return apiRequestsWrapper(
      async () => {
        const [applicationSites] = await API.get(`${apiUrls.APPLICATION_SITES}`, `applicationId=${applicationId}&siteId=${siteId}`)
        await API.delete(`${apiUrls.APPLICATION_SITE}/${applicationSites.id}`)
        await API.delete(`${apiUrls.SITE}/${siteId}`)
      },
      `Error deleting site with siteId ${siteId}`,
      500
    )
  }
}
