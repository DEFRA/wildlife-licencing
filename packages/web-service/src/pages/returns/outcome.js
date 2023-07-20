import { ReturnsURIs } from '../../uris.js'
import pageRoute from '../../routes/page-route.js'
import Joi from 'joi'
import { APIRequests } from '../../services/api-requests.js'
import { checkLicence } from './common-return-functions.js'

const { OUTCOME, COMPLETE_WITHIN_DATES } = ReturnsURIs

const noOutcomeInput = 'no-outcome'
const outcomeRadio = 'outcome-check'

export const validator = async payload => {
  if (!payload[outcomeRadio]) {
    Joi.assert(payload, Joi.object({
      'outcome-check': Joi.any().required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if (payload[outcomeRadio] === 'no') {
    Joi.assert(payload, Joi.object({
      'no-outcome': Joi.string().trim().required().replace('\r\n', '\n').max(4000)
    }).options({ abortEarly: false, allowUnknown: true }))
  }
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  if (returnId) {
    const { outcome, outcomeReason } = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
    return { outcome, outcomeReason }
  } else {
    return { outcome: undefined, outcomeReason: undefined }
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const outcomeSelected = request.payload[outcomeRadio]
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  let payload = { ...licenceReturn }
  let outcome, outcomeReason
  if (outcomeSelected === 'yes') {
    outcome = true
    payload = { ...payload, outcome }
  } else if (outcomeSelected === 'no') {
    outcome = false
    outcomeReason = request.payload[noOutcomeInput]
    payload = { ...payload, outcome, outcomeReason }
  }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, outcome, outcomeReason }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: OUTCOME.page,
  uri: OUTCOME.uri,
  checkData: checkLicence,
  completion: COMPLETE_WITHIN_DATES.uri,
  validator,
  getData,
  setData
})
