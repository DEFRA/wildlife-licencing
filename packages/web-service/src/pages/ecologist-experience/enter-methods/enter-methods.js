import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { checkApplication } from '../../common/check-application.js'
import { restoreInputGetData } from '../../common/restore-input-get-data.js'
import { maxInputValidator } from '../../common/max-input-validator.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const flagged = await APIRequests.APPLICATION.tags(journeyData.applicationId).has(SECTION_TASKS.ECOLOGIST_EXPERIENCE)
  if (flagged) {
    return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
  }
  return ecologistExperienceURIs.CLASS_MITIGATION.uri
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  const methodExperience = request.payload['enter-methods'].replaceAll('\r\n', '\n')
  Object.assign(ecologistExperience, { methodExperience })
  await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(applicationId, ecologistExperience)
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_METHODS.uri,
  page: ecologistExperienceURIs.ENTER_METHODS.page,
  checkData: checkApplication,
  getData: request => restoreInputGetData(request, 'enter-methods'),
  validator: (request, context) => maxInputValidator(request, context, 'enter-methods'),
  setData,
  completion
})
