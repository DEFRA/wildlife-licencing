import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { ReturnsURIs } from '../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { APIRequests } from '../../services/api-requests.js'
import { checkLicence } from './common-return-functions.js'

const { WHY_NIL, ANOTHER_LICENCE } = ReturnsURIs
const { WHY_DIDNT_YOU_CARRY_OUT_THESE_ACTIONS: { THE_DEVELOPMENT_WORK_DID_NOT_HAPPEN, THE_SETT_WAS_NOT_IN_ACTIVE_USE_BY_BADGERS, OTHER } } = PowerPlatformKeys
const whyNilRadio = 'why-nil'
const whyNilOtherDescription = 'other-details'

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  let whyNil, whyNilOther
  if (returnId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    whyNil = licenceReturn?.whyNil
    whyNilOther = licenceReturn?.whyNilOther
  }
  return { whyNil, whyNilOther, THE_DEVELOPMENT_WORK_DID_NOT_HAPPEN, THE_SETT_WAS_NOT_IN_ACTIVE_USE_BY_BADGERS, OTHER }
}

export const validator = async payload => {
  if (!payload[whyNilRadio]) {
    Joi.assert(payload, Joi.object({
      'why-nil': Joi.any().required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if (OTHER === parseInt(payload[whyNilRadio])) {
    Joi.assert(payload, Joi.object({
      'other-details': Joi.string().trim().required().replace('\r\n', '\n').max(4000)
    }).options({ abortEarly: false, allowUnknown: true }))
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const whyNil = parseInt(request.payload[whyNilRadio])
  const whyNilOther = request.payload[whyNilOtherDescription]
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  let payload = { ...licenceReturn, whyNil }
  if (whyNil === OTHER) {
    payload = { ...payload, whyNilOther }
  }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, whyNil, whyNilOther }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: WHY_NIL.page,
  uri: WHY_NIL.uri,
  completion: ANOTHER_LICENCE.uri,
  checkData: checkLicence,
  validator,
  getData,
  setData
})
