import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { changeHandler, putData } from '../../../utils/editTools.js'
const page = 'habitat-entrances'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  if (journeyData.complete) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  console.log('REDIRECTING')
  return habitatURIs.ACTIVE_ENTRANCES.uri
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()

  const numberOfEntrances = pageData.payload[page]

  if (journeyData.complete) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await changeHandler(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { numberOfEntrances })
    await putData(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { numberOfEntrances })
  request.cache().setData(journeyData)
}

export default pageRoute({
  page: habitatURIs.ENTRANCES.page,
  uri: habitatURIs.ENTRANCES.uri,
  validator: Joi.object({
    [page]: Joi.number().integer().required().max(100)
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData
})
