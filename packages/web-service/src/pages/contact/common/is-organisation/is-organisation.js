import { APIRequests } from '../../../../services/api-requests.js'
import { contactAccountOperations } from '../common.js'
import { CONTACT_COMPLETE } from '../check-answers/check-answers.js'

export const getContactAccountData = (contactType, accountType) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  return { contact, account }
}

export const setContactAccountData = (contactType, accountType) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, userId } = journeyData

  if (request.payload['is-organisation'] === 'yes') {
    // Assign a new organisation
    const contactAccountOps = await contactAccountOperations(contactType, accountType, applicationId, userId)
    await contactAccountOps.setOrganisation(true, request.payload['organisation-name'])
    await APIRequests.APPLICATION.tags(applicationId).remove(CONTACT_COMPLETE[contactType])
    const pageData = await request.cache().getPageData()
    delete pageData.payload['organisation-name']
    await request.cache().setPageData(pageData)
  } else {
    // Remove assigned organisation
    const contactAccountOps = await contactAccountOperations(contactType, accountType, applicationId, userId)
    await contactAccountOps.setOrganisation(false)
  }
}

export const contactAccountCompletion = (contactType, accountType, urlBase) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const pageData = await request.cache().getPageData()

  if (pageData.payload['is-organisation'] === 'yes') {
    // New organisation - collect details
    const account = await APIRequests[accountType].getByApplicationId(applicationId)
    // Immutable
    if (await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)) {
      return urlBase.CHECK_ANSWERS.uri
    } else {
      if (!account.contactDetails) {
        await request.cache().clearPageData(urlBase.EMAIL.page)
        return urlBase.EMAIL.uri
      } else if (!account.address) {
        await request.cache().clearPageData(urlBase.POSTCODE.page)
        return urlBase.POSTCODE.uri
      } else {
        return urlBase.CHECK_ANSWERS.uri
      }
    }
  } else {
    // No organisation
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    if (!contact.contactDetails) {
      await request.cache().clearPageData(urlBase.EMAIL.page)
      return urlBase.EMAIL.uri
    } else if (!contact.address) {
      await request.cache().clearPageData(urlBase.POSTCODE.page)
      return urlBase.POSTCODE.uri
    } else {
      return urlBase.CHECK_ANSWERS.uri
    }
  }
}
