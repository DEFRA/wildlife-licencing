import { apiRequestsWrapper, apiUrls } from './api-requests.js'
import { API } from '@defra/wls-connectors-lib'

export const DESIGNATED_SITES = {
  getDesignatedSites: () =>
    apiRequestsWrapper(() => API.get(`${apiUrls.DESIGNATED_SITES}`),
      'Error fetching designated sites', 500),
  get: applicationId =>
    apiRequestsWrapper(() => API.get(`${apiUrls.APPLICATION}/${applicationId}/designated-sites`),
      'Error fetching application-designated sites', 500),
  create: async (applicationId, payload) =>
    apiRequestsWrapper(() => API.post(`${apiUrls.APPLICATION}/${applicationId}/designated-site`, payload),
      'Error creating application-designated sites', 500),
  update: async (applicationId, applicationDesignatedSiteId, payload) =>
    apiRequestsWrapper(() => API.put(`${apiUrls.APPLICATION}/${applicationId}/designated-site/${applicationDesignatedSiteId}`, payload),
      'Error updating application-designated sites', 500),
  destroy: async (applicationId, applicationDesignatedSiteId) =>
    apiRequestsWrapper(() => API.delete(`${apiUrls.APPLICATION}/${applicationId}/designated-site/${applicationDesignatedSiteId}`),
      'Error deleting application-designated sites', 500)
}
