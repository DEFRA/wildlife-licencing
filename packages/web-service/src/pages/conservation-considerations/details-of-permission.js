import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { allCompletion, getCurrentSite, checkDesignatedSite } from './common.js'
import { APIRequests } from '../../services/api-requests.js'

const { OWNER_PERMISSION_DETAILS } = conservationConsiderationURIs

export const getData = async request => {
  const ads = await getCurrentSite(request)
  return { 'permission-details': ads.detailsOfPermission }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ads = await getCurrentSite(request)
  ads.detailsOfPermission = request.payload['permission-details']
  await APIRequests.DESIGNATED_SITES.update(applicationId, ads.id, ads)
}

export default pageRoute({
  page: OWNER_PERMISSION_DETAILS.page,
  uri: OWNER_PERMISSION_DETAILS.uri,
  checkData: [checkApplication, checkDesignatedSite],
  getData: getData,
  validator: Joi.object({
    'permission-details': Joi.string().replace('\r\n', '\n').trim().required().max(4000)
  }).options({ abortEarly: false, allowUnknown: true }),
  completion: allCompletion,
  setData: setData
})
