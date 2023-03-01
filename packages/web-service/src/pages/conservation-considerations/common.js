import { APIRequests } from '../../services/api-requests.js'

export const getDesignatedSites = async designatedSiteType => {
  const designatedSites = await APIRequests.DESIGNATED_SITES.getDesignatedSites()
  return designatedSites.filter(ds => ds.siteType === designatedSiteType)
    .map(ds => ({ id: ds.id, siteName: ds.siteName }))
}
