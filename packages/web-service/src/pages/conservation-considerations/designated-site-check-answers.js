import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs, TASKLIST } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { SECTION_TASKS } from '../tasklist/general-sections.js'
import { tagStatus } from '../../services/status-tags.js'
import { getFilteredDesignatedSites } from './common.js'
import { yesNoFromBool } from '../common/common.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

const { DESIGNATED_SITE_CHECK_ANSWERS } = conservationConsiderationURIs

const truncateLongText = lt => lt ? `${lt.substring(0, 100)}${lt.length > 100 ? '...' : ''}` : ''

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
      { key: 'detailsOfPermission', value: truncateLongText(ads.detailsOfPermission) },
      { key: 'adviceFromNaturalEngland', value: yesNoFromBool(ads.adviceFromNaturalEngland) },
      (ads.adviceFromNaturalEngland && { key: 'adviceFromWho', value: ads.adviceFromWho }),
      (ads.adviceFromNaturalEngland && { key: 'adviceDescription', value: truncateLongText(ads.adviceDescription) }),
      { key: 'onSiteOrCloseToSite', value: ads.onSiteOrCloseToSite }
    ].filter(a => a)
  }))
  return {
    onOrClose: PowerPlatformKeys.ON_SITE_OR_CLOSE_TO_SITE,
    checkData: checkAnswersData
  }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.CONSERVATION, tagState: tagStatus.COMPLETE })
}

export const completion = async () => TASKLIST.uri

export default pageRoute({
  page: DESIGNATED_SITE_CHECK_ANSWERS.page,
  uri: DESIGNATED_SITE_CHECK_ANSWERS.uri,
  checkData: checkApplication,
  getData: getData,
  completion: completion,
  setData: setData
})
