import { APIRequests } from '../../../../services/api-requests.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'
const nameReg = /^[\s\p{L}'.,-]{1,160}$/u

/**
 * Find the duplicate conflicting names to validate against across the application.
 * @param primaryRole - the role of the name being tested
 * @param contactRoles - the set of roles to check for duplicate names against
 * @param userId
 * @param applicationId
 * @returns {Promise<*>}
 */
const duplicateNames = async (contactRoles, applicationId) => {
  let applicationContacts = []
  for await (const cr of contactRoles) {
    const contacts = await APIRequests.CONTACT.role(cr).getByApplicationId(applicationId)
    applicationContacts = applicationContacts.concat(contacts)
  }
  return applicationContacts.filter(c => c).map(c => c.fullName)
}

export const getValidator = contactRoles => async (payload, context) => {
  const cd = cacheDirect(context)
  const { applicationId } = await cd.getData()
  const names = await duplicateNames(contactRoles, applicationId)
  Joi.assert({ name: payload.name }, Joi.object({
    // Remove double spacing
    name: Joi.string().trim().replace(/((\s+){2,})/gm, '$2')
      .pattern(nameReg).invalid(...names).insensitive().required()
  }), 'name', { abortEarly: false, allowUnknown: true })
}

export const contactNamePage = ({ page, uri, checkData, getData, completion, setData }, contactRoles) =>
  pageRoute({
    page,
    uri,
    checkData,
    getData,
    completion,
    setData,
    validator: getValidator(contactRoles)
  })
