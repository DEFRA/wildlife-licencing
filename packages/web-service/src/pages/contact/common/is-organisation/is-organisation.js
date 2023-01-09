import { APIRequests } from '../../../../services/api-requests.js'
import { contactAccountOperations } from '../operations.js'
import { yesNoFromBool } from '../../../common/common.js'

const getIsOrganization = (contact, account) => {
  if (account) {
    return true
  } else {
    if (contact.address) {
      return false
    } else {
      return null
    }
  }
}

export const getContactAccountData = (contactRole, accountRole) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  return { contact, account, isOrganization: yesNoFromBool(getIsOrganization(contact, account)) }
}

export const setContactAccountData = (contactRole, accountRole) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, userId } = journeyData

  if (request.payload['is-organisation'] === 'yes') {
    // Assign a new organisation
    const contactAccountOps = contactAccountOperations(contactRole, accountRole, applicationId, userId)
    await contactAccountOps.setOrganisation(true, request.payload['organisation-name'])
    const pageData = await request.cache().getPageData()
    delete pageData.payload['organisation-name']
    await request.cache().setPageData(pageData)
  } else {
    // Remove assigned organisation
    const contactAccountOps = contactAccountOperations(contactRole, accountRole, applicationId, userId)
    await contactAccountOps.setOrganisation(false)
  }
}

export const contactAccountCompletion = (contactRole, accountRole, urlBase) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const pageData = await request.cache().getPageData()

  if (pageData.payload['is-organisation'] === 'yes') {
    // New organisation - collect details
    const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
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
  } else {
    // No organisation
    const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
    if (!contact.contactDetails) {
      return urlBase.EMAIL.uri
    } else if (!contact.address) {
      return urlBase.POSTCODE.uri
    } else {
      return urlBase.CHECK_ANSWERS.uri
    }
  }
}
