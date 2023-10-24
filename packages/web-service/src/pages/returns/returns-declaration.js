import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { ReturnsURIs } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { checkLicence, checkReturns } from './common-return-functions.js'

const { DECLARATION, CONFIRMATION } = ReturnsURIs

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  await APIRequests.RETURNS.queueReturnForSubmission(licenceId, returnId)

  return CONFIRMATION.uri
}

export default pageRoute({
  page: DECLARATION.page,
  uri: DECLARATION.uri,
  validator: Joi.object({
    'submit-return': Joi.any().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: [checkReturns, checkLicence],
  completion: completion
})
