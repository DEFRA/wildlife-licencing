import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs } from '../../../uris.js'

const completion = async request => {
  const journeyData = await request.cache().getData()
  if (journeyData.ecologistExperience.complete) {
    return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
  }
  return ecologistExperienceURIs.ENTER_METHODS.uri
}

const setData = async request => {
  const pageData = await request.cache().getPageData()
  console.log(pageData)
  const journeyData = await request.cache().getData()
  const experienceDetails = pageData.payload[ecologistExperienceURIs.ENTER_EXPERIENCE.page]
  Object.assign(journeyData.ecologistExperience, { experienceDetails })
  console.log(journeyData)
  await request.cache().setData(journeyData)
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_EXPERIENCE.uri,
  page: ecologistExperienceURIs.ENTER_EXPERIENCE.page,
  validator: Joi.object({
    'enter-experience': Joi.string()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData,
  completion
})
