import { ReturnsURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import pageRoute from '../../routes/page-route.js'
import Joi from 'joi'
import { APIRequests } from '../../services/api-requests.js'

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
      'no-outcome': Joi.string().required().replace('\r\n', '\n').max(4000)
    }).options({ abortEarly: false, allowUnknown: true }))
  }
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const noOutcome = journeyData?.returns?.noOutcome
  if (returnId) {
    const { outcome } = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
    return { outcome }
  } else if (noOutcome) {
    return { noOutcome }
  } else {
    return { outcome: undefined }
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const outcomeSelected = request.payload[outcomeRadio]
  let outcome, noOutcome
  if (outcomeSelected === 'yes') {
    outcome = true
  } else if (outcomeSelected === 'no') {
    outcome = false
    noOutcome = request.payload[noOutcomeInput]
  }
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, outcome }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, outcome, noOutcome }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: OUTCOME.page,
  uri: OUTCOME.uri,
  checkData: checkApplication,
  completion: COMPLETE_WITHIN_DATES.uri,
  validator,
  getData,
  setData
})
