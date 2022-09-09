import { APIRequests } from '../../../../services/api-requests.js'
import { accountOperations, checkData, contactAccountOperations } from '../common.js'

export const checkContactAccountData = (contactType, urlBase) => async (request, h) => {
  const ck = await checkData(request, h)
  if (ck) {
    return ck
  }
  const { applicationId } = await request.cache().getData()
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  if (!contact) {
    return h.redirect(urlBase.NAME.uri)
  }

  return null
}

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
  const accountOps = await accountOperations(accountType, applicationId)
  const contactAccountOps = await contactAccountOperations(contactType, accountType, applicationId, userId)
  if (request.payload['is-organisation'] === 'yes') {
    await accountOps.create(request.payload['organisation-name'])
  } else {
    await contactAccountOps.setOrganisation(false)
  }
  // Clear the name on the page here
  // const pageData = await request.cache().getPageData()
  // if (pageData) {
  //  delete pageData.payload['organisation-name']
  //  await request.cache().setPageData(pageData)
  // }
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
