import { APIRequests } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'
import { accountsFilter, contactOperations } from '../common.js'

export const getContactData = contact => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  return APIRequests[contact].getByApplicationId(applicationId)
}

export const setContactData = contactType => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contactOps = await contactOperations(contactType, applicationId, userId)
  await contactOps.setName(request.payload.name)
}

export const contactNameCompletion = (_contactType, accountType, urlBase) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  // If an organisation is already assigned,
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
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

  const accounts = await APIRequests[accountType].findByUser(userId, DEFAULT_ROLE)
  const filteredAccounts = await accountsFilter(applicationId, accounts)
  if (filteredAccounts.length) {
    return urlBase.ORGANISATIONS.uri
  } else {
    return urlBase.IS_ORGANISATION.uri
  }
}
