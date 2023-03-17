import { conservationConsiderationURIs } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'
import { getCurrentSite, getFilteredDesignatedSites } from './common.js'
import { APIRequests } from '../../services/api-requests.js'

const { DESIGNATED_SITE_REMOVE, DESIGNATED_SITE_CHECK_ANSWERS } = conservationConsiderationURIs

export const getData = async request => {
  const sites = await getFilteredDesignatedSites()
  const ads = await getCurrentSite(request)
  return { name: sites.find(s => s.id === ads.designatedSiteId).siteName }
}

export const setData = async request => {
  if (isYes(request)) {
    const journeyData = await request.cache().getData()
    const { applicationId, designatedSite } = journeyData
    await APIRequests.DESIGNATED_SITES.destroy(applicationId, designatedSite.id)
    delete journeyData.designatedSite
    await request.cache().setData(journeyData)
  }
}

export const designatedSiteRemove = yesNoPage({
  page: DESIGNATED_SITE_REMOVE.page,
  uri: DESIGNATED_SITE_REMOVE.uri,
  checkData: checkApplication,
  getData: getData,
  completion: DESIGNATED_SITE_CHECK_ANSWERS.uri,
  setData: setData
})
