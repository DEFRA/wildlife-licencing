import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { errorShim } from '../../../handlers/page-handler.js'
import { habitatURIs } from '../../../uris.js'

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  if (pageData.error) {
    return habitatURIs.ACTIVE_ENTRANCES.uri
  } else {
    return habitatURIs.GRID_REF.uri
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()

  const numberOfActiveEntrances = pageData.payload['habitat-active-entrances']
  const totalEntrances = journeyData.habitatData.numberOfEntrances
  if (numberOfActiveEntrances > totalEntrances) {
    await request.cache().setPageData({
      payload: request.payload,
      error: errorShim(new Joi.ValidationError('ValidationError', [{
        message: 'Error: the user has entered more active holes than total holes',
        path: ['habitat-active-entrances'],
        type: 'tooManyActiveHoles',
        context: {
          label: 'habitat-active-entrances',
          value: 'Error',
          key: 'habitat-active-entrances'
        }
      }]))
    })

    return
  }

  journeyData.habitatData = Object.assign(journeyData.habitatData, { numberOfActiveEntrances })
  request.cache().setData(journeyData)
}

export default pageRoute({
  page: habitatURIs.ACTIVE_ENTRANCES.page,
  uri: habitatURIs.ACTIVE_ENTRANCES.uri,
  validator: Joi.object({
    'habitat-active-entrances': Joi.number().integer().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData
})
