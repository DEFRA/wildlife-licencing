import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { habitatURIs } from '../../../../uris.js'
import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { checkApplication } from '../common/check-application.js'
import { isComplete } from '../../../common/tag-is-complete.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const tag = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.SETTS)

  if (isComplete(tag)) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.WORK_START.uri
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const tag = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.SETTS)

  const gridReference = pageData.payload['habitat-grid-ref']

  if (isComplete(tag)) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { gridReference })
    await putHabitatById(newSett)
  }

  journeyData.habitatData = Object.assign(journeyData.habitatData, { gridReference })
  request.cache().setData(journeyData)
}

export const getData = async request => {
  const gridReference = (await request.cache().getData())?.habitatData?.gridReference
  return { gridReference }
}

export default pageRoute({
  page: habitatURIs.GRID_REF.page,
  uri: habitatURIs.GRID_REF.uri,
  validator: Joi.object({
    'habitat-grid-ref': Joi.string().trim().pattern(/[a-zA-Z]{2}\d{6}/).required()
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkApplication,
  completion,
  getData,
  setData
})
