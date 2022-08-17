import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { setData } from '../types/habitat-types.js'

export const completion = async _request => habitatURIs.GRID_REF.uri

export default pageRoute({
  page: habitatURIs.ACTIVE_ENTRANCES.page,
  uri: habitatURIs.ACTIVE_ENTRANCES.uri,
  validator: Joi.object({
    'habitat-active-entrances': Joi.number().integer().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData
})
