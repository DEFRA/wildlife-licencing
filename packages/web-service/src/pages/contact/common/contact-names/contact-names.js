import { APIRequests } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'
import { migrateContact } from '../../common/common.js'

export const getContactNamesData = contactType => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const contacts = await APIRequests[contactType].findByUser(userId, DEFAULT_ROLE)
  // Cannot select from an associated contact
  return { contact, contacts: contacts.filter(c => !c.userId) }
}

export const setContactNamesData = contactType => async request => {
  const { payload: { contact: contactId } } = await request.cache().getPageData()
  if (contactId !== 'new') {
    const { applicationId, userId } = await request.cache().getData()
    /* TODO
     * if we select an immutable contact, which does not have an email address and address
     * the on the direct journey that information will be collected against the organization.
     * if however the user already selected 'no organization' then create a new contact
     */
    const currentContact = await APIRequests[contactType].getById(contactId)
    if (currentContact.submitted) {
      await migrateContact(currentContact, userId, contactType, applicationId)
    } else {
      await APIRequests[contactType].assign(applicationId, contactId)
    }
  } else {
    // At this point un-assign the contact from the application
    const { applicationId } = await request.cache().getData()
    await APIRequests[contactType].unAssign(applicationId)
  }
}

export const contactNamesCompletion = (accountType, uriBase) => async request => {
  const { userId } = await request.cache().getData()
  const { payload: { contact: contactId } } = await request.cache().getPageData()
  if (contactId === 'new') {
    await request.cache().clearPageData(uriBase.NAME.page)
    return uriBase.NAME.uri
  } else {
    const accounts = await APIRequests[accountType].findByUser(userId, DEFAULT_ROLE)
    if (accounts.length) {
      return uriBase.ORGANISATIONS.uri
    } else {
      await request.cache().clearPageData(uriBase.IS_ORGANISATION.page)
      return uriBase.IS_ORGANISATION.uri
    }
  }
}
