import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.ECOLOGIST_EXPERIENCE, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  return ecologistExperience.classMitigationDetails
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  const classMitigationDetails = request.payload['enter-class-mitigation-details']
  Object.assign(ecologistExperience, { classMitigationDetails })
  await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(applicationId, ecologistExperience)
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_CLASS_MITIGATION.uri,
  page: ecologistExperienceURIs.ENTER_CLASS_MITIGATION.page,
  checkData: checkApplication,
  validator: Joi.object({
    'enter-class-mitigation-details': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData,
  completion,
  getData
})
