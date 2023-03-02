import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { checkSSSIData } from './common.js'
import { APIRequests } from '../../services/api-requests.js'

const { SIGNIFICANT_EFFECTS_ON_SPECIAL_AREA, SSSI_CHECK, SPECIAL_AREA_START } = conservationConsiderationURIs

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const { effectsOnSpecialAreas } = await APIRequests.APPLICATION.getById(applicationId)
  return { effects: effectsOnSpecialAreas }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const application = await APIRequests.APPLICATION.getById(applicationId)
  application.effectsOnSpecialAreas = request.payload.effects
  await APIRequests.APPLICATION.update(applicationId, application)
}

export const completion = async request => ['NO', 'NO-ADVICE'].includes(request.payload.effects) ? SSSI_CHECK.uri : SPECIAL_AREA_START.uri

export default pageRoute({
  page: SIGNIFICANT_EFFECTS_ON_SPECIAL_AREA.page,
  uri: SIGNIFICANT_EFFECTS_ON_SPECIAL_AREA.uri,
  checkData: [checkApplication, checkSSSIData],
  validator: Joi.object({
    effects: Joi.string().required().valid('YES', 'NO', 'NO-ADVICE')
  }).options({ abortEarly: false, allowUnknown: true }),
  getData: getData,
  completion: completion,
  setData: setData
})
