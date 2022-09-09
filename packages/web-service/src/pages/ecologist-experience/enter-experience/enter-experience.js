import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const flagged = await APIRequests.APPLICATION.tags(journeyData.applicationId).has(SECTION_TASKS.ECOLOGIST_EXPERIENCE)
  if (flagged) {
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
  const flagged = await APIRequests.APPLICATION.tags(journeyData.applicationId).has(SECTION_TASKS.ECOLOGIST_EXPERIENCE)
  if (flagged) {
    await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(journeyData.applicationId, journeyData.ecologistExperience)
  }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_EXPERIENCE.uri,
  page: ecologistExperienceURIs.ENTER_EXPERIENCE.page,
  validator: Joi.object({
    'enter-experience': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData,
  completion,
  getData
})
