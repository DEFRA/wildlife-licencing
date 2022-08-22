import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

export const completion = async _request => habitatURIs.ACTIVE_ENTRANCES.uri

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const numberOfEntrances = pageData.payload['habitat-entrances']
  const journeyData = await request.cache().getData()
  request.cache().setData(Object.assign(journeyData, { numberOfEntrances }))
}

export default pageRoute({
  page: habitatURIs.ENTRANCES.page,
  uri: habitatURIs.ENTRANCES.uri,
  validator: Joi.object({
    'habitat-entrances': Joi.number().integer().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData
})
