import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'

// The organisation allows language characters, numbers, hyphens spaces and the full-stop
const nameReg = /^[/\s\p{L}\d.-]{1,160}$/u
const schema = Joi.object({
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
  schema,
  completion,
  setData
})
