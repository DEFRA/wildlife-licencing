import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs } from '../../../uris.js'

const completion = async request => {
  const journeyData = await request.cache().getData()
  if (journeyData.ecologistExperience.complete) {
    return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
  }
  return ecologistExperienceURIs.CLASS_MITIGATION.uri
}
const setData = async request => {
  const pageData = await request.cache().getPageData()
  console.log(pageData)
  const journeyData = await request.cache().getData()
  const methodExperience = pageData.payload[ecologistExperienceURIs.ENTER_METHODS.page]
  Object.assign(journeyData.ecologistExperience, { methodExperience })
  console.log(journeyData)
  await request.cache().setData(journeyData)
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_METHODS.uri,
  page: ecologistExperienceURIs.ENTER_METHODS.page,
  validator: Joi.object({
    'enter-methods': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData,
  completion
})
