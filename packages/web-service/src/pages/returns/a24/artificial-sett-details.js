import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { allCompletion, checkLicence } from '../common-return-functions.js'

const { ARTIFICIAL_SETT_DETAILS } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(journeyData?.applicationId)
  let artificialSettDetails
  if (returnId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    artificialSettDetails = licenceReturn?.artificialSettDetails
  }
  return { artificialSettDetails }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const artificialSettDetails = request.payload['describe-artificial-sett']
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, artificialSettDetails }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, artificialSettDetails }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: ARTIFICIAL_SETT_DETAILS.page,
  uri: ARTIFICIAL_SETT_DETAILS.uri,
  validator: Joi.object({
    'describe-artificial-sett': Joi.string().trim().required().replace('\r\n', '\n').max(4000)
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkLicence,
  getData: getData,
  completion: allCompletion,
  setData: setData
})
