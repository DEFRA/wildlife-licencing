import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { checkSSSIData } from './common.js'
import { APIRequests } from '../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

const { OWNER_PERMISSION_DETAILS } = conservationConsiderationURIs
const { SITE_OF_SPECIAL_SCIENTIFIC_INTEREST } = PowerPlatformKeys.SITE_TYPE

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const sssiSite = applicationDesignatedSites.find(ads => ads.designatedSiteType === SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  return { 'permission-details': sssiSite?.detailsOfPermission }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const sssiSite = applicationDesignatedSites.find(ads => ads.designatedSiteType === SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  sssiSite.detailsOfPermission = request.payload['permission-details']
  await APIRequests.DESIGNATED_SITES.update(applicationId, sssiSite.id, sssiSite)
}

export default pageRoute({
  page: OWNER_PERMISSION_DETAILS.page,
  uri: OWNER_PERMISSION_DETAILS.uri,
  checkData: [checkApplication, checkSSSIData],
  getData: getData,
  validator: Joi.object({
    'permission-details': Joi.string().required().replace('\r\n', '\n').max(4000)
  }).options({ abortEarly: false, allowUnknown: true }),
  completion: conservationConsiderationURIs.NE_ADVICE.uri,
  setData: setData
})
