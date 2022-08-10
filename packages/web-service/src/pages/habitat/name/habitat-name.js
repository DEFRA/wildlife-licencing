import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
const nameReg = /^[/\s0-9._,\p{L}-]{1,100}$/u

export const completion = async _request => habitatURIs.TYPES.uri

export default pageRoute({
  page: habitatURIs.NAME.page,
  uri: habitatURIs.NAME.uri,
  completion,
  validator: Joi.object({
    'habitat-name': Joi.string().trim().pattern(nameReg).required()
  }).options({ abortEarly: false, allowUnknown: true })
})
