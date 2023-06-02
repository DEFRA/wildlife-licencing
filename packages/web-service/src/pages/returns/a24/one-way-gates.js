import { APIRequests } from '../../../services/api-requests.js'
import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { yesNoConditionalPage } from '../../common/yes-no-conditional.js'
import { isYes } from '../../common/yes-no.js'
import { getNextPage } from '../common-return-functions.js'

const { ONE_WAY_GATES, ARTIFICIAL_SETT } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  let oneWayGates, oneWayGatesDetails
  if (returnId) {
    const { obstructionByOneWayGates, obstructionByOneWayGatesDetails } = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    oneWayGates = obstructionByOneWayGates
    oneWayGatesDetails = obstructionByOneWayGatesDetails
  }
  return { oneWayGates, oneWayGatesDetails }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const obstructionByOneWayGates = isYes(request)
  let obstructionByOneWayGatesDetails
  if (isYes(request)) {
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

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const { methodTypes, methodTypesLength, methodTypesNavigated } = journeyData?.returns
  if (methodTypesNavigated <= 0) {
    return ARTIFICIAL_SETT.uri
  } else {
    journeyData.returns = {
      ...journeyData.returns,
      methodTypesNavigated: methodTypesNavigated - 1
    }
    await request.cache().setData(journeyData)
  }
  return getNextPage(methodTypes[methodTypesLength - methodTypesNavigated])
}

export const oneWayGates = yesNoConditionalPage({
  page: ONE_WAY_GATES.page,
  uri: ONE_WAY_GATES.uri,
  checkData: checkApplication,
  getData: getData,
  completion: completion,
  setData: setData
})
