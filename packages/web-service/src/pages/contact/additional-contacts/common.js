import { APIRequests } from '../../../services/api-requests.js'
import { canBeUser, contactsRoute, getExistingContactCandidates } from '../common/common.js'
import { ContactRoles } from '../common/contact-roles.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { contactAccountOperations, contactOperations } from '../common/operations.js'
import { contactURIs } from '../../../uris.js'
import { moveTagInProgress } from '../../common/tag-functions.js'
import { yesNoFromBool } from '../../common/common.js'

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
    yesNo: yesNoFromBool(journeyData?.additionalContact?.[contactRole]),
    isSignedInUserApplicant: !await canBeUser(request, conflictingRoles(contactRole))
  }
}

export const setAdditionalContactData = contactRole => async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  const additionalContact = journeyData?.additionalContact || {}
  Object.assign(additionalContact, { [contactRole]: request.payload['yes-no'] === 'yes' })
  Object.assign(journeyData, { additionalContact })
  await request.cache().setData(journeyData)
  if (request.payload['yes-no'] === 'no') {
    const contactOps = contactOperations(contactRole, applicationId, userId)
    await contactOps.unAssign()
  }
}

export const additionalContactCompletion = (contactRole, uriBase) => async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  if (pageData.payload['yes-no'] === 'yes') {
    if (await canBeUser(request, conflictingRoles(contactRole))) {
      return uriBase.USER.uri
    } else {
      const { userId, applicationId } = journeyData
      // The conflicting roles are complementary when building the select lists
      const contacts = await getExistingContactCandidates(userId, applicationId, contactRole,
        conflictingRoles(contactRole), false)

      if (contacts.length < 1) {
        return uriBase.NAME.uri
      } else {
        return uriBase.NAMES.uri
      }
    }
  } else {
    // If the has additional ecologist answer is set go to the check your answers page
    if (typeof journeyData.additionalContact[ContactRoles.ADDITIONAL_ECOLOGIST] !== 'undefined') {
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

/*
 * The additional contact user functions
 */
export const additionalContactUserCompletion = (contactRole, additionalContactRoles, urlBase) => async request => {
  const pageData = await request.cache().getPageData()
  const { userId, applicationId } = await request.cache().getData()
  if (pageData.payload['yes-no'] === 'yes') {
    const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
    const immutable = await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
    if (immutable) {
      // Contact is immutable, go to end
      return nextUri(contactRole, request)
    } else {
      // Contact may be new, if so gather name
      if (!contact.fullName) {
        return urlBase.NAME.uri
      } else {
        return nextUri(contactRole, request)
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
    return nextUri(contactRole, request)
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
  const { userId, applicationId } = await request.cache().getData()
  const contactAccountOps = contactAccountOperations(contactRole, null, applicationId, userId)
  await contactAccountOps.setEmailAddress(request.payload['email-address'])
}

export const additionalContactEmailCompletion = (contactRole, _urlBase) => async request => nextUri(contactRole, request)
