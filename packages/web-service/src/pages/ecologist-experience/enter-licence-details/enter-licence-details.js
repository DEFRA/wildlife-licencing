import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'

export const completion = async () => ecologistExperienceURIs.LICENCE.uri

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.ECOLOGIST_EXPERIENCE.addPreviousLicence(applicationId, request.payload['enter-licence-details'])
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_LICENCE_DETAILS.uri,
  page: ecologistExperienceURIs.ENTER_LICENCE_DETAILS.page,
  checkData: checkApplication,
  validator: Joi.object({
    'enter-licence-details': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData,
  completion
})
