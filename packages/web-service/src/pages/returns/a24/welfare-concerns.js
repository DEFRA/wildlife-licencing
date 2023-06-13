import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { isYes } from '../../common/yes-no.js'
import { APIRequests } from '../../../services/api-requests.js'

const { WELFARE_CONCERNS } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  let welfareConcerns, welfareConcernsDetails
  if (returnId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    welfareConcerns = licenceReturn?.welfareConcerns
    welfareConcernsDetails = licenceReturn?.welfareConcernsDetails
  }
  return { welfareConcerns, welfareConcernsDetails }
}

export const validator = async payload => {
  if (!payload['yes-no']) {
    Joi.assert(payload, Joi.object({
      'yes-no': Joi.any().required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if (payload['yes-no'] === 'yes') {
    Joi.assert(payload, Joi.object({
      'yes-conditional-input': Joi.string().required().replace('\r\n', '\n').max(4000)
    }).options({ abortEarly: false, allowUnknown: true }))
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const welfareConcerns = isYes(request)
  let welfareConcernsDetails
  if (!isYes(request)) {
    welfareConcernsDetails = request.payload['yes-conditional-input']
  }
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, disturbBadgers: welfareConcerns, welfareConcernsDetails }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, disturbBadgers: welfareConcerns, welfareConcernsDetails }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: WELFARE_CONCERNS.page,
  uri: WELFARE_CONCERNS.uri,
  checkData: checkApplication,
  getData: getData,
  setData: setData,
  validator: validator
})
