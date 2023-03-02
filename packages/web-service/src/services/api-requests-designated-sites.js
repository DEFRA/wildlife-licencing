import { apiRequestsWrapper, apiUrls } from './api-requests.js'
import { API, REDIS } from '@defra/wls-connectors-lib'

const makeDesignatedSitesMapArr = async () => {
  const designatedSites = await API.get(`${apiUrls.DESIGNATED_SITES}`)
  const nameSet = new Set(designatedSites.map(ds => ds.siteName))
  return [...nameSet.values()]
    .map(n => ([n, {
      sites: designatedSites.filter(s => s.siteName === n)
        .map(fs => ({ id: fs.id, siteType: fs.siteType }))
    }]))
}

export const DESIGNATED_SITES = {
  getDesignatedSitesNameMap: () => apiRequestsWrapper(async () => {
    const mapArray = await REDIS.cache.restore('designated-site-map')
    if (mapArray) {
      return new Map(JSON.parse(mapArray))
    } else {
      const refreshedMapArray = await makeDesignatedSitesMapArr()
      await REDIS.cache.save('designated-site-map', refreshedMapArray)
      return new Map(refreshedMapArray)
    }
  },
  'Error fetching designated sites', 500),
  getDesignatedSites: () =>
    apiRequestsWrapper(() => API.get(`${apiUrls.DESIGNATED_SITES}`),
      'Error fetching designated sites', 500),
  get: applicationId =>
    apiRequestsWrapper(() => API.get(`${apiUrls.APPLICATION}/${applicationId}/designated-sites`),
      'Error fetching application-designated sites', 500),
  create: async (applicationId, payload) =>
    apiRequestsWrapper(() => API.post(`${apiUrls.APPLICATION}/${applicationId}/designated-site`, payload),
      'Error fetching application-designated sites', 500),
  update: async (applicationId, applicationDesignatedSiteId, payload) =>
    apiRequestsWrapper(() => API.put(`${apiUrls.APPLICATION}/${applicationId}/designated-site/${applicationDesignatedSiteId}`, payload),
      'Error updating application-designated sites', 500),
  destroy: async (applicationId, applicationDesignatedSiteId) =>
    apiRequestsWrapper(() => API.delete(`${apiUrls.APPLICATION}/${applicationId}/designated-site/${applicationDesignatedSiteId}`),
      'Error deleting application-designated sites', 500)
}
