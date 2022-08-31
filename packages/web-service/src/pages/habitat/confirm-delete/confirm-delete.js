import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { habitatURIs } from '../../../uris.js'

export const setData = async request => {
  if (request.payload['confirm-delete']) {
    const journeyData = await request.cache().getData()
    await APIRequests.HABITAT.deleteSett(journeyData.habitatData.applicationId, request.query.id)
  }

  return null
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const habitatSites = await APIRequests.HABITAT.getHabitatsById(journeyData.habitatData.applicationId)

  return habitatSites.filter(obj => obj.id === request.query.id)[0]
}

export const completion = async _request => habitatURIs.CHECK_YOUR_ANSWERS.uri

export default pageRoute({
  page: habitatURIs.CONFIRM_DELETE.page,
  uri: habitatURIs.CONFIRM_DELETE.uri,
  validator: Joi.object({
    'confirm-delete': Joi.boolean().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  getData,
  setData
})
