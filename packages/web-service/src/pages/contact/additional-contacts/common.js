import { APIRequests } from '../../../services/api-requests.js'
import { contactAccountOperations, contactsRoute } from '../common/common.js'
import { ContactRoles } from '../common/contact-roles.js'
import { contactURIs } from '../../../uris.js'
import { isCompleteOrConfirmed } from '../../common/tag-functions.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

const nextUri = contactRole => contactRole === ContactRoles.ADDITIONAL_APPLICANT
  ? contactURIs.ADDITIONAL_ECOLOGIST.ADD.uri
  : contactURIs.ADDITIONAL_APPLICANT.CHECK_ANSWERS.uri

export const additionalContactUserCompletion = (contactRole, additionalContactRoles, urlBase) => async request => {
  const pageData = await request.cache().getPageData()
  const { userId, applicationId } = await request.cache().getData()
  if (pageData.payload['yes-no'] === 'yes') {
    const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
    const immutable = await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
    if (immutable) {
      // Contact is immutable, go to end
      return nextUri(contactRole)
    } else {
      // Contact may be new, if so gather name
      if (!contact.fullName) {
        return urlBase.NAME.uri
      } else {
        return nextUri(contactRole)
      }
    }
  } else {
    return contactsRoute(userId, applicationId, contactRole, additionalContactRoles, urlBase)
  }
}

export const additionalContactNameCompletion = (contactRole, urlBase) => async request => {
  const { applicationId } = await request.cache().getData()
  // If an organisation is already assigned,
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  if (!contact?.contactDetails?.email) {
    return urlBase.EMAIL.uri
  } else {
    return nextUri(contactRole)
  }
}

export const additionalContactNamesCompletion = (contactRole, urlBase) => async request => {
  const { payload: { contact: contactId } } = await request.cache().getPageData()
  if (contactId === 'new') {
    await request.cache().clearPageData(urlBase.NAME.page)
    return urlBase.NAME.uri
  } else {
    const { applicationId } = await request.cache().getData()
    const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
    // This may not have an email if the email is held on the organisation for an existing application
    if (!contact.contactDetails?.email) {
      return urlBase.EMAIL.uri
    }

    return nextUri(contactRole)
  }
}

export const getAdditionalContactEmailAddressData = contactRole => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  return {
    email: contact.contactDetails?.email,
    contactName: contact?.fullName
  }
}

export const setAdditionalContactEmailAddressData = contactRole => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contactAccountOps = contactAccountOperations(contactRole, null, applicationId, userId)
  await contactAccountOps.setEmailAddress(request.payload['email-address'])
}

export const additionalContactEmailCompletion = (contactRole, _urlBase) => async request => {
  const { applicationId } = await request.cache().getData()
  const state = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.ADDITIONAL_CONTACTS)
  if (isCompleteOrConfirmed(state)) {
    return contactURIs.ADDITIONAL_ECOLOGIST.CHECK_ANSWERS.uri
  }

  return nextUri(contactRole)
}
