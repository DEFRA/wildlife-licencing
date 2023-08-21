import pageRoute from '../../routes/page-route.js'
import { ReturnsURIs } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { checkLicence, commonValidator } from './common-return-functions.js'
import { boolFromYesNo } from '../common/common.js'

const { LICENCE_CONDITIONS } = ReturnsURIs
const { WELFARE_CONCERNS } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(journeyData?.applicationId)
  let licenceConditions, licenceConditionsDetails
  if (returnId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    licenceConditions = licenceReturn?.licenceConditions
    licenceConditionsDetails = licenceReturn?.licenceConditionsDetails
  }
  return { licenceConditions, licenceConditionsDetails }
}

export const validator = payload => commonValidator(payload, LICENCE_CONDITIONS.page)

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const licenceConditions = boolFromYesNo(request.payload['yes-no'])
  let licenceConditionsDetails
  if (!boolFromYesNo(request.payload['yes-no'])) {
    licenceConditionsDetails = request.payload['no-conditional-input']
  }
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, licenceConditions, licenceConditionsDetails }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, licenceConditions, licenceConditionsDetails }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: LICENCE_CONDITIONS.page,
  uri: LICENCE_CONDITIONS.uri,
  completion: WELFARE_CONCERNS.uri,
  checkData: checkLicence,
  getData: getData,
  setData: setData,
  validator: validator
})
