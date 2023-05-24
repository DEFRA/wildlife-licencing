import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'

export const validator = async payload => {
  if (!payload['yes-no']) {
    Joi.assert(payload, Joi.object({
      'yes-no': Joi.any().required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if (payload['yes-no'] === 'yes') {
    Joi.assert(payload, Joi.object({
      'yes-conditional-input': Joi.string().required().replace('\r\n', '\n').max(4000)
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if (payload['yes-no'] === 'no') {
    Joi.assert(payload, Joi.object({
      'no-conditional-input': Joi.string().required().replace('\r\n', '\n').max(4000)
    }).options({ abortEarly: false, allowUnknown: true }))
  }
}

export const yesNoConditionalPage = ({ page, uri, checkData, getData, completion, setData, options, backlink }) => pageRoute({
  page,
  uri,
  checkData,
  getData,
  completion,
  setData,
  options,
  validator,
  backlink
})
