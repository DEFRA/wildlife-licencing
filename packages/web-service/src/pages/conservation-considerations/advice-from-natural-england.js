import { conservationConsiderationURIs } from '../../uris.js'
import { yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'
import { allCompletion, checkDesignatedSite, getCurrentSite } from './common.js'
import { APIRequests } from '../../services/api-requests.js'
import { boolFromYesNo, yesNoFromBool } from '../common/common.js'

const { NE_ADVICE } = conservationConsiderationURIs

export const getData = async request => {
  const ads = await getCurrentSite(request)
  return { yesNo: yesNoFromBool(ads.adviceFromNaturalEngland) }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ads = await getCurrentSite(request)
  ads.adviceFromNaturalEngland = boolFromYesNo(request.payload['yes-no'])
  if (!ads.adviceFromNaturalEngland) {
    delete ads.adviceFromWho
    delete ads.adviceDescription
  }
  await APIRequests.DESIGNATED_SITES.update(applicationId, ads.id, ads)
}

export const adviceFromNaturalEngland = yesNoPage({
  page: NE_ADVICE.page,
  uri: NE_ADVICE.uri,
  checkData: [checkApplication, checkDesignatedSite],
  getData: getData,
  completion: allCompletion,
  setData: setData
})
