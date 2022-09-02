import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs } from '../../../uris.js'

const completion = async () => ecologistExperienceURIs.LICENSE.uri

const setData = async request => {
  const pageData = await request.cache().getPageData()
  console.log(pageData)
  const journeyData = await request.cache().getData()
  const currentLicenseDetails = journeyData.ecologistExperience.licenseDetails ? journeyData.ecologistExperience.licenseDetails : []
  const licenseDetails = currentLicenseDetails.concat(pageData.payload['enter-license-details'])
  Object.assign(journeyData.ecologistExperience, { licenseDetails })
  console.log(journeyData)
  await request.cache().setData(journeyData)
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_LICENSE_DETAILS.uri,
  page: ecologistExperienceURIs.ENTER_LICENSE_DETAILS.page,
  validator: Joi.object({
    'enter-license-details': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData,
  completion
})
