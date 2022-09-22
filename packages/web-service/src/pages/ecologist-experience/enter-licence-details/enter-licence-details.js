import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'

export const completion = async () => ecologistExperienceURIs.LICENCE.uri

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  ecologistExperience.licenceDetails = ecologistExperience.licenceDetails || []
  ecologistExperience.licenceDetails.push(request.payload['enter-licence-details'])
  await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(applicationId, ecologistExperience)
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
