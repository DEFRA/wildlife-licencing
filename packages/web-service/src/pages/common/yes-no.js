import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'

export const yesNoPage = (uri, checkData, completion, setData, options) => pageRoute(
  uri.page,
  uri.uri,
  checkData,
  null,
  Joi.object({
    'yes-no': Joi.any()
      .valid('yes', 'no')
      .required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData,
  options
)

export const isYes = request => request.payload['yes-no'] === 'yes'
