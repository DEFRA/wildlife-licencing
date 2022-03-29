import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'

export const yesNoPage = (uri, completion, setData, options) => pageRoute(
  uri.page,
  uri.uri,
  Joi.object({
    'yes-no': Joi.any()
      .valid('yes', 'no')
      .required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  null,
  setData,
  options
)
