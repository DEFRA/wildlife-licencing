import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'

export const contactNamesPage = (uri, checkData, getData, completion, setData) => pageRoute(
  uri.page,
  uri.uri,
  checkData,
  getData,
  Joi.object({}).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData
)
