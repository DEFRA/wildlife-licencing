import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

export const completion = async () => ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const classMitigationDetails = pageData.payload[ecologistExperienceURIs.ENTER_CLASS_MITIGATION.page]
  const flagged = await APIRequests.APPLICATION.tags(journeyData.applicationId).has(SECTION_TASKS.ECOLOGIST_EXPERIENCE)
  if (!flagged) {
    await APIRequests.ECOLOGIST_EXPERIENCE.create(journeyData.applicationId, journeyData.ecologistExperience)
    await APIRequests.APPLICATION.tags(journeyData.applicationId).add(SECTION_TASKS.ECOLOGIST_EXPERIENCE)
  } else {
    await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(journeyData.applicationId, journeyData.ecologistExperience)
  }
  Object.assign(journeyData.ecologistExperience, { classMitigationDetails })
  await request.cache().setData(journeyData)
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  return journeyData.ecologistExperience.classMitigationDetails
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_CLASS_MITIGATION.uri,
  page: ecologistExperienceURIs.ENTER_CLASS_MITIGATION.page,
  validator: Joi.object({
    'enter-class-mitigation-details': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData,
  completion,
  getData
})
