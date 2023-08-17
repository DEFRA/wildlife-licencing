import { APIRequests } from '../../../services/api-requests.js'
import { ContactRoles } from '../common/contact-roles.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { contactAccountOperations, contactOperations } from '../common/operations.js'
import { contactURIs } from '../../../uris.js'
import { moveTagInProgress } from '../../common/tag-functions.js'
import { boolFromYesNo, yesNoFromBool } from '../../common/common.js'

/*
 * The add additional contact functions
 */
export const getAdditionalContactData = contactRole => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const section = contactRole === ContactRoles.ADDITIONAL_APPLICANT
    ? SECTION_TASKS.ADDITIONAL_APPLICANT
    : SECTION_TASKS.ADDITIONAL_ECOLOGIST
  await moveTagInProgress(applicationId, section)
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
  } else {
    const contactOps = contactOperations(contactRole, applicationId, userId)
    await contactOps.create(false)
  }
}

// TODO - Simplify into a single completion function
const nextUri = async (contactRole, request) => {
  const { additionalContact } = await request.cache().getData()
  if (contactRole === ContactRoles.ADDITIONAL_APPLICANT && typeof additionalContact?.[ContactRoles.ADDITIONAL_ECOLOGIST] === 'undefined') {
    return contactURIs.ADDITIONAL_ECOLOGIST.ADD.uri
  }

  return contactURIs.ADDITIONAL_ECOLOGIST.CHECK_ANSWERS.uri
}

export const additionalContactCompletion = (contactRole, urlBase) => async request => {
  const { applicationId } = await request.cache().getData()
  // If an organisation is already assigned,
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  if (!contact) {
    return urlBase.CHECK_ANSWERS.uri
  } else if (!contact.fullName) {
    return urlBase.NAME.uri
  } else if (!contact?.contactDetails?.email) {
    return urlBase.EMAIL.uri
  } else {
    return urlBase.CHECK_ANSWERS.uri
  }
}

export const additionalContactNameCompletion = (contactRole, urlBase) => async request => {
  const { applicationId } = await request.cache().getData()
  // If an organisation is already assigned,
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  if (!contact?.contactDetails?.email) {
    return urlBase.EMAIL.uri
  } else {
    return urlBase.CHECK_ANSWERS.uri
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

    return urlBase.CHECK_ANSWERS.uri
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
