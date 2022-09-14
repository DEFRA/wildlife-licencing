import { APIRequests } from '../../../../services/api-requests.js'
import { accountOperations, contactAccountOperations } from '../common.js'
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
    const accountOps = await accountOperations(accountType, applicationId)
    await accountOps.create(request.payload['organisation-name'])
    await APIRequests.APPLICATION.tags(applicationId).remove(CONTACT_COMPLETE[contactType])
    const pageData = await request.cache().getPageData()
    delete pageData.payload['organisation-name']
    await request.cache().setPageData(pageData)
  } else {
    const contactAccountOps = await contactAccountOperations(contactType, accountType, applicationId, userId)
    await contactAccountOps.setOrganisation(false)
  }
}

export const contactAccountCompletion = (contactType, accountType, urlBase) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const pageData = await request.cache().getPageData()

  if (pageData.payload['is-organisation'] === 'yes') {
    /*
     * Where on behalf of an organisation then proceed to the email and address pages
     * and gather account details. Previously entered details remain on the contact as it
     * may be used elsewhere
     */
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
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    if (await APIRequests.CONTACT.isImmutable(applicationId, contact.id)) {
      return urlBase.CHECK_ANSWERS.uri
    } else {
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
}
