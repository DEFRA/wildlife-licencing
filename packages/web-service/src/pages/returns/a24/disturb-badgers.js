import { APIRequests } from '../../../services/api-requests.js'
import { ReturnsURIs } from '../../../uris.js'
import { boolFromYesNo } from '../../common/common.js'
import { allCompletion, checkLicence, commonValidator } from '../common-return-functions.js'
import pageRoute from '../../../routes/page-route.js'

const { DISTURB_BADGERS } = ReturnsURIs.A24

export const validator = payload => commonValidator(payload, DISTURB_BADGERS.page)

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(journeyData?.applicationId)
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
  const disturbBadgersBoolean = boolFromYesNo(request.payload['yes-no'])
  let disturbBadgersDetails
  if (boolFromYesNo(request.payload['yes-no'])) {
    disturbBadgersDetails = request.payload['yes-conditional-input']
  }
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, disturbBadgers: disturbBadgersBoolean, disturbBadgersDetails }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, disturbBadgers: disturbBadgersBoolean, disturbBadgersDetails }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: DISTURB_BADGERS.page,
  uri: DISTURB_BADGERS.uri,
  checkData: checkLicence,
  getData: getData,
  completion: allCompletion,
  setData: setData,
  validator: validator
})
