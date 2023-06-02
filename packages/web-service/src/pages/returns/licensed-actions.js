import { ReturnsURIs } from '../../uris.js'
import { isYes } from '../common/yes-no.js'
import Joi from 'joi'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { yesNoFromBool } from '../common/common.js'
import pageRoute from '../../routes/page-route.js'
import { activityTypes } from './common-return-functions.js'

const { NIL_RETURN, OUTCOME, WHY_NIL } = ReturnsURIs

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  journeyData.licenceId = licences[0].id
  journeyData.licenceNumber = licences[0].licenceNumber
  await request.cache().setData(journeyData)
  const licenceActions = await APIRequests.RETURNS.getLicenceActions(licences[0].id)
  const methodTypes = licenceActions[0]?.methodIds
  if (returnId) {
    const { nilReturn } = await APIRequests.RETURNS.getLicenceReturn(licences[0].id, returnId)
    return { yesNo: yesNoFromBool(nilReturn), activityTypes, methodTypes }
  } else {
    return { yesNo: undefined, activityTypes, methodTypes }
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const nilReturn = !isYes(request)
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceNumber = journeyData?.licenceNumber
  if (returnId && licenceId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
    const payload = { ...licenceReturn, nilReturn }
    await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
    journeyData.returns = { ...journeyData.returns, nilReturn }
  } else {
    const allLicenceReturns = await APIRequests.RETURNS.getLicenceReturns(licenceId)
    const incrementedLicenceReturns = allLicenceReturns.length + 1
    const returnReferenceNumber = `${licenceNumber}-ROA${incrementedLicenceReturns}`
    const licenceReturn = await APIRequests.RETURNS.createLicenceReturn(licenceId, { returnReferenceNumber, nilReturn })
    journeyData.returns = { ...journeyData.returns || {}, returnReferenceNumber, nilReturn, id: licenceReturn?.id }
  }
  await request.cache().setData(journeyData)
}

export const completion = async request => isYes(request) ? OUTCOME.uri : WHY_NIL.uri

export default pageRoute({
  page: NIL_RETURN.page,
  uri: NIL_RETURN.uri,
  validator: Joi.object({
    'yes-no': Joi.any()
      .valid('yes', 'no')
      .required()
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkApplication,
  getData: getData,
  completion: completion,
  setData: setData
})
