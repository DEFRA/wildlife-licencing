import { APIRequests } from '../../../services/api-requests.js'
import { ReturnsURIs } from '../../../uris.js'
import { yesNoConditionalPage } from '../../common/yes-no-conditional.js'
import { boolFromYesNo } from '../../common/common.js'
import { checkLicence, licenceActionsCompletion } from '../common-return-functions.js'

const { ONE_WAY_GATES } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(journeyData?.applicationId)
  let oneWayGatesYesOrNo, oneWayGatesDetails
  if (returnId) {
    const { obstructionByOneWayGates, obstructionByOneWayGatesDetails } = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    oneWayGatesYesOrNo = obstructionByOneWayGates
    oneWayGatesDetails = obstructionByOneWayGatesDetails
  }
  return { oneWayGatesYesOrNo, oneWayGatesDetails }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const obstructionByOneWayGates = boolFromYesNo(request.payload['yes-no'])
  let obstructionByOneWayGatesDetails
  if (boolFromYesNo(request.payload['yes-no'])) {
    obstructionByOneWayGatesDetails = request.payload['yes-conditional-input']
  } else {
    obstructionByOneWayGatesDetails = request.payload['no-conditional-input']
  }
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, obstructionByOneWayGates, obstructionByOneWayGatesDetails }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, obstructionByOneWayGates, obstructionByOneWayGatesDetails }
  await request.cache().setData(journeyData)
}

export const oneWayGates = yesNoConditionalPage({
  page: ONE_WAY_GATES.page,
  uri: ONE_WAY_GATES.uri,
  checkData: checkLicence,
  getData: getData,
  completion: licenceActionsCompletion,
  setData: setData
})
