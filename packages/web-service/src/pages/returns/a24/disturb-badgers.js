import { APIRequests } from '../../../services/api-requests.js'
import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { yesNoConditionalPage } from '../../common/yes-no-conditional.js'
import { isYes } from '../../common/yes-no.js'
import { getNextPage } from '../common-return-functions.js'

const { DISTURB_BADGERS, ARTIFICIAL_SETT } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  let disturbBadgers, disturbBadgersDetails
  if (returnId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    disturbBadgers = licenceReturn?.disturbBadgers
    disturbBadgersDetails = licenceReturn?.disturbBadgersDetails
  }
  return { disturbBadgers, disturbBadgersDetails }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const disturbBadgers = isYes(request)
  let disturbBadgersDetails
  if (isYes(request)) {
    disturbBadgersDetails = request.payload['yes-conditional-input']
  } else {
    disturbBadgersDetails = 'there was no evidence that badgers were disturbed'
  }
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, disturbBadgers, disturbBadgersDetails }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, disturbBadgers, disturbBadgersDetails }
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

export const disturbBadgers = yesNoConditionalPage({
  page: DISTURB_BADGERS.page,
  uri: DISTURB_BADGERS.uri,
  checkData: checkApplication,
  getData: getData,
  completion: completion,
  setData: setData
})
