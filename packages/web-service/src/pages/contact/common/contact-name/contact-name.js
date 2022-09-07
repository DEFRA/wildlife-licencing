import { APIRequests } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'
import { accountsFilter } from '../common.js'

export const getContactData = contact => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  return APIRequests[contact].getByApplicationId(applicationId)
}

export const setContactData = (contactType, apiBase) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const pageData = await request.cache().getPageData()
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  if (!contact || contact.submitted) {
    // Creates and associate a new contact
    await APIRequests[contactType].create(applicationId, {
      fullName: pageData.payload.name
    })
  } else {
    // Update the existing contact if already assigned
    Object.assign(contact, { fullName: pageData.payload.name })
    await APIRequests[contactType].update(applicationId, contact)
  }
  await request.cache().clearPageData(apiBase.ORGANISATIONS.page)
  await request.cache().clearPageData(apiBase.IS_ORGANISATION.page)
}

export const contactNameCompletion = (_contactType, accountType, urlBase) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  // If an organisation is already assigned,
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  if (account) {
    // Immutable
    if (account.submitted) {
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
