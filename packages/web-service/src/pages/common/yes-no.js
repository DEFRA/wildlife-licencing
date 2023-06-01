import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'

export const yesNoPage = ({ page, uri, checkData, getData, completion, setData, options, backlink }) => pageRoute({
  page,
  uri,
  checkData,
  getData,
  completion,
  setData,
  options,
  validator: Joi.object({
    'yes-no': Joi.any()
      .valid('yes', 'no')
      .required()
  }).options({ abortEarly: false, allowUnknown: true }),
  backlink
})
