import { conservationConsiderationURIs, TASKLIST } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { SECTION_TASKS } from '../tasklist/general-sections.js'
import { tagStatus } from '../../services/status-tags.js'
import { getFilteredDesignatedSites } from './common.js'
import { boolFromYesNo, yesNoFromBool } from '../common/common.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { yesNoPage } from '../common/yes-no.js'

const { DESIGNATED_SITE_CHECK_ANSWERS, DESIGNATED_SITE_NAME } = conservationConsiderationURIs

/**
 * Check for any unfinished and redirect back to the appropriate question
 * @param request
 * @param h
 * @returns {Promise<null>}
 */
export const checkCompleted = async (request, h) => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)

  if (!applicationDesignatedSites.length) {
    return h.redirect(TASKLIST.uri)
  }

  const setCache = async (journeyData, ads) => {
    journeyData.designatedSite = { id: ads.id, designatedSiteId: ads.designatedSiteId }
    await request.cache().setData(journeyData)
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

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.CONSERVATION, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  const sites = await getFilteredDesignatedSites()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const checkAnswersData = applicationDesignatedSites.map(ads => ({
    id: ads.id,
    tabData: [
      { key: 'siteName', value: sites.find(s => s.id === ads.designatedSiteId).siteName },
      { key: 'permissionFromOwner', value: yesNoFromBool(ads.permissionFromOwner) },
      (ads.permissionFromOwner && { key: 'detailsOfPermission', value: ads.detailsOfPermission }),
      { key: 'adviceFromNaturalEngland', value: yesNoFromBool(ads.adviceFromNaturalEngland) },
      (ads.adviceFromNaturalEngland && { key: 'adviceFromWho', value: ads.adviceFromWho }),
      (ads.adviceFromNaturalEngland && { key: 'adviceDescription', value: ads.adviceDescription }),
      { key: 'onSiteOrCloseToSite', value: ads.onSiteOrCloseToSite }
    ].filter(a => a)
  }))
  return {
    onOrClose: PowerPlatformKeys.ON_SITE_OR_CLOSE_TO_SITE,
    checkData: checkAnswersData
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  delete journeyData.designatedSite
  await request.cache().setData(journeyData)
  if (boolFromYesNo(request.payload['yes-no'])) {
    await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.CONSERVATION, tagState: tagStatus.IN_PROGRESS })
  } else {
    await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.CONSERVATION, tagState: tagStatus.COMPLETE })
  }
}

export const completion = async request => boolFromYesNo(request.payload['yes-no']) ? DESIGNATED_SITE_NAME.uri : TASKLIST.uri

export default yesNoPage({
  page: DESIGNATED_SITE_CHECK_ANSWERS.page,
  uri: DESIGNATED_SITE_CHECK_ANSWERS.uri,
  checkData: [checkApplication, checkCompleted],
  getData: getData,
  completion: completion,
  setData: setData
})
