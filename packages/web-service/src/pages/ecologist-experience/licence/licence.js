import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { checkApplication } from '../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../common/tag-functions.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  return APIRequests.ECOLOGIST_EXPERIENCE.getPreviousLicences(applicationId)
}

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.ECOLOGIST_EXPERIENCE)
  if (pageData.payload.licence === 'yes') {
    return ecologistExperienceURIs.ENTER_LICENCE_DETAILS.uri
  }
  if (isCompleteOrConfirmed(tagState)) {
    return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
  }
  return ecologistExperienceURIs.ENTER_EXPERIENCE.uri
}

export default pageRoute({
  uri: ecologistExperienceURIs.LICENCE.uri,
  page: ecologistExperienceURIs.LICENCE.page,
  checkData: checkApplication,
  validator: Joi.object({
    licence: Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  getData
})
