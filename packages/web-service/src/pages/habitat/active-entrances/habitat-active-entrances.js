import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

export const completion = async _request => habitatURIs.GRID_REF.uri

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const activeEntrances = pageData.payload['habitat-active-entrances']
  const journeyData = await request.cache().getData()
  request.cache().setData(Object.assign(journeyData, { activeEntrances }))
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
