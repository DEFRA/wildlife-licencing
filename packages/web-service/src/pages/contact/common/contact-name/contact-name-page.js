import { APIRequests } from '../../../../services/api-requests.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'
import { ContactRoles } from '../contact-roles.js'
const nameReg = /^[/\s\p{L}'-.,]{1,160}$/u

// The rules for allowing duplicate contacts depend on the contact type
const duplicateNames = async (contactRole, userId, applicationId) => {
  if (contactRole === ContactRoles.AUTHORISED_PERSON) {
    const contacts = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
    return contacts.map(c => c.fullName).filter(c => c)
  } else {
    const contacts = await APIRequests.CONTACT.role(contactRole).findByUser(userId)
    return contacts.map(c => c.fullName).filter(c => c)
  }
}

export const getValidator = contactRole => async (payload, context) => {
  const cd = cacheDirect(context)
  const { userId, applicationId } = await cd.getData()
  const names = await duplicateNames(contactRole, userId, applicationId)
  Joi.assert({ name: payload.name }, Joi.object({
    // Remove double spacing
    name: Joi.string().trim().replace(/((\s+){2,})/gm, '$2')
      .pattern(nameReg).invalid(...names).insensitive().required()
  }), 'name', { abortEarly: false, allowUnknown: true })
}

export const contactNamePage = ({ page, uri, checkData, getData, completion, setData }, contactRole) =>
  pageRoute({
    page,
    uri,
    checkData,
    getData,
    completion,
    setData,
    validator: getValidator(contactRole)
  })
