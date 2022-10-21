import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { siteURIs } from '../../../uris.js'
import { mapLookedUpAddress } from '../../contact/common/address/address.js'

export const getData = async request => {
  const journeyData = (await request.cache().getData())
  return {
    postcode: journeyData?.siteData?.postcode,
    uri: { addressForm: siteURIs.ADDRESS_NO_LOOKUP.uri, postcode: siteURIs.SITE_GOT_POSTCODE.uri },
    addressLookup: journeyData.addressLookup
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { siteData, addressLookup } = journeyData

  const { Address: lookupAddress } = addressLookup.find(a => Number.parseInt(a.Address.UPRN) === request.payload.uprn)

  const apiAddress = mapLookedUpAddress(lookupAddress)
  await APIRequests.SITE.update(siteData.id, { name: siteData.name, address: apiAddress })
  delete journeyData.addressLookup
  await request.cache().setData(journeyData)
}

export const completion = async () => siteURIs.UPLOAD_MAP.uri

export default pageRoute({
  page: siteURIs.SELECT_ADDRESS.page,
  uri: siteURIs.SELECT_ADDRESS.uri,
  validator: Joi.object({
    uprn: Joi.number()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
