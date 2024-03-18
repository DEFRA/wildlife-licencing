import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { habitatURIs } from '../../../../uris.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import { A24_SETT } from '../../../tasklist/a24-badger-licence.js'

const oldPage = 'habitat-entrances'
export const completion = async request => {
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)

  if (isCompleteOrConfirmed(tagState)) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.ACTIVE_ENTRANCES.uri
}

export const validator = async (payload, context) => {
  const journeyData = await cacheDirect(context).getData()
  const { context: { query: { id: settId } } } = context

  let activeEntranceCount = 0
  if (settId) {
    const habitatSites = await APIRequests.HABITAT.getHabitatsById(journeyData.applicationId)
    const currentHabitat = habitatSites.filter(obj => obj.id === settId)[0] || {}
    activeEntranceCount = +currentHabitat.numberOfActiveEntrances || 0
  }

  Joi.assert(
    payload,
    Joi.object({
      [oldPage]: Joi.number().required().integer().min(1).max(100).greater(activeEntranceCount - 1) // because this can be greater than or equal to, we - 1
    }).options({ abortEarly: false, allowUnknown: true })
  )
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)

  const numberOfEntrances = parseInt(pageData.payload[oldPage])

  if (isCompleteOrConfirmed(tagState)) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { numberOfEntrances })
    await putHabitatById(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { numberOfEntrances })
  await request.cache().setData(journeyData)
}

export const getData = async request => {
  const numberOfEntrances = (await request.cache().getData())?.habitatData?.numberOfEntrances
  return { numberOfEntrances }
}

export default pageRoute({
  page: habitatURIs.ENTRANCES.page,
  uri: habitatURIs.ENTRANCES.uri,
  checkData: checkApplication,
  validator,
  completion,
  getData,
  setData
})
