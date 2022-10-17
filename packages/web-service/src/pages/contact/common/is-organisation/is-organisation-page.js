// The organisation allows language characters, numbers, hyphens spaces and the full-stop
import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import { APIRequests } from '../../../../services/api-requests.js'

const nameReg = /^[\s\p{L}\d.,'-]{1,160}$/u

export const getValidator = accountRole => async (payload, context) => {
  const cd = cacheDirect(context)
  const { userId } = await cd.getData()
  const accounts = await APIRequests.ACCOUNT.role(accountRole).findByUser(userId)
  const names = accounts.map(c => c.name).filter(c => c)

  const schema = Joi.object({
    'is-organisation': Joi.any().valid('yes', 'no').required(),
    'organisation-name': Joi.alternatives().conditional('is-organisation', {
      is: 'yes',
      then: Joi.string().trim().replace(/((\s+){2,})/gm, '$2').pattern(nameReg).invalid(...names).insensitive().required(),
      otherwise: Joi.any().optional()
    })
  }).options({ abortEarly: false, allowUnknown: true })
  Joi.assert(payload, schema, 'name', { abortEarly: false, allowUnknown: true })
}

export const isOrganisation = ({ page, uri, checkData, getData, completion, setData }, accountRole) => pageRoute({
  page,
  uri,
  checkData,
  getData,
  setData,
  completion,
  validator: getValidator(accountRole)
})
