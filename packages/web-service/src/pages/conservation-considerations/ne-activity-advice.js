import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { checkSSSIData } from './common.js'
import { APIRequests } from '../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
const { SITE_OF_SPECIAL_SCIENTIFIC_INTEREST } = PowerPlatformKeys.SITE_TYPE

const { ACTIVITY_ADVICE, MANAGING_SPECIAL_AREA } = conservationConsiderationURIs

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const sssiSite = applicationDesignatedSites.find(ads => ads.designatedSiteType === SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  return {
    'advice-from-who': sssiSite?.adviceFromWho,
    'advice-description': sssiSite?.adviceDescription
  }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const sssiSite = applicationDesignatedSites.find(ads => ads.designatedSiteType === SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  sssiSite.adviceFromWho = request.payload['advice-from-who']
  sssiSite.adviceDescription = request.payload['advice-description']
  await APIRequests.DESIGNATED_SITES.update(applicationId, sssiSite.id, sssiSite)
}

export const completion = async request => {
  return conservationConsiderationURIs.ACTIVITY_ADVICE.uri
}

export default pageRoute({
  page: ACTIVITY_ADVICE.page,
  uri: ACTIVITY_ADVICE.uri,
  checkData: [checkApplication, checkSSSIData],
  validator: Joi.object({
    'advice-from-who': Joi.string().required().max(100),
    'advice-description': Joi.string().required().replace('\r\n', '\n').max(4000)
  }).options({ abortEarly: false, allowUnknown: true }),
  getData: getData,
  completion: MANAGING_SPECIAL_AREA.uri,
  setData: setData
})
