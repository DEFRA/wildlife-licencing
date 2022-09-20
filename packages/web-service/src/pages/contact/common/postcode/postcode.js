import db from 'debug'
import { APIRequests } from '../../../../services/api-requests.js'
import { ADDRESS } from '@defra/wls-connectors-lib'
import { contactAccountOperations } from '../common.js'
import { CONTACT_COMPLETE } from '../check-answers/check-answers.js'
const debug = db('web-service:address-lookup')

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

export const setPostcodeData = (contactType, accountType) => async request => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()
  const postcode = pageData.payload.postcode
  const { userId, applicationId } = journeyData

  const contactAccountOps = await contactAccountOperations(contactType, accountType, applicationId, userId)
  await contactAccountOps.setAddress({ postcode })
  // Write the address lookup results into the cache
  // There is a lot of discussion online about UK postcode formats and reg-ex validation patterns.
  // See this discussion https://stackoverflow.com/questions/164979/regex-for-matching-uk-postcodes
  // It is the clear however that some postcodes exist which are legitimate patterns, but cause
  // the lookup to throw a bad request, hence the try-catch here. Consider for instance LB1 2CD
  try {
    await APIRequests.APPLICATION.tags(applicationId).remove(CONTACT_COMPLETE[contactType])
    const { results } = await ADDRESS.lookup(postcode)
    if (results.length) {
      Object.assign(journeyData, { addressLookup: results })
    } else {
      // Remove previous
      delete journeyData.addressLookup
    }
  } catch (err) {
    // May not be real error so log on a debug
    debug(`Address lookup error: ${err}`)
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
