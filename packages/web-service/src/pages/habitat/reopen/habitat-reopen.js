import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

export const completion = async _request => habitatURIs.ENTRANCES.uri

export default pageRoute({
  page: habitatURIs.REOPEN.page,
  uri: habitatURIs.REOPEN.uri,
  validator: Joi.object({
    'habitat-reopen': Joi.boolean().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion
})
