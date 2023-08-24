import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { boolFromYesNo } from '../../common/common.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkLicence, commonValidator } from '../common-return-functions.js'

const { WELFARE_CONCERNS } = ReturnsURIs.A24
const { UPLOAD } = ReturnsURIs

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(journeyData?.applicationId)
  let welfareConcerns, welfareConcernsDetails
  if (returnId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    welfareConcerns = licenceReturn?.welfareConcerns
    welfareConcernsDetails = licenceReturn?.welfareConcernsDetails
  }
  return { welfareConcerns, welfareConcernsDetails }
}

export const validator = payload => commonValidator(payload, WELFARE_CONCERNS.page)

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const welfareConcerns = boolFromYesNo(request.payload['yes-no'])
  let welfareConcernsDetails
  if (boolFromYesNo(request.payload['yes-no'])) {
    welfareConcernsDetails = request.payload['yes-conditional-input']
  }
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, welfareConcerns, welfareConcernsDetails }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, welfareConcerns, welfareConcernsDetails }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: WELFARE_CONCERNS.page,
  uri: WELFARE_CONCERNS.uri,
  checkData: checkLicence,
  completion: UPLOAD.uri,
  getData: getData,
  setData: setData,
  validator: validator
})
