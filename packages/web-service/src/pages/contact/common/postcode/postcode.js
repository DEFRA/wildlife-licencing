import db from 'debug'
import { APIRequests } from '../../../../services/api-requests.js'
import { ADDRESS } from '@defra/wls-connectors-lib'
import path from 'path'
import Config from '@defra/wls-connectors-lib/src/config.js'
import fs from 'fs'
const debug = db('web-service:address-lookup')

export const getPostcodeData = (contactRole, accountRole, uriBase) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  return {
    contactName: contact?.fullName,
    accountName: account?.name,
    postcode: account?.address?.postcode || contact?.address?.postcode,
    uri: { addressForm: `${uriBase.ADDRESS_FORM.uri}?no-postcode=true` }
  }
}

export const addressLookupForPostcode = async (postcode, journeyData, request) => {
  try {
    debug(`Address lookup for postcode: ${postcode}`)
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
    // Log the address lookup certificate file directory
    const addressCertDir = path.dirname(Config.address.certificatePath)
    debug(`Address lookup certificate location: ${addressCertDir}...`)
    debug(`${fs.readdirSync(addressCertDir).forEach(f => console.log(f))}`)

    // Remove previous
    delete journeyData.addressLookup
  } finally {
    await request.cache().setData(journeyData)
  }
}

export const setPostcodeData = contactRole => async request => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()
  const postcode = pageData.payload.postcode
  await addressLookupForPostcode(postcode, journeyData, request)
}

export const postcodeCompletion = uriBase => async request => {
  const journeyData = await request.cache().getData()
  return journeyData.addressLookup ? uriBase.ADDRESS.uri : uriBase.ADDRESS_FORM.uri
}
