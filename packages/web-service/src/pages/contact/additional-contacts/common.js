import { APIRequests } from '../../../services/api-requests.js'
import { contactAccountOperations, contactOperations } from '../common/operations.js'
import { moveTagInProgress } from '../../common/tag-functions.js'
import { boolFromYesNo, yesNoFromBool } from '../../common/common.js'
import { tagStatus } from '../../../services/status-tags.js'
import { ROLE_SECTION_MAP } from '../common/common-handler.js'

/*
 * The add additional contact functions
 */
export const getAdditionalContactData = contactRole => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const section = ROLE_SECTION_MAP[contactRole]
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

export const additionalContactCompletion = (contactRole, urlBase) => async request => {
  const { applicationId } = await request.cache().getData()
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

export const additionalContactGetCheckAnswersData = contactRole => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: ROLE_SECTION_MAP[contactRole], tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  const additionalContact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  return {
    contact: additionalContact
      ? [
          { key: 'addAdditionalContact', value: yesNoFromBool(true) },
          { key: 'contactName', value: additionalContact.fullName },
          { key: 'contactEmail', value: additionalContact.contactDetails.email }
        ].filter(a => a)
      : [
          { key: 'addAdditionalContact', value: yesNoFromBool(false) }
        ]
  }
}
