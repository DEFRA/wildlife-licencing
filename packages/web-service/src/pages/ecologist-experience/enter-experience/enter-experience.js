import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  if (journeyData.ecologistExperience.complete) {
    return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
  }
  return ecologistExperienceURIs.ENTER_METHODS.uri
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  return journeyData.ecologistExperience.experienceDetails
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const experienceDetails = pageData.payload[ecologistExperienceURIs.ENTER_EXPERIENCE.page]
  Object.assign(journeyData.ecologistExperience, { experienceDetails })
  if (journeyData.ecologistExperience.complete) {
    APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(journeyData.applicationId, journeyData.ecologistExperience)
  }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_EXPERIENCE.uri,
  page: ecologistExperienceURIs.ENTER_EXPERIENCE.page,
  validator: Joi.object({
    'enter-experience': Joi.string()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData,
  completion,
  getData
})
