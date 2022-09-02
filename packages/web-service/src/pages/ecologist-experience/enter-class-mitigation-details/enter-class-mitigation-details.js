import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs } from '../../../uris.js'

const completion = async () => ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri

const setData = async request => {
  const pageData = await request.cache().getPageData()
  console.log(pageData)
  const journeyData = await request.cache().getData()
  const classMitigationDetails = pageData.payload[ecologistExperienceURIs.ENTER_CLASS_MITIGATION.page]
  Object.assign(journeyData.ecologistExperience, { classMitigationDetails, complete: true })
  console.log(journeyData)
  await request.cache().setData(journeyData)
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_CLASS_MITIGATION.uri,
  page: ecologistExperienceURIs.ENTER_CLASS_MITIGATION.page,
  validator: Joi.object({
    'enter-class-mitigation-details': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData,
  completion
})
