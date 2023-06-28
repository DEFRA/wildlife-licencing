import { ReturnsURIs } from '../../uris.js'
import Joi from 'joi'
import { APIRequests } from '../../services/api-requests.js'
import pageRoute from '../../routes/page-route.js'
import { activityTypes, checkLicence } from './common-return-functions.js'
import { boolFromYesNo, yesNoFromBool } from '../common/common.js'

const { NIL_RETURN, OUTCOME, WHY_NIL } = ReturnsURIs

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceActions = await APIRequests.RETURNS.getLicenceActions(licenceId)
  const methodTypes = licenceActions[0]?.methodIds
  if (returnId) {
    const { nilReturn } = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
    return { yesNo: yesNoFromBool(nilReturn), activityTypes, methodTypes }
  } else {
    return { yesNo: undefined, activityTypes, methodTypes }
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const nilReturn = !boolFromYesNo(request.payload['yes-no'])
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

export const completion = async request => boolFromYesNo(request.payload['yes-no']) ? OUTCOME.uri : WHY_NIL.uri

export default pageRoute({
  page: NIL_RETURN.page,
  uri: NIL_RETURN.uri,
  validator: Joi.object({
    'yes-no': Joi.any()
      .valid('yes', 'no')
      .required()
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkLicence,
  getData: getData,
  completion: completion,
  setData: setData
})
