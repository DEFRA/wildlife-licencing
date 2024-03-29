import { APIRequests } from '../../../services/api-requests.js'
import { ReturnsURIs } from '../../../uris.js'
import { yesNoConditionalPage } from '../../common/yes-no-conditional.js'
import { allCompletion, checkLicence } from '../common-return-functions.js'
import { boolFromYesNo, yesNoFromBool } from '../../common/common.js'

const { BLOCKING_OR_PROOFING } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(journeyData?.applicationId)
  let obstructBlocking, obstructBlockingDetails
  if (returnId) {
    const { obstructionBlockingOrProofing, obstructionBlockingOrProofingDetails } = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    obstructBlocking = obstructionBlockingOrProofing
    obstructBlockingDetails = obstructionBlockingOrProofingDetails
  }
  return { yesNo: yesNoFromBool(obstructBlocking), yesNoDetails: obstructBlockingDetails }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const obstructionBlockingOrProofing = boolFromYesNo(request.payload['yes-no'])
  let obstructionBlockingOrProofingDetails
  if (boolFromYesNo(request.payload['yes-no'])) {
    obstructionBlockingOrProofingDetails = request.payload['yes-conditional-input']
  } else {
    obstructionBlockingOrProofingDetails = request.payload['no-conditional-input']
  }
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, obstructionBlockingOrProofing, obstructionBlockingOrProofingDetails }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, obstructionBlockingOrProofing, obstructionBlockingOrProofingDetails }
  await request.cache().setData(journeyData)
}

export const blockingOrProofing = yesNoConditionalPage({
  page: BLOCKING_OR_PROOFING.page,
  uri: BLOCKING_OR_PROOFING.uri,
  checkData: checkLicence,
  getData: getData,
  completion: allCompletion,
  setData: setData
})
