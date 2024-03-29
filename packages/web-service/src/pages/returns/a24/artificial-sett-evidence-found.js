import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { allCompletion, checkLicence } from '../common-return-functions.js'
import Joi from 'joi'

const { ARTIFICIAL_SETT_EVIDENCE_FOUND } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(journeyData?.applicationId)
  let artificialSettFoundEvidence
  if (returnId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    artificialSettFoundEvidence = licenceReturn?.artificialSettFoundEvidence
  }
  return { artificialSettFoundEvidence }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const artificialSettFoundEvidence = request.payload['located-artificial-sett']
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, artificialSettFoundEvidence }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, artificialSettFoundEvidence }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: ARTIFICIAL_SETT_EVIDENCE_FOUND.page,
  uri: ARTIFICIAL_SETT_EVIDENCE_FOUND.uri,
  completion: allCompletion,
  validator: Joi.object({
    'located-artificial-sett': Joi.string().trim().required().replace('\r\n', '\n').max(4000)
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkLicence,
  getData: getData,
  setData: setData
})
