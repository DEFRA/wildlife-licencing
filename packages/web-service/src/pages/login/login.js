import pageRoute from '../../routes/page-route.js'
import { LOGIN, APPLICATIONS } from '../../uris.js'
import Joi from 'joi'

export const completion = async (_request, _h) => APPLICATIONS.uri

const validator = Joi.object({
  'user-id': Joi.string().uppercase().trim().alphanum().min(3).max(30).required()
}).options({ abortEarly: false, allowUnknown: true })

export default pageRoute(
  LOGIN.page,
  LOGIN.uri,
  validator,
  completion,
  null,
  async data => console.log(data), {
    auth: false
  })
