import { APIRequests } from '../../../../services/api-requests.js'
import { migrateContact } from '../common.js'
import { APPLICATIONS } from '../../../../uris.js'
import { setAccountExisting } from '../account-names/account-names.js'

export const checkContactAccountData = (contactType, urlBase) => async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  const contact = await APIRequests[contactType].getByApplicationId(journeyData.applicationId)
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
  const pageData = await request.cache().getPageData()
  if (pageData.payload['is-organisation'] === 'yes') {
    // Create an account
    await APIRequests[accountType].create(applicationId, {
      name: pageData.payload['organisation-name']
    })

    // If the current contact is immutable and has an address, the address now needs to be
    // associated with the account. Migrate the contact to a new contact omitting the address details.
    // If an account has already been assigned and is mutable, copy the address to the account
    const currentContact = await APIRequests[contactType].getByApplicationId(applicationId)
    if (currentContact.contactDetails || currentContact.address) {
      await setAccountExisting(userId, applicationId, currentContact, contactType)
      const currentAccount = await APIRequests[accountType].getByApplicationId(applicationId)
      if (currentAccount && !currentAccount.submitted) {
        currentAccount.address = currentContact.address
        if (!currentContact.userId) {
          currentAccount.contactDetails = currentContact.contactDetails
        }
      }
    }
  } else {
    const currentAccount = await APIRequests[accountType].getByApplicationId(applicationId)
    // Remove any existing account
    if (currentAccount) {
      await APIRequests[accountType].unAssign(applicationId)
    }

    const currentContact = await APIRequests[contactType].getByApplicationId(applicationId)
    // if the current contact is immutable and does not have an address or contact details then
    // it is necessary to create and assign a new contact which can have those details added.
    // If there was an account then migrate the address and contact details from the account
    if (await APIRequests.CONTACT.isImmutable(applicationId, currentContact.id)) {
      if (!currentContact.contactDetails || !currentContact.address) {
        if (currentAccount) {
          await migrateContact(userId, applicationId, contactType, {
            contactDetails: currentAccount.contactDetails,
            address: currentAccount.address
          })
        } else {
          await migrateContact(userId, applicationId, currentContact, contactType)
        }
      }
    } else {
      // If the contact is not immutable then does not have an address or contact details
      // then copy from the removed account if it existed
      if (currentAccount && (!currentContact.contactDetails || !currentContact.address)) {
        currentContact.contactDetails = currentAccount.contactDetails
        currentContact.address = currentAccount.address
        await APIRequests[contactType].update(applicationId, currentContact)
      }
    }

    // Clear the name on the page here
    const pageData = await request.cache().getPageData()
    if (pageData) {
      delete pageData.payload['organisation-name']
      await request.cache().setPageData(pageData)
    }
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
    if (account.submitted) {
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
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    if (await APIRequests.CONTACT.isImmutable(applicationId, contact.id)) {
      return urlBase.CHECK_ANSWERS.uri
    } else {
      if (!contact.contactDetails) {
        return urlBase.EMAIL.uri
      } else if (!contact.address) {
        return urlBase.POSTCODE.uri
      } else {
        return urlBase.CHECK_ANSWERS.uri
      }
    }
  }
}
