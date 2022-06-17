import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'

// The organization allows language characters, numbers, hyphens spaces and the full-stop
const nameReg = /^[/\s\p{L}\d.-]{1,160}$/u
const schema = Joi.object({
  'is-organization': Joi.any().valid('yes', 'no').required(),
  'organization-name': Joi.alternatives().conditional('is-organization', {
    is: 'yes',
    then: Joi.string().trim().pattern(nameReg).required(),
    otherwise: Joi.any().optional()
  })
}).options({ abortEarly: false, allowUnknown: true })

export const isOrganization = (uri, checkData, getData, completion, setData) => pageRoute(
  uri.page,
  uri.uri,
  checkData,
  getData,
  schema,
  completion,
  setData
)
