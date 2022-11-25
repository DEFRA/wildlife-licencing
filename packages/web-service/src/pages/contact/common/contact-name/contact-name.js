import { APIRequests } from '../../../../services/api-requests.js'
import { getAccountsCandidates } from '../common.js'
import { contactOperations } from '../operations.js'

export const getContactData = contactRole => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  return APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
}

/**
 * Create a contact if one does not already exist
 * The user page will create the signed-in user
 * @param contactRole
 * @returns {(function(*): Promise<void>)|*}
 */
export const setContactData = contactRole => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contactOps = contactOperations(contactRole, applicationId, userId)
  await contactOps.create(false)
  await contactOps.setName(request.payload.name)
}

export const contactNameCompletion = (_contactRole, accountRole, urlBase) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  // If an organisation is already assigned,
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  if (account) {
    // Immutable
    if (await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)) {
      return urlBase.CHECK_ANSWERS.uri
    } else {
      if (!account.contactDetails) {
        return urlBase.EMAIL.uri
      } else if (!account.address) {
        return urlBase.POSTCODE.uri
      } else {
        return urlBase.CHECK_ANSWERS.uri
      }
    }
  }

  const candidateAccounts = await getAccountsCandidates(userId, applicationId, accountRole)
  if (candidateAccounts.length) {
    return urlBase.ORGANISATIONS.uri
  } else {
    return urlBase.IS_ORGANISATION.uri
  }
}
