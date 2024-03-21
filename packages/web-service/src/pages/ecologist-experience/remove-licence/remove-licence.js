import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'
import { boolFromYesNo } from '../../common/common.js'

export const getData = async request => {
  const { licence } = request.query
  const journeyData = await request.cache().getData()
  journeyData.ecologistExperienceTemp = { licence }
  await request.cache().setData(journeyData)
  return licence
}

export const completion = () => ecologistExperienceURIs.PREVIOUS_INDIVIDUAL_BADGER_LICENCE_DETAILS.uri

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, ecologistExperienceTemp } = journeyData
  const { licence } = ecologistExperienceTemp
  if (boolFromYesNo(request.payload['remove-licence'])) {
    await APIRequests.ECOLOGIST_EXPERIENCE.removePreviousLicence(applicationId, licence)
    const licences = await APIRequests.ECOLOGIST_EXPERIENCE.getPreviousLicences(applicationId)
    // If no more licences set previous licence to false
    if (!licences.length) {
      const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
      ecologistExperience.previousLicence = false
      ecologistExperience.previousLicencesAllRemoved = true
      await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(applicationId, ecologistExperience)
    }
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
