import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'

const validator = Joi.object({
  account: Joi.string().required()
}).options({ abortEarly: false, allowUnknown: true })

export const accountNamesPage = ({ page, uri, checkData, getData, completion, setData }) => pageRoute({
  page,
  uri,
  checkData,
  getData,
  completion,
  setData,
  validator
})
