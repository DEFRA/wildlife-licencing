
import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'
import db from 'debug'
const debug = db('web-service:api-requests')

export const SITE = {
  /**
   * Create a site and associate it with an application
   * @param applicationId
   * @param site
   * @returns {Promise<void>}
   */
  create: async (applicationId, payload) => apiRequestsWrapper(
    async () => {
      const site = await API.post(apiUrls.SITE, payload)
      await API.post(apiUrls.APPLICATION_SITE, { applicationId, siteId: site.id })
      return site
    },
    `Error creating site with applicationId ${applicationId}`,
    500
  ),
  getSiteById: async siteId => apiRequestsWrapper(
    async () => {
      debug(`Getting site by id: ${siteId}`)
      return API.get(`${apiUrls.SITE}/${siteId}`)
    },
    `Error getting site by id: ${siteId}}`,
    500
  ),
  getApplicationSitesByUserId: async userId => apiRequestsWrapper(
    async () => {
      debug(`Getting application-sites site by user id: ${userId}`)
      return API.get(`${apiUrls.APPLICATION_SITES_SITES}`, `userId=${userId}`)
    },
      `Error getting application-sites site by id: ${userId}}`,
      500
  ),
  findByApplicationId: async applicationId => apiRequestsWrapper(
    async () => {
      const applicationSites = await API.get(`${apiUrls.APPLICATION_SITES}`, `applicationId=${applicationId}`)
      return Promise.all(applicationSites.map(async as => API.get(`${apiUrls.SITE}/${as.siteId}`)))
    },
    `Error finding sites with applicationId ${applicationId}`,
    500
  ),
  update: async (siteId, payload) => apiRequestsWrapper(
    async () => {
      await API.put(`${apiUrls.SITE}/${siteId}`, payload)
    },
    `Error updating site with siteId ${siteId}`,
    500
  ),
  destroy: async (applicationId, siteId) => apiRequestsWrapper(
    async () => {
      const [applicationSites] = await API.get(`${apiUrls.APPLICATION_SITES}`, `applicationId=${applicationId}&siteId=${siteId}`)
      await API.delete(`${apiUrls.APPLICATION_SITE}/${applicationSites.id}`)
      await API.delete(`${apiUrls.SITE}/${siteId}`)
    },
    `Error deleting site with siteId ${siteId}`,
    500
  )
}
