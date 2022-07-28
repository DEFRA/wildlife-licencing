import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'

export const yesNoPage = ({ page, uri, checkData, getData, completion, setData, options }) => pageRoute({
  page,
  uri,
  checkData,
  getData,
  validator: Joi.object({
    'yes-no': Joi.any()
      .valid('yes', 'no')
      .required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData,
  options
})

export const isYes = request => request.payload['yes-no'] === 'yes'
