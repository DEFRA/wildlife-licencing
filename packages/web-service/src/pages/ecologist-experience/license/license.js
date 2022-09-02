import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs } from '../../../uris.js'

const completion = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  if (pageData.payload.license === 'yes') {
    return ecologistExperienceURIs.ENTER_LICENSE_DETAILS.uri
  }
  if (journeyData.ecologistExperience.complete) {
    return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
  }
  return ecologistExperienceURIs.ENTER_EXPERIENCE.uri
}

const getData = async request => {
  const journeyData = await request.cache().getData()
  const licenseDetails = [].concat(journeyData.ecologistExperience.licenseDetails)
  return licenseDetails
}

export default pageRoute({
  uri: ecologistExperienceURIs.LICENSE.uri,
  page: ecologistExperienceURIs.LICENSE.page,
  validator: Joi.object({
    license: Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  getData
})
