import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  if (journeyData.ecologistExperience.complete) {
    return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
  }
  return ecologistExperienceURIs.CLASS_MITIGATION.uri
}
export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const methodExperience = pageData.payload[ecologistExperienceURIs.ENTER_METHODS.page]
  Object.assign(journeyData.ecologistExperience, { methodExperience })
  if (journeyData.ecologistExperience.complete) {
    APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(journeyData.applicationId, journeyData.ecologistExperience)
  }
  await request.cache().setData(journeyData)
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  return journeyData.ecologistExperience.methodExperience
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_METHODS.uri,
  page: ecologistExperienceURIs.ENTER_METHODS.page,
  validator: Joi.object({
    'enter-methods': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData,
  completion,
  getData
})
