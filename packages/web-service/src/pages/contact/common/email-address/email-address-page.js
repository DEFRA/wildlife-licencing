import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'

export const emailAddressPage = ({ page, uri, checkData, getData, completion, setData }) =>
  pageRoute({
    page,
    uri,
    checkData,
    getData,
    completion,
    setData,
    validator: Joi.object({
      'email-address': Joi.string().email().required().lowercase()
    }).options({ abortEarly: false, allowUnknown: true })
  })
