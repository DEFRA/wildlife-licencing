import { APIRequests } from '../../../../services/api-requests.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'
import { contactRoleIsSingular } from '../contact-roles.js'
const nameReg = /^[\s\p{L}'.,-]{1,160}$/u

/**
 * Find the duplicate names to validate against
 * For a singular role, ecologists etc, the duplicate check is across the user
 * otherwise, for authorised people, it is across the application.
 * For a singular role, the current name is excepted
 * @param contactRoles
 * @param userId
 * @param applicationId
 * @returns {Promise<*[]|*>}
 */
const duplicateNames = async (primaryRole, contactRoles, userId, applicationId) => {
  let contacts = []
  for await (const cr of contactRoles) {
    if (contactRoleIsSingular(cr)) {
      contacts = contacts.concat(await APIRequests.CONTACT.role(cr).findByUser(userId))
    } else {
      contacts = await APIRequests.CONTACT.role(cr).getByApplicationId(applicationId)
    }
  }
  if (contactRoleIsSingular(primaryRole)) {
    const currentContact = await APIRequests.CONTACT.role(primaryRole).getByApplicationId(applicationId)
    return contacts.map(c => c.fullName).filter(c => c && c.toUpperCase() !== currentContact?.fullName?.toUpperCase())
  } else {
    return contacts.map(c => c.fullName).filter(c => c)
  }
}

export const getValidator = (primaryRole, contactRoles) => async (payload, context) => {
  const cd = cacheDirect(context)
  const { userId, applicationId } = await cd.getData()
  const names = await duplicateNames(primaryRole, contactRoles, userId, applicationId)
  Joi.assert({ name: payload.name }, Joi.object({
    // Remove double spacing
    name: Joi.string().trim().replace(/((\s+){2,})/gm, '$2')
      .pattern(nameReg).invalid(...names).insensitive().required()
  }), 'name', { abortEarly: false, allowUnknown: true })
}

export const contactNamePage = ({ page, uri, checkData, getData, completion, setData }, primaryRole, contactRoles) =>
  pageRoute({
    page,
    uri,
    checkData,
    getData,
    completion,
    setData,
    validator: getValidator(primaryRole, contactRoles)
  })
