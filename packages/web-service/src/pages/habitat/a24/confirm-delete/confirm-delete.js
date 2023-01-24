import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { habitatURIs, TASKLIST } from '../../../../uris.js'
import { checkApplication } from '../../../common/check-application.js'
import { tagStatus } from '../../../../services/status-tags.js'
import { A24_SETT } from '../../../tasklist/a24-badger-licence.js'

let tempId = ''

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const totalSites = await APIRequests.HABITAT.getHabitatsById(journeyData.applicationId)

  if (request.payload['confirm-delete']) {
    await APIRequests.HABITAT.deleteSett(journeyData.applicationId, request.query.id || tempId)

    if (totalSites.length === 1) {
      // If you remove the only sett you have, your journey is no longer complete
      await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: A24_SETT, tagState: tagStatus.IN_PROGRESS })
    }
  }

  return null
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const habitatSites = await APIRequests.HABITAT.getHabitatsById(journeyData.applicationId)
  if (request.query.id) {
    tempId = request.query.id
  }
  return habitatSites.filter(obj => obj.id === request.query.id || tempId)[0]
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const totalSites = await APIRequests.HABITAT.getHabitatsById(journeyData.applicationId)
  if (totalSites.length === 0) {
    return TASKLIST.uri
  } else {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
}

export default pageRoute({
  page: habitatURIs.CONFIRM_DELETE.page,
  uri: habitatURIs.CONFIRM_DELETE.uri,
  validator: Joi.object({
    'confirm-delete': Joi.boolean().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkApplication,
  completion,
  getData,
  setData
})
