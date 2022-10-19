import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { checkApplication } from '../../common/check-application.js'
import { restoreInputGetData } from '../../common/restore-input-get-data.js'
import { isComplete } from '../../../common/tag-is-complete.js'

const key = 'enter-methods'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const tag = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.ECOLOGIST_EXPERIENCE)
  if (isComplete(tag)) {
    return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
  }
  return ecologistExperienceURIs.CLASS_MITIGATION.uri
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  const methodExperience = request.payload[key].replaceAll('\r\n', '\n')
  Object.assign(ecologistExperience, { methodExperience })
  await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(applicationId, ecologistExperience)
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_METHODS.uri,
  page: ecologistExperienceURIs.ENTER_METHODS.page,
  checkData: checkApplication,
  getData: request => restoreInputGetData(request, key),
  validator: Joi.object({
    // JS post message here sends line breaks with \r\n (CRLF) but the Gov.uk prototypes counts newlines as \n
    // Which leads to a mismatch on the character count as
    // '\r\n'.length == 2
    // '\n'.length   == 1
    'enter-methods': Joi.string().required().replace('\r\n', '\n').max(4000)
  }).options({ abortEarly: false, allowUnknown: true }),
  setData,
  completion
})
