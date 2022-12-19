import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { habitatURIs } from '../../../../uris.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.SETTS)

  if (isCompleteOrConfirmed(tagState)) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.GRID_REF.uri
}

export const validator = async (payload, context) => {
  const journeyData = await cacheDirect(context).getData()
  const { context: { query: { id: settId } } } = context

  let numberOfTotalEntrances = 0
  if (settId) {
    const habitatSites = await APIRequests.HABITAT.getHabitatsById(journeyData.applicationId)
    const currentHabitat = habitatSites.filter(obj => obj.id === settId)[0] || {}
    numberOfTotalEntrances = currentHabitat.numberOfEntrances || 0
  } else {
    numberOfTotalEntrances = journeyData.habitatData.numberOfEntrances
  }

  const numberOfActiveEntrances = payload[habitatURIs.ACTIVE_ENTRANCES.page]

  Joi.assert(
    { [habitatURIs.ACTIVE_ENTRANCES.page]: numberOfActiveEntrances },
    Joi.object({
      [habitatURIs.ACTIVE_ENTRANCES.page]: Joi.number().integer().required().max(100).less(numberOfTotalEntrances)
    }).options({ abortEarly: false, allowUnknown: true })
  )
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()

  let numberOfEntrances = 0
  if (request.query.id) {
    const habitatSites = await APIRequests.HABITAT.getHabitatsById(journeyData.applicationId)
    const currentHabitat = habitatSites.filter(obj => obj.id === request.query.id)[0] || {}
    numberOfEntrances = currentHabitat.numberOfEntrances || 0
  } else {
    numberOfEntrances = journeyData.habitatData.numberOfEntrances
  }

  const numberOfActiveEntrances = +pageData.payload[habitatURIs.ACTIVE_ENTRANCES.page]
  const active = numberOfEntrances > 0 && numberOfActiveEntrances > 0

  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.SETTS)

  if (isCompleteOrConfirmed(tagState)) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { numberOfActiveEntrances, active })
    await putHabitatById(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { numberOfActiveEntrances, active })
  await request.cache().setData(journeyData)
}

export const getData = async request => {
  const numberOfActiveEntrances = (await request.cache().getData())?.habitatData?.numberOfActiveEntrances
  return { numberOfActiveEntrances }
}

export default pageRoute({
  page: habitatURIs.ACTIVE_ENTRANCES.page,
  uri: habitatURIs.ACTIVE_ENTRANCES.uri,
  checkData: checkApplication,
  validator,
  completion,
  getData,
  setData
})
