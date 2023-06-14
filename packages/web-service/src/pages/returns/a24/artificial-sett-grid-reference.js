import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { gridReferenceValidator } from '../../../pages/common/grid-ref-validator.js'
import { APIRequests } from '../../../services/api-requests.js'

const { ARTIFICIAL_SETT_GRID_REFERENCE } = ReturnsURIs.A24

const artificialSettGridReference = 'artificial-sett-grid-reference'
export const validator = payload => gridReferenceValidator(payload, artificialSettGridReference)

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  let artificialSettFoundGridReference
  if (returnId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    artificialSettFoundGridReference = licenceReturn?.artificialSettFoundGridReference
  }
  return { artificialSettFoundGridReference }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const artificialSettFoundGridReference = request.payload[artificialSettGridReference]
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, disturbBadgers: artificialSettFoundGridReference }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, disturbBadgers: artificialSettFoundGridReference }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: ARTIFICIAL_SETT_GRID_REFERENCE.page,
  uri: ARTIFICIAL_SETT_GRID_REFERENCE.uri,
  checkData: checkApplication,
  validator: validator,
  getData: getData,
  setData: setData
})
