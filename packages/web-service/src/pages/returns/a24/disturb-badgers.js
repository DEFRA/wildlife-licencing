import { APIRequests } from '../../../services/api-requests.js'
import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { yesNoConditionalPage } from '../../common/yes-no-conditional.js'
import { isYes } from '../../common/yes-no.js'
import { licenceActionsCompletion } from '../common-return-functions.js'

const { DISTURB_BADGERS } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  let disturbBadgersYesOrNo, disturbBadgersDetails
  if (returnId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    disturbBadgersYesOrNo = licenceReturn?.disturbBadgers
    disturbBadgersDetails = licenceReturn?.disturbBadgersDetails
  }
  return { disturbBadgersYesOrNo, disturbBadgersDetails }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const disturbBadgersBoolean = isYes(request)
  let disturbBadgersDetails
  if (isYes(request)) {
    disturbBadgersDetails = request.payload['yes-conditional-input']
  } else {
    disturbBadgersDetails = 'there was no evidence that badgers were disturbed'
  }
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, disturbBadgers: disturbBadgersBoolean, disturbBadgersDetails }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, disturbBadgers: disturbBadgersBoolean, disturbBadgersDetails }
  await request.cache().setData(journeyData)
}

export const disturbBadgers = yesNoConditionalPage({
  page: DISTURB_BADGERS.page,
  uri: DISTURB_BADGERS.uri,
  checkData: checkApplication,
  getData: getData,
  completion: licenceActionsCompletion,
  setData: setData
})
