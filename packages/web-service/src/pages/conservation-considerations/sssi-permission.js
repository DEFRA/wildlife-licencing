import { conservationConsiderationURIs } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { APIRequests } from '../../services/api-requests.js'
import { yesNoFromBool } from '../common/common.js'
import { checkSSSIData } from './common.js'

const { SITE_OF_SPECIAL_SCIENTIFIC_INTEREST } = PowerPlatformKeys.SITE_TYPE
const { OWNER_PERMISSION, OWNER_PERMISSION_DETAILS, NE_ADVICE } = conservationConsiderationURIs

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const sssiSite = applicationDesignatedSites.find(ads => ads.designatedSiteType === SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  return { yesNo: yesNoFromBool(sssiSite?.permissionFromOwner) }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const sssiSite = applicationDesignatedSites.find(ads => ads.designatedSiteType === SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  sssiSite.permissionFromOwner = isYes(request)
  await APIRequests.DESIGNATED_SITES.update(applicationId, sssiSite.id, sssiSite)
}

export const completion = async request => isYes(request) ? OWNER_PERMISSION_DETAILS.uri : NE_ADVICE.uri

export const sssiPermission = yesNoPage({
  page: OWNER_PERMISSION.page,
  uri: OWNER_PERMISSION.uri,
  checkData: [checkApplication, checkSSSIData],
  getData: getData,
  completion: completion,
  setData: setData
})
