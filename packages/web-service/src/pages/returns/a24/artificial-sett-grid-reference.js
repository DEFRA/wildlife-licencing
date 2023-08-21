import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { gridReferenceValidator } from '../../../pages/common/grid-ref-validator.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkLicence } from '../common-return-functions.js'

const { ARTIFICIAL_SETT_GRID_REFERENCE } = ReturnsURIs.A24
const { LICENCE_CONDITIONS } = ReturnsURIs

const artificialSettGridReference = 'artificial-sett-grid-reference'
export const validator = payload => gridReferenceValidator(payload, artificialSettGridReference)

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(journeyData?.applicationId)
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
  const payload = { ...licenceReturn, artificialSettFoundGridReference }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, artificialSettFoundGridReference }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: ARTIFICIAL_SETT_GRID_REFERENCE.page,
  uri: ARTIFICIAL_SETT_GRID_REFERENCE.uri,
  completion: LICENCE_CONDITIONS.uri,
  checkData: checkLicence,
  validator: validator,
  getData: getData,
  setData: setData
})
