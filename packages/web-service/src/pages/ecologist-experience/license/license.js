import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'

export const completion = async request => {
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

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const licenseDetails = [].concat(journeyData.ecologistExperience.licenseDetails)
  if (typeof licenseDetails[0] !== 'undefined') {
    return licenseDetails
  }
  return undefined
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()
  if (pageData.payload.license === 'no' && journeyData.ecologistExperience.licenseDetails?.length === 0) {
    journeyData.ecologistExperience.previousLicense = false
    await request.cache().setData(journeyData)
  }
  if (pageData.payload.license === 'no' && journeyData.ecologistExperience.complete) {
    APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(journeyData.applicationId, journeyData.ecologistExperience)
  }
}

export default pageRoute({
  uri: ecologistExperienceURIs.LICENSE.uri,
  page: ecologistExperienceURIs.LICENSE.page,
  validator: Joi.object({
    license: Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData,
  getData
})
