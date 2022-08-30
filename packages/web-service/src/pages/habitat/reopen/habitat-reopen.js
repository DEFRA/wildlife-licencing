import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { changeHandler, putData } from '../../../utils/editTools.js'

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()

  const willReopen = pageData.payload['habitat-reopen']

  if (journeyData.complete) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await changeHandler(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { willReopen })
    await putData(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { willReopen })
  request.cache().setData(journeyData)
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  if (journeyData.complete) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.ENTRANCES.uri
}

export default pageRoute({
  page: habitatURIs.REOPEN.page,
  uri: habitatURIs.REOPEN.uri,
  validator: Joi.object({
    'habitat-reopen': Joi.boolean().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData
})
