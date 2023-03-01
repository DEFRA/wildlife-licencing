import { conservationConsiderationURIs } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'
import { checkSSSIData } from './common.js'
import { APIRequests } from '../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { yesNoFromBool } from '../common/common.js'

const { NE_ADVICE, ACTIVITY_ADVICE, MANAGING_SPECIAL_AREA } = conservationConsiderationURIs
const { SITE_OF_SPECIAL_SCIENTIFIC_INTEREST } = PowerPlatformKeys.SITE_TYPE

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const { adviceFromNaturalEngland } = applicationDesignatedSites.find(ads => ads.designatedSiteType === SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  return { yesNo: yesNoFromBool(adviceFromNaturalEngland) }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const sssiSite = applicationDesignatedSites.find(ads => ads.designatedSiteType === SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  sssiSite.adviceFromNaturalEngland = isYes(request)
  await APIRequests.DESIGNATED_SITES.update(applicationId, sssiSite.id, sssiSite)
}

export const completion = async request => isYes(request) ? ACTIVITY_ADVICE.uri : MANAGING_SPECIAL_AREA.uri

export const adviceFromNaturalEngland = yesNoPage({
  page: NE_ADVICE.page,
  uri: NE_ADVICE.uri,
  checkData: [checkApplication, checkSSSIData],
  getData: getData,
  completion: completion,
  setData: setData
})
