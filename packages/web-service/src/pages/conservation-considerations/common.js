import { APIRequests } from '../../services/api-requests.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
const { SSSI } = conservationConsiderationURIs
const { SITE_OF_SPECIAL_SCIENTIFIC_INTEREST } = PowerPlatformKeys.SITE_TYPE

export const getDesignatedSites = async designatedSiteType => {
  const designatedSites = await APIRequests.DESIGNATED_SITES.getDesignatedSites()
  return designatedSiteType
    ? designatedSites.filter(ds => ds.siteType === designatedSiteType).map(ds => ({ id: ds.id, siteName: ds.siteName }))
    : designatedSites.map(ds => ({ id: ds.id, siteName: ds.siteName }))
}

export const checkSSSIData = async (request, h) => {
  const { applicationId } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const sssiSite = applicationDesignatedSites.find(ads => ads.designatedSiteType === SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  if (!sssiSite) {
    return h.redirect(SSSI.uri)
  }

  return null
}
