import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { setData } from '../types/habitat-types.js'

export const completion = async _request => habitatURIs.ACTIVE_ENTRANCES.uri

export default pageRoute({
  page: habitatURIs.ENTRANCES.page,
  uri: habitatURIs.ENTRANCES.uri,
  validator: Joi.object({
    'habitat-entrances': Joi.number().integer().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData
})
