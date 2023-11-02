import { APIRequests } from '../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { conservationConsiderationURIs, TASKLIST } from '../../uris.js'

const { DESIGNATED_SITE_CHECK_ANSWERS } = conservationConsiderationURIs

const options = Object.values(PowerPlatformKeys.SITE_TYPE).map(v => v.option)
const abv = Object.values(PowerPlatformKeys.SITE_TYPE).reduce((a, c) => ({ ...a, [c.option]: c.abbr }), {})

export const getFilteredDesignatedSites = async () => {
  const designatedSites = await APIRequests.DESIGNATED_SITES.getDesignatedSites()
  return designatedSites.filter(ds => options.includes(ds.siteType))
    .map(s => ({ id: s.id, siteName: `${s.siteName} ${abv[s.siteType]}` }))
    .sort((a, b) => (a.siteName).localeCompare(b.siteName))
}

export const checkDesignatedSite = async (request, h) => {
  const { applicationId, designatedSite } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const params = new URLSearchParams(request.query)
  const id = params.get('id')
  // There must be application designated sites in the database AND
  // There must be an id in either the cache or the parameter to proceed
  // If there is an id it must be one of the designated sites
  if (applicationDesignatedSites.length && ((id && applicationDesignatedSites.find(ads => ads.id === id)) || designatedSite)) {
    return null
  } else {
    return h.redirect(TASKLIST.uri)
  }
}

/**
 * Check for any unfinished and redirect back to the appropriate question
 * @param request
 * @param h
 * @returns {Promise<null>}
 */
export const checkAll = async (request, h) => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)

  if (!applicationDesignatedSites.length) {
    return null
  }

  const setCache = async (jd, ads) => {
    jd.designatedSite = { id: ads.id, designatedSiteId: ads.designatedSiteId }
    await request.cache().setData(jd)
  }

  for (const ads of applicationDesignatedSites) {
    if (ads.permissionFromOwner === undefined) {
      await setCache(journeyData, ads)
      return h.redirect(conservationConsiderationURIs.OWNER_PERMISSION.uri)
    } else if (ads.permissionFromOwner && !ads.detailsOfPermission) {
      await setCache(journeyData, ads)
      return h.redirect(conservationConsiderationURIs.OWNER_PERMISSION_DETAILS.uri)
    } else if (ads.adviceFromNaturalEngland === undefined) {
      await setCache(journeyData, ads)
      return h.redirect(conservationConsiderationURIs.NE_ADVICE.uri)
    } else if (ads.adviceFromNaturalEngland && !ads.adviceFromWho) {
      await setCache(journeyData, ads)
      return h.redirect(conservationConsiderationURIs.ACTIVITY_ADVICE.uri)
    } else if (ads.onSiteOrCloseToSite === undefined) {
      await setCache(journeyData, ads)
      return h.redirect(conservationConsiderationURIs.DESIGNATED_SITE_PROXIMITY.uri)
    }
  }

  return null
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

/**
 * If we hit a page and don't have a designated site (which can happen if we've removed a site at the end of the flow
 * then gone back to a prior page using back) we redirect to the Check Your Answers page.
 */
export const checkDesignatedSite = async (request, h) => {
  const ads = await getCurrentSite(request)
  if (!ads) {
    return h.redirect(DESIGNATED_SITE_CHECK_ANSWERS.uri)
  }

  return null
}
