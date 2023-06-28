import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS, ReturnsURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'

const { DECLARATION } = ReturnsURIs

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  await APIRequests.RETURNS.queueReturnForSubmission(licenceId, returnId)
  delete journeyData?.returns
  await request.cache().setData(journeyData)

  return APPLICATIONS.uri
}

export default pageRoute({
  page: DECLARATION.page,
  uri: DECLARATION.uri,
  validator: Joi.object({
    'submit-return': Joi.any().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkApplication,
  completion: completion
})
