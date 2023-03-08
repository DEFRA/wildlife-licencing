import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { completionOrCheck, getCurrentSite } from './common.js'
import { APIRequests } from '../../services/api-requests.js'
const { ACTIVITY_ADVICE, DESIGNATED_SITE_PROXIMITY } = conservationConsiderationURIs

export const getData = async request => {
  const ads = await getCurrentSite(request)
  return {
    'advice-from-who': ads.adviceFromWho,
    'advice-description': ads.adviceDescription
  }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ads = await getCurrentSite(request)
  ads.adviceFromWho = request.payload['advice-from-who']
  ads.adviceDescription = request.payload['advice-description']
  await APIRequests.DESIGNATED_SITES.update(applicationId, ads.id, ads)
}

export default pageRoute({
  page: ACTIVITY_ADVICE.page,
  uri: ACTIVITY_ADVICE.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'advice-from-who': Joi.string().required().max(100),
    'advice-description': Joi.string().required().replace('\r\n', '\n').max(4000)
  }).options({ abortEarly: false, allowUnknown: true }),
  getData: getData,
  completion: completionOrCheck(() => DESIGNATED_SITE_PROXIMITY.uri),
  setData: setData
})
