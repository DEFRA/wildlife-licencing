import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs } from '../../../uris.js'

export const getData = async request => request.query.license

export const completion = () => ecologistExperienceURIs.LICENSE.uri

export const setData = async request => {
  const removingLicense = await request.query.license
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const licenses = journeyData.ecologistExperience.licenseDetails

  if (pageData.payload['remove-license'] === 'yes') {
    const index = licenses.indexOf(removingLicense)
    if (index > -1) {
      journeyData.ecologistExperience.licenseDetails.splice(index, 1)
    }
    await request.cache().setData(journeyData)
  }
}

export default pageRoute({
  uri: ecologistExperienceURIs.REMOVE_LICENSE.uri,
  page: ecologistExperienceURIs.REMOVE_LICENSE.page,
  validator: Joi.object({
    'remove-license': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
