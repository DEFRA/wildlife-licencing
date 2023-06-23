import { APIRequests } from '../../../services/api-requests.js'
import { getContactCandidates } from '../common/common.js'
import { ContactRoles } from '../common/contact-roles.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { contactAccountOperations, contactOperations } from '../common/operations.js'
import { contactURIs } from '../../../uris.js'
import { moveTagInProgress } from '../../common/tag-functions.js'
import { boolFromYesNo, yesNoFromBool } from '../../common/common.js'

// a contact cannot be the applicant and the additional applicant etc.
const conflictingRoles = contactRole => contactRole === ContactRoles.ADDITIONAL_APPLICANT
  ? [ContactRoles.APPLICANT]
  : [ContactRoles.ECOLOGIST]

/*
 * The add additional contact functions
 */
export const getAdditionalContactData = contactRole => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  await moveTagInProgress(applicationId, SECTION_TASKS.ADDITIONAL_CONTACTS)
  return {
    yesNo: yesNoFromBool(journeyData?.additionalContact?.[contactRole])
  }
}

export const setAdditionalContactData = contactRole => async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  const additionalContact = journeyData?.additionalContact || {}
  Object.assign(additionalContact, { [contactRole]: boolFromYesNo(request.payload['yes-no']) })
  Object.assign(journeyData, { additionalContact })
  await request.cache().setData(journeyData)
  if (request.payload['yes-no'] === 'no') {
    const contactOps = contactOperations(contactRole, applicationId, userId)
    await contactOps.unAssign()
  }
}

export const addAdditionalContactCompletion = (contactRole, uriBase) => async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  if (boolFromYesNo(pageData.payload['yes-no'])) {
    const { userId, applicationId } = journeyData
    // The conflicting roles are complementary when building the select lists
    const contacts = await getContactCandidates(userId, applicationId, contactRole, conflictingRoles(contactRole))
    if (contacts.length < 1) {
      return uriBase.NAME.uri
    } else {
      return uriBase.NAMES.uri
    }
  } else {
    // If the has additional ecologist answer is set go to the check your answers page
    if (typeof journeyData?.additionalContact?.[ContactRoles.ADDITIONAL_ECOLOGIST] !== 'undefined') {
      return contactURIs.ADDITIONAL_APPLICANT.CHECK_ANSWERS.uri
    } else {
      return contactURIs.ADDITIONAL_ECOLOGIST.ADD.uri
    }
  }
}

const nextUri = async (contactRole, request) => {
  const { additionalContact } = await request.cache().getData()
  if (contactRole === ContactRoles.ADDITIONAL_APPLICANT && typeof additionalContact?.[ContactRoles.ADDITIONAL_ECOLOGIST] === 'undefined') {
    return contactURIs.ADDITIONAL_ECOLOGIST.ADD.uri
  }

  return contactURIs.ADDITIONAL_ECOLOGIST.CHECK_ANSWERS.uri
}

export const additionalContactNameCompletion = (contactRole, urlBase) => async request => {
  const { applicationId } = await request.cache().getData()
  // If an organisation is already assigned,
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  if (!contact?.contactDetails?.email) {
    return urlBase.EMAIL.uri
  } else {
    return nextUri(contactRole, request)
  }
}

export const additionalContactNamesCompletion = (contactRole, urlBase) => async request => {
  const { payload: { contact: contactId } } = await request.cache().getPageData()
  if (contactId === 'new') {
    return urlBase.NAME.uri
  } else {
    const { applicationId } = await request.cache().getData()
    const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
    // This may not have an email if the email is held on the organisation for an existing application
    if (!contact.contactDetails?.email) {
      return urlBase.EMAIL.uri
    }

    return nextUri(contactRole, request)
  }
}

export const getAdditionalContactEmailAddressData = contactRole => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  return {
    email: contact?.contactDetails?.email,
    contactName: contact?.fullName
  }
}

export const setAdditionalContactEmailAddressData = contactRole => async request => {
  if (boolFromYesNo(request.payload['change-email'])) {
    const { userId, applicationId } = await request.cache().getData()
    const contactAccountOps = contactAccountOperations(contactRole, null, applicationId, userId)
    await contactAccountOps.setEmailAddress(request.payload['email-address'])
  }
}

export const additionalContactEmailCompletion = (contactRole, _urlBase) => async request => nextUri(contactRole, request)
