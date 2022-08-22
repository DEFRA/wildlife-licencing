// The organisation allows language characters, numbers, hyphens spaces and the full-stop
import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'

const nameReg = /^[/\s\p{L}\d.-]{1,160}$/u

const validator = Joi.object({
  'is-organisation': Joi.any().valid('yes', 'no').required(),
  'organisation-name': Joi.alternatives().conditional('is-organisation', {
    is: 'yes',
    then: Joi.string().trim().pattern(nameReg).required(),
    otherwise: Joi.any().optional()
  })
}).options({ abortEarly: false, allowUnknown: true })

export const isOrganisation = ({ page, uri, checkData, getData, completion, setData }) => pageRoute({
  page,
  uri,
  checkData,
  getData,
  validator,
  setData,
  completion
})
