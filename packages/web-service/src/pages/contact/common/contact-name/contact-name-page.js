import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'
const nameReg = /^[/\s\p{L}-]{1,160}$/u

export const contactNamePage = ({ page, uri, checkData, getData, completion, setData }) => pageRoute({
  page,
  uri,
  checkData,
  getData,
  completion,
  setData,
  validator: Joi.object({
    name: Joi.string().trim().pattern(nameReg).required()
  }).options({ abortEarly: false, allowUnknown: true })
})
