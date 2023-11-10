import pageRoute from '../../routes/page-route.js'
import { FEEDBACK } from '../../uris.js'
import Joi from 'joi'

export const validator = async payload => {
  Joi.assert(
    payload,
    Joi.object({
      'nps-satisfaction': Joi.any().required()
    }).options({ abortEarly: false, allowUnknown: true })
  )
}

export default pageRoute({
  page: FEEDBACK.page,
  uri: FEEDBACK.uri,
  validator
})
