import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { changeHandler, putData } from '../../../utils/editTools.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  if (journeyData.complete) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.WORK_START.uri
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()

  const gridReference = pageData.payload['habitat-grid-ref']

  if (journeyData.complete) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await changeHandler(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { gridReference })
    await putData(newSett)
  }

  journeyData.habitatData = Object.assign(journeyData.habitatData, { gridReference })
  request.cache().setData(journeyData)
}

export default pageRoute({
  page: habitatURIs.GRID_REF.page,
  uri: habitatURIs.GRID_REF.uri,
  validator: Joi.object({
    'habitat-grid-ref': Joi.string().trim().pattern(/[a-zA-Z]{2}\d{6}/).required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData
})
