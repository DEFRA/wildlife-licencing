import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { habitatURIs } from '../../../../uris.js'
import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { checkApplication } from '../common/check-application.js'

const page = 'habitat-entrances'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const complete = await APIRequests.APPLICATION.tags(journeyData.applicationId).has(SECTION_TASKS.SETTS)

  if (complete) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.ACTIVE_ENTRANCES.uri
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const complete = await APIRequests.APPLICATION.tags(journeyData.applicationId).has(SECTION_TASKS.SETTS)

  const numberOfEntrances = pageData.payload[page]

  if (complete) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { numberOfEntrances })
    await putHabitatById(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { numberOfEntrances })
  request.cache().setData(journeyData)
}

export const getData = async request => {
  const numberOfEntrances = (await request.cache().getData())?.habitatData?.numberOfEntrances
  return { numberOfEntrances }
}

export default pageRoute({
  page: habitatURIs.ENTRANCES.page,
  uri: habitatURIs.ENTRANCES.uri,
  validator: Joi.object({
    [page]: Joi.number().integer().required().max(100)
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkApplication,
  completion,
  getData,
  setData
})
