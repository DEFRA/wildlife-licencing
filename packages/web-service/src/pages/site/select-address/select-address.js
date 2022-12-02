import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { siteURIs } from '../../../uris.js'
import { isCompleteOrConfirmed } from '../../common/tag-functions.js'
import { mapLookedUpAddress } from '../../contact/common/address/address.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

export const getData = async request => {
  const journeyData = await request.cache().getData()
  await request.cache().clearPageData(siteURIs.SELECT_ADDRESS.page)
  return {
    postcode: journeyData?.siteData?.postcode,
    uri: { addressForm: siteURIs.ADDRESS_NO_LOOKUP.uri, postcode: siteURIs.SITE_GOT_POSTCODE.uri },
    addressLookup: journeyData.addressLookup
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { siteData, addressLookup, applicationId } = journeyData

  const { Address: lookupAddress } = addressLookup.find(a => Number.parseInt(a.Address.UPRN) === request.payload.uprn)

  const apiAddress = mapLookedUpAddress(lookupAddress)
  const site = await APIRequests.SITE.findByApplicationId(applicationId)
  let siteInfo = {}
  if (site.length) {
    siteInfo = site[0]
  }
  const payload = { ...siteInfo, address: apiAddress }
  await APIRequests.SITE.update(siteInfo.id, payload)
  journeyData.siteData = { ...siteData, address: apiAddress }
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const { applicationId } = await request.cache().getData()

  const appTagStatus = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.SITES)
  if (isCompleteOrConfirmed(appTagStatus)) {
    return siteURIs.CHECK_SITE_ANSWERS.uri
  }

  return siteURIs.UPLOAD_MAP.uri
}

export default pageRoute({
  page: siteURIs.SELECT_ADDRESS.page,
  uri: siteURIs.SELECT_ADDRESS.uri,
  validator: Joi.object({
    uprn: Joi.number()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  getData,
  setData
})
