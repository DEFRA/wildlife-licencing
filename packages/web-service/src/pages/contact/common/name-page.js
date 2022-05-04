import pageRoute from '../../../routes/page-route.js'
import Joi from 'joi'

const nameReg = /^[/\s\p{L}-]{1,160}$/u

export const namePage = (uri, checkData, getData, completion, setData) => pageRoute(
  uri.page,
  uri.uri,
  checkData,
  getData,
  Joi.object({
    name: Joi.string().trim().pattern(nameReg).required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData
)
