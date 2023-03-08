import { conservationConsiderationURIs } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'
import { getCurrentSite } from './common.js'
import { APIRequests } from '../../services/api-requests.js'
import { yesNoFromBool } from '../common/common.js'

const { NE_ADVICE, ACTIVITY_ADVICE, DESIGNATED_SITE_PROXIMITY } = conservationConsiderationURIs

export const getData = async request => {
  const ads = await getCurrentSite(request)
  return { yesNo: yesNoFromBool(ads.adviceFromNaturalEngland) }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ads = await getCurrentSite(request)
  ads.adviceFromNaturalEngland = isYes(request)
  await APIRequests.DESIGNATED_SITES.update(applicationId, ads.id, ads)
}

export const completion = async request => isYes(request) ? ACTIVITY_ADVICE.uri : DESIGNATED_SITE_PROXIMITY.uri

export const adviceFromNaturalEngland = yesNoPage({
  page: NE_ADVICE.page,
  uri: NE_ADVICE.uri,
  checkData: checkApplication,
  getData: getData,
  completion: completion,
  setData: setData
})
