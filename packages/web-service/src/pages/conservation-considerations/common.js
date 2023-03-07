import { APIRequests } from '../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { TASKLIST } from '../../uris.js'

const options = Object.values(PowerPlatformKeys.SITE_TYPE).map(v => v.option)
const abv = Object.values(PowerPlatformKeys.SITE_TYPE).reduce((a, c) => ({ ...a, [c.option]: c.abbr }), {})

export const checkSiteData = async (request, h) => {
  const { designatedSite } = await request.cache().getData()
  if (!designatedSite) {
    return h.redirect(TASKLIST.uri)
  }

  return null
}

export const getFilteredDesignatedSites = async () => {
  const designatedSites = await APIRequests.DESIGNATED_SITES.getDesignatedSites()
  return designatedSites.filter(ds => options.includes(ds.siteType))
    .map(s => ({ id: s.id, siteName: `${s.siteName} ${abv[s.siteType]}` }))
    .sort((a, b) => (a.siteName).localeCompare(b.siteName))
}

export const getCurrentSite = async request => {
  const { applicationId, designatedSite } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  return applicationDesignatedSites.find(ads => ads.id === designatedSite?.id)
}
