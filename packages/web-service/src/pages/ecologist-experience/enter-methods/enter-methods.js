import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { checkApplication } from '../../common/check-application.js'
import { cacheDirect } from '../../../session-cache/cache-decorator.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const flagged = await APIRequests.APPLICATION.tags(journeyData.applicationId).has(SECTION_TASKS.ECOLOGIST_EXPERIENCE)
  if (flagged) {
    return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
  }
  return ecologistExperienceURIs.CLASS_MITIGATION.uri
}

export const getData = async request => {
  const journeyData = await request.cache().getData()

  if (journeyData.tempInput) {
    const inputText = journeyData.tempInput
    delete journeyData.tempInput
    await request.cache().setData(journeyData)
    return inputText
  }

  // If there's no tempInput from the validator, retrieve the data from the API (might be an empty string)
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(journeyData.applicationId)
  return ecologistExperience.methodExperience
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  const methodExperience = request.payload['enter-methods'].replace('\r\n', '\n')
  Object.assign(ecologistExperience, { methodExperience })
  await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(applicationId, ecologistExperience)
}

export const validator = async (payload, context) => {
  // JS post message here sends line breaks with \r\n (CRLF) but the Gov.uk prototypes counts newlines as \n
  // Which leads to a mismatch on the character count as
  // '\r\n'.length == 2
  // '\n'.length   == 1
  const input = payload['enter-methods'].replace('\r\n', '\n')
  const journeyData = await cacheDirect(context).getData()

  if (input === '') {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: no text entered',
      path: ['enter-methods'],
      type: 'string.empty',
      context: {
        label: 'enter-methods',
        value: 'Error',
        key: 'enter-methods'
      }
    }], null)
  }

  if (input.length > 4000) {
    // Store the text in the input, so the user won't lose everything they typed, we'll delete it in getData()
    await cacheDirect(context).setData(Object.assign(journeyData, { tempInput: input }))
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: max text input exceeded',
      path: ['enter-methods'],
      type: 'string.max',
      context: {
        label: 'enter-methods',
        value: 'Error',
        key: 'enter-methods'
      }
    }], null)
  }
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_METHODS.uri,
  page: ecologistExperienceURIs.ENTER_METHODS.page,
  checkData: checkApplication,
  validator,
  setData,
  completion,
  getData
})
