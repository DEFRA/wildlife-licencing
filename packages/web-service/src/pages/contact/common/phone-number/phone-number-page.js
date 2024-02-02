import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import { APIRequests } from '../../../../services/api-requests.js'

export const getValidator = (contactRole, accountRole) => async (payload, context) => {
  const cd = cacheDirect(context)
  const { applicationId } = await cd.getData()
  const contact = contactRole && await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = accountRole && await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  const phoneNumber = account?.contactDetails?.phoneNumber || contact?.contactDetails?.phoneNumber
  
  Joi.assert({
    'phone-number': payload['phone-number']
  }, Joi.object({
    'phone-number': Joi.any().required()
  }))
}

export const phoneNumberPage = ({ page, uri, checkData, getData, completion, setData }, contactRole, accountRole = null) =>
  pageRoute({
    page,
    uri,
    checkData,
    getData,
    completion,
    setData,
    validator: getValidator(contactRole, accountRole)
  })
