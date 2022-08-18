import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'

export const addressFormPage = ({ page, uri, checkData, getData, completion, setData }) =>
  pageRoute({
    page,
    uri,
    checkData,
    getData,
    completion,
    setData,
    validator: Joi.object({
      'address-line-1': Joi.string().required().trim().pattern(/^[/\s\p{L}\d.,-]{1,80}$/u),
      'address-line-2': Joi.string().allow('').trim().pattern(/^[/\s\p{L}.,-]{1,80}$/u),
      'address-town': Joi.string().required().trim().pattern(/^[/\s\p{L}.,!-]{1,80}$/u),
      'address-county': Joi.string().allow('').trim().pattern(/^[/\s\p{L}]{1,80}$/u)
    }).options({ abortEarly: false, allowUnknown: true })
  })
