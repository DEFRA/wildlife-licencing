import { APIRequests } from '../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { conservationConsiderationURIs } from '../../uris.js'
import { SECTION_TASKS } from '../tasklist/general-sections.js'
import { tagStatus } from '../../services/status-tags.js'

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

  if (id === 'new') {
    // Creating a new designated site, do nothing
    delete journeyData.designatedSite
    await request.cache().setData(journeyData)
  } else if (id) {
    // Reseat the cache on the site specified
    const applicationDesignatedSite = applicationDesignatedSites.find(ads => ads.id === id)
    journeyData.designatedSite = { id: applicationDesignatedSite.id, designatedSiteId: applicationDesignatedSite.designatedSiteId }
    await request.cache().setData(journeyData)
    return applicationDesignatedSite
  } else if (designatedSite) {
    // Return the currently selected application-designated-site
    return applicationDesignatedSites.find(ads => ads.id === designatedSite?.id)
  } else if (applicationDesignatedSites.length) {
    // Mop-up in case the cache gets zapped
    journeyData.designatedSite = { id: applicationDesignatedSites[0].id, designatedSiteId: applicationDesignatedSites[0]?.designatedSiteId }
    await request.cache().setData(journeyData)
    return applicationDesignatedSites[0]
  }
}

export const completionOrCheck = func => async request => {
  const { applicationId } = await request.cache().getData()
  const status = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.CONSERVATION)
  return [tagStatus.COMPLETE, tagStatus.COMPLETE_NOT_CONFIRMED].includes(status)
    ? conservationConsiderationURIs.DESIGNATED_SITE_CHECK_ANSWERS.uri
    : func(request)
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
