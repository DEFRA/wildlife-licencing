// The organisation allows language characters, numbers, hyphens spaces and the full-stop
import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'

export const isOrganisation = ({ page, uri, checkData, getData, completion, setData }, _accountRole) => pageRoute({
  page,
  uri,
  checkData,
  getData,
  setData,
  completion,
  validator: Joi.object({
    'is-organisation': Joi.any().valid('yes', 'no').required(),
    'organisation-name': Joi.alternatives().conditional('is-organisation', {
      is: 'yes',
      then: Joi.string().trim().replace(/((\s+){2,})/gm, '$2').insensitive().required(),
      otherwise: Joi.any().optional()
    })
  }).options({ abortEarly: false, allowUnknown: true })
})
