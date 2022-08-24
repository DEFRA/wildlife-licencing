import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'

export const addressPage = ({ page, uri, checkData, getData, completion, setData }) =>
  pageRoute({
    page,
    uri,
    checkData,
    getData,
    completion,
    setData,
    validator: Joi.object({
      uprn: Joi.number()
    }).options({ abortEarly: false, allowUnknown: true })
  })
