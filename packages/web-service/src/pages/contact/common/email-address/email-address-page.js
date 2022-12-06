import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import { APIRequests } from '../../../../services/api-requests.js'

export const getValidator = (contactRole, accountRole) => async (payload, context) => {
  const cd = cacheDirect(context)
  const { applicationId } = await cd.getData()
  const contact = contactRole && await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = accountRole && await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  const email = account?.contactDetails?.email || contact?.contactDetails?.email
  Joi.assert({
    'email-address': payload['email-address'],
    'change-email': payload['change-email']
  }, Joi.object({
    'change-email': Joi.any().valid('yes', 'no').required(),
    'email-address': Joi.alternatives().conditional('change-email', {
      is: 'yes',
      then: email ? Joi.string().email().invalid(email).required().lowercase() : Joi.string().email().required().lowercase(),
      otherwise: Joi.any().optional()
    }).options({ abortEarly: false, allowUnknown: true })
  }))
}

export const emailAddressPage = ({ page, uri, checkData, getData, completion, setData }, contactRole, accountRole = null) =>
  pageRoute({
    page,
    uri,
    checkData,
    getData,
    completion,
    setData,
    validator: getValidator(contactRole, accountRole)
  })
