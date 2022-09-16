import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'

const validator = Joi.object({
  contact: Joi.string().required()
}).options({ abortEarly: false, allowUnknown: true })

export const contactNamesPage = ({ page, uri, checkData, getData, completion, setData }) => pageRoute({
  page,
  uri,
  checkData,
  getData,
  completion,
  setData,
  validator
})
