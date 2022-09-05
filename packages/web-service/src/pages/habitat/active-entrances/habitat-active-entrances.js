import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { errorShim } from '../../../handlers/page-handler.js'
import { habitatURIs } from '../../../uris.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  if (pageData.error) {
    return habitatURIs.ACTIVE_ENTRANCES.uri
  }
  if (journeyData.complete) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.GRID_REF.uri
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()

  const habitatActiveEntrances = 'habitat-active-entrances'
  const numberOfActiveEntrances = pageData.payload[habitatActiveEntrances]
  const active = journeyData.habitatData.numberOfEntrances > 0 && pageData.payload[habitatActiveEntrances] > 0

  const totalEntrances = journeyData.habitatData.numberOfEntrances
  if (numberOfActiveEntrances > totalEntrances) {
    await request.cache().setPageData({
      payload: request.payload,
      error: errorShim(new Joi.ValidationError('ValidationError', [{
        message: 'Error: the user has entered more active holes than total holes',
        path: [habitatActiveEntrances],
        type: 'tooManyActiveHoles',
        context: {
          label: habitatActiveEntrances,
          value: 'Error',
          key: habitatActiveEntrances
        }
      }]))
    })

    return
  }

  if (journeyData.complete) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { numberOfActiveEntrances, active })
    await putHabitatById(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { numberOfActiveEntrances, active })
  request.cache().setData(journeyData)
}

export default pageRoute({
  page: habitatURIs.ACTIVE_ENTRANCES.page,
  uri: habitatURIs.ACTIVE_ENTRANCES.uri,
  validator: Joi.object({
    'habitat-active-entrances': Joi.number().integer().required().max(100)
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData
})
