import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'

export const getData = async request => {
  const { licence } = request.query
  const journeyData = await request.cache().getData()
  journeyData.ecologistExperienceTemp = { licence }
  await request.cache().setData(journeyData)
  return licence
}

export const completion = () => ecologistExperienceURIs.LICENCE.uri

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, ecologistExperienceTemp } = journeyData
  const { licence } = ecologistExperienceTemp
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  if (request.payload['remove-licence'] === 'yes') {
    const index = ecologistExperience.licenceDetails.indexOf(licence)
    if (index > -1) {
      ecologistExperience.licenceDetails.splice(index, 1)
    }
    await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(applicationId, ecologistExperience)
  }
  delete journeyData.ecologistExperienceTemp
  await request.cache().setData(journeyData)
}

export default pageRoute({
  uri: ecologistExperienceURIs.REMOVE_LICENCE.uri,
  page: ecologistExperienceURIs.REMOVE_LICENCE.page,
  checkData: checkApplication,
  validator: Joi.object({
    'remove-licence': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
