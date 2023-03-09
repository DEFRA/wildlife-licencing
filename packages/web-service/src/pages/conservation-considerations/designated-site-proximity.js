import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { allCompletion, getCurrentSite } from './common.js'
import { APIRequests } from '../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

const { DESIGNATED_SITE_PROXIMITY } = conservationConsiderationURIs

export const getData = async request => {
  const ads = await getCurrentSite(request)
  return { proximity: ads.onSiteOrCloseToSite, values: PowerPlatformKeys.ON_SITE_OR_CLOSE_TO_SITE }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ads = await getCurrentSite(request)
  ads.onSiteOrCloseToSite = parseInt(request.payload.proximity)
  await APIRequests.DESIGNATED_SITES.update(applicationId, ads.id, ads)
}

export default pageRoute({
  page: DESIGNATED_SITE_PROXIMITY.page,
  uri: DESIGNATED_SITE_PROXIMITY.uri,
  checkData: checkApplication,
  validator: Joi.object({
    proximity: Joi.string().required().valid(...Object.values(PowerPlatformKeys.ON_SITE_OR_CLOSE_TO_SITE).map(v => v.toString()))
  }).options({ abortEarly: false, allowUnknown: true }),
  getData: getData,
  completion: allCompletion,
  setData: setData
})
