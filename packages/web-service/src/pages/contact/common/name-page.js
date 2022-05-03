import pageRoute from '../../../routes/page-route.js'
import Joi from 'joi'

export const namePage = (uri, getData, completion, setData) => pageRoute(
  uri.page,
  uri.uri,
  null,
  getData,
  Joi.object({
    name: Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData
)
