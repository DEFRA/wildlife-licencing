import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

export const completion = async _request => habitatURIs.WORK_START.uri

export default pageRoute({
  page: habitatURIs.GRID_REF.page,
  uri: habitatURIs.GRID_REF.uri,
  validator: Joi.object({
    'habitat-grid-ref': Joi.string().trim().pattern(/[a-zA-Z]{2}\d{6}/).required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion
})
