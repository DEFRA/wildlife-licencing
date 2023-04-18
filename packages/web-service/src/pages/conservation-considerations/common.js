import { APIRequests } from '../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { conservationConsiderationURIs } from '../../uris.js'

const options = Object.values(PowerPlatformKeys.SITE_TYPE).map(v => v.option)
const abv = Object.values(PowerPlatformKeys.SITE_TYPE).reduce((a, c) => ({ ...a, [c.option]: c.abbr }), {})

export const getFilteredDesignatedSites = async () => {
  const designatedSites = await APIRequests.DESIGNATED_SITES.getDesignatedSites()
  return designatedSites.filter(ds => options.includes(ds.siteType))
    .map(s => ({ id: s.id, siteName: `${s.siteName} ${abv[s.siteType]}` }))
    .sort((a, b) => (a.siteName).localeCompare(b.siteName))
}

export const getCurrentSite = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, designatedSite } = journeyData
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const params = new URLSearchParams(request.query)
  const id = params.get('id')

  if (id) {
    // Reseat the cache on the site specified
    const applicationDesignatedSite = applicationDesignatedSites.find(ads => ads.id === id)
    if (applicationDesignatedSite) {
      journeyData.designatedSite = {
        id: applicationDesignatedSite.id,
        designatedSiteId: applicationDesignatedSite.designatedSiteId
      }
      await request.cache().setData(journeyData)
      return applicationDesignatedSite
    }
  } else if (designatedSite) {
    // Return the currently selected application-designated-site
    return applicationDesignatedSites.find(ads => ads.id === designatedSite?.id)
  }

  return null
}

export const allCompletion = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, designatedSite } = journeyData
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const applicationDesignatedSite = applicationDesignatedSites.find(ads => ads.id === designatedSite?.id)

  if (applicationDesignatedSite.permissionFromOwner === undefined) {
    return conservationConsiderationURIs.OWNER_PERMISSION.uri
  }

  if (applicationDesignatedSite.permissionFromOwner && !applicationDesignatedSite.detailsOfPermission) {
    return conservationConsiderationURIs.OWNER_PERMISSION_DETAILS.uri
  }

  if (applicationDesignatedSite.adviceFromNaturalEngland === undefined) {
    return conservationConsiderationURIs.NE_ADVICE.uri
  }

  if (applicationDesignatedSite.adviceFromNaturalEngland && !applicationDesignatedSite.adviceFromWho) {
    return conservationConsiderationURIs.ACTIVITY_ADVICE.uri
  }

  if (applicationDesignatedSite.onSiteOrCloseToSite === undefined) {
    return conservationConsiderationURIs.DESIGNATED_SITE_PROXIMITY.uri
  }

  return conservationConsiderationURIs.DESIGNATED_SITE_CHECK_ANSWERS.uri
}
