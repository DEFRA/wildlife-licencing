import { APIRequests } from '../../../../services/api-requests.js'

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
    /*
     * Submitted contacts and accounts are immutable
     * If the contact has previously had an address and email collected on it then it will be removed as long as it is not immutable.
     * If the contact is immutable then a new contact is created and assigned, it will copy the name from the current contact.
     * If the existing contact is linked to the user then the new contact is also linked to the user and the email address is retained
     * If the existing contact is not linked to the user then the new contact will not retain the email address.
     */
    const currentContact = await APIRequests[contactType].getByApplicationId(applicationId)
    if (currentContact.contactDetails || currentContact.address) {
      if (currentContact.submitted) {
        // Immutable
        if (currentContact.user) {
          const user = await APIRequests.USER.getById(userId)
          await APIRequests[contactType].unAssign(applicationId)
          await APIRequests[contactType].create(applicationId, {
            fullName: currentContact.fullName,
            userId: user.id,
            contactDetails: { email: user.username }
          })
        } else {
          if (currentContact.address) {
            await APIRequests[contactType].unAssign(applicationId)
            await APIRequests[contactType].create(applicationId, {
              fullName: currentContact.fullName
            })
          }
        }
      } else {
        // Not immutable
        if (currentContact.address || currentContact.contactDetails) {
          delete currentContact.address
          if (!currentContact.userId) {
            delete currentContact.contactDetails
          }
          await APIRequests[contactType].update(applicationId, currentContact)
        }
      }
    }
  } else {
    // Un-assign any previous account
    const currentAccount = await APIRequests[accountType].getByApplicationId(applicationId)
    await APIRequests[accountType].unAssign(applicationId)
    /*
     * If removing an existing associated account and
     * the contact is immutable and does not have an address or email then
     * create a new contact with or without the linked user.
     * With the linked user copy the address from the contact and the email from the user.
     * Without the linked user then copy both the address and email from the old contact.
     * If the linked contact is not immutable then copy the address and email
     * from the account onto the current contact
     */
    if (currentAccount) {
      const currentContact = await APIRequests[contactType].getByApplicationId(applicationId)
      if (currentContact.submitted) {
        // Immutable
        if (!currentContact.contactDetails || !currentContact.address) {
          // Creates and associate a new contact
          if (currentContact.user) {
            // Linked to user
            const user = await APIRequests.USER.getById(userId)
            await APIRequests[contactType].unAssign(applicationId)
            await APIRequests[contactType].create(applicationId, {
              userId: user.id,
              contactDetails: currentAccount.contactDetails,
              address: currentAccount.address
            })
          } else {
            // Not linked to user
            await APIRequests[contactType].unAssign(applicationId)
            await APIRequests[contactType].create(applicationId, {
              contactDetails: currentAccount.contactDetails,
              address: currentAccount.address
            })
          }
        }
      } else {
        // Not immutable
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
    // Immutable
    if (contact.submitted) {
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
