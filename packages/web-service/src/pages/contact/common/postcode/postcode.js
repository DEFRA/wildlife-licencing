import { APIRequests } from '../../../../services/api-requests.js'
import { ADDRESS } from '@defra/wls-connectors-lib'

export const getPostcodeData = (contactType, contactOrganisation, uriBase) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[contactOrganisation].getByApplicationId(applicationId)
  return {
    contactName: contact?.fullName,
    accountName: account?.name,
    postcode: account?.address?.postcode || contact?.address?.postcode,
    uri: { addressForm: `${uriBase.ADDRESS_FORM.uri}?no-postcode=true` }
  }
}

export const setPostcodeData = (contactType, contactOrganisation) => async request => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()
  const postcode = pageData.payload.postcode
  const { applicationId } = journeyData
  const account = await APIRequests[contactOrganisation].getByApplicationId(applicationId)
  if (account) {
    const address = account.address || {}
    Object.assign(address, { postcode })
    Object.assign(account, { address })
    await APIRequests[contactOrganisation].update(applicationId, account)
  } else {
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    const address = contact.address || {}
    Object.assign(address, { postcode })
    Object.assign(contact, { address })
    await APIRequests[contactType].update(applicationId, contact)
  }
  // Write the address lookup results into the cache
  // There is a lot of discussion online about UK postcode formats and reg-ex validation patterns.
  // See this discussion https://stackoverflow.com/questions/164979/regex-for-matching-uk-postcodes
  // It is the clear however that some postcodes exist which are legitimate patterns, but cause
  // the lookup to throw a bad request, hence the try-catch here. Consider for instance LB1 2CD
  try {
    const { results } = await ADDRESS.lookup(postcode)
    if (results.length) {
      Object.assign(journeyData, { addressLookup: results })
    } else {
      // Remove previous
      delete journeyData.addressLookup
    }
  } catch (err) {
    // Remove previous
    delete journeyData.addressLookup
  } finally {
    await request.cache().setData(journeyData)
  }
}

export const postcodeCompletion = uriBase => async request => {
  const journeyData = await request.cache().getData()
  return journeyData.addressLookup ? uriBase.ADDRESS.uri : uriBase.ADDRESS_FORM.uri
}
