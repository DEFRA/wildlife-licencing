import { APIRequests } from '../../../../services/api-requests.js'
import { contactOperations } from '../operations.js'
import { moveTagInProgress } from '../../../common/tag-functions.js'
import { ROLE_SECTION_MAP } from '../common-handler.js'

export const getContactData = contactRole => async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, ROLE_SECTION_MAP[contactRole])
  return APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
}

/**
 * Create a contact if one does not already exist
 * @param contactRole
 * @returns {(function(*): Promise<void>)|*}
 */
export const setContactData = contactRole => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contactOps = contactOperations(contactRole, applicationId, userId)
  await contactOps.create(false)
  await contactOps.setName(request.payload.name)
}

export const contactNameCompletion = (accountRole, urlBase) => async request => {
  const { applicationId } = await request.cache().getData()
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  if (account) {
    if (!account.contactDetails) {
      return urlBase.EMAIL.uri
    } else if (!account.address) {
      return urlBase.POSTCODE.uri
    } else {
      return urlBase.CHECK_ANSWERS.uri
    }
  }

  return urlBase.IS_ORGANISATION.uri
}
