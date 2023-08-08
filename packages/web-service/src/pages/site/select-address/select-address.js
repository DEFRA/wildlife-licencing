import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { siteURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { mapLookedUpAddress } from '../../contact/common/address/address.js'
import { siteAddressCompletion, getSite } from '../common/site-map-upload.js'

export const getData = async request => {
  const journeyData = await request.cache().getData()
  return {
    postcode: journeyData?.siteData?.postcode,
    uri: { addressForm: siteURIs.ADDRESS_NO_LOOKUP.uri, postcode: siteURIs.SITE_GOT_POSTCODE.uri },
    addressLookup: journeyData.addressLookup
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { siteData, addressLookup, applicationId } = journeyData

  const dataAddress = mapLookedUpAddress(addressLookup)
  const apiAddress = dataAddress.find(a => Number.parseInt(a.uprn) === request.payload.uprn)

  const siteInfo = await getSite(applicationId)
  const payload = { ...siteInfo, address: apiAddress }
  await APIRequests.SITE.update(siteInfo.id, payload)
  journeyData.siteData = { ...siteData, address: apiAddress }
  await request.cache().setData(journeyData)
}

export const completion = request => siteAddressCompletion(request)

export default pageRoute({
  page: siteURIs.SELECT_ADDRESS.page,
  uri: siteURIs.SELECT_ADDRESS.uri,
  checkData: checkApplication,
  validator: Joi.object({
    uprn: Joi.number()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  getData,
  setData
})
