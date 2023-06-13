import Joi from 'joi'
import { isYes } from '../common/yes-no.js'
import pageRoute from '../../routes/page-route.js'
import { ReturnsURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'

const { LICENCE_CONDITIONS } = ReturnsURIs
const { WELFARE_CONCERNS } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  let licenceConditions, licenceConditionsDetails
  if (returnId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    licenceConditions = licenceReturn?.licenceConditions
    licenceConditionsDetails = licenceReturn?.licenceConditionsDetails
  }
  return { licenceConditions, licenceConditionsDetails }
}

export const validator = async payload => {
  if (!payload['yes-no']) {
    Joi.assert(payload, Joi.object({
      'yes-no': Joi.any().required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if (payload['yes-no'] === 'no') {
    Joi.assert(payload, Joi.object({
      'no-conditional-input': Joi.string().required().replace('\r\n', '\n').max(4000)
    }).options({ abortEarly: false, allowUnknown: true }))
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const licenceConditions = isYes(request)
  let licenceConditionsDetails
  if (!isYes(request)) {
    licenceConditionsDetails = request.payload['no-conditional-input']
  }
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, disturbBadgers: licenceConditions, licenceConditionsDetails }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, disturbBadgers: licenceConditions, licenceConditionsDetails }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: LICENCE_CONDITIONS.page,
  uri: LICENCE_CONDITIONS.uri,
  completion: WELFARE_CONCERNS.uri,
  checkData: checkApplication,
  getData: getData,
  setData: setData,
  validator: validator
})
