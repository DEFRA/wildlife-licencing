import { APIRequests } from '../../../../services/api-requests.js'
import { contactAccountOperations } from '../operations.js'
import { tagStatus } from '../../../../services/status-tags.js'
import { boolFromYesNo } from '../../../common/common.js'

export const getIsOrganization = async (applicationId, accountRole, account) => {
  if (account) {
    return 'yes'
  } else {
    const isOrgStatus = await APIRequests.APPLICATION.tags(applicationId).get(accountRole)
    if (isOrgStatus === tagStatus.COMPLETE) {
      return 'no'
    } else {
      // Don't know
      return null
    }
  }
}

export const getContactAccountData = (contactRole, accountRole) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  return { contact, account, isOrganization: await getIsOrganization(applicationId, accountRole, account) }
}

export const setContactAccountData = (contactRole, accountRole) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, userId } = journeyData

  // Set tag to indicate that the organisation question has been answered, once at least
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: accountRole, tagState: tagStatus.COMPLETE })

  if (boolFromYesNo(request.payload['is-organisation'])) {
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

  if (boolFromYesNo(pageData.payload['is-organisation'])) {
    // New organisation - collect details
    const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
    // Immutable
    if (await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)) {
      return urlBase.CHECK_ANSWERS.uri
    } else {
      if (!account.address) {
        return urlBase.POSTCODE.uri
      }

      if (!account.contactDetails) {
        return urlBase.EMAIL.uri
      }
      return urlBase.CHECK_ANSWERS.uri
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
