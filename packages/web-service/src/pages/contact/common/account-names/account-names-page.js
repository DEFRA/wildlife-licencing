import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'

export const accountNamesPage = ({ page, uri, checkData, getData, completion, setData }) => pageRoute({
  page,
  uri,
  checkData,
  getData,
  completion,
  setData,
  validator: Joi.object({}).options({ abortEarly: false, allowUnknown: true })
})
