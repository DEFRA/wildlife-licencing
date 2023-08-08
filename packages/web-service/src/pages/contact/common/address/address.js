import { APIRequests } from '../../../../services/api-requests.js'
import { contactAccountOperations } from '../operations.js'
import addressSchema from './address-schema.js'

export const mapLookedUpAddress = (data) => {
  return data.map((item) => {
    const results = {}
    const isV1 = !!item && !!item.Address
    const source = item.Address ? item.Address : item
    const keys = Object.keys(addressSchema)

    keys.forEach((key) => {
      const mappedKey = isV1 ? addressSchema[key].v1 : addressSchema[key].v2

      if (source[mappedKey]) {
        results[key] = source[mappedKey]
      }
    })

    return results
  })
}

export const getAddressData = (contactRole, accountRole, uriBase) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)

  const addressLookup = mapLookedUpAddress(journeyData?.addressLookup)

  return {
    contactName: contact?.fullName,
    accountName: account?.name,
    postcode: account?.address?.postcode || contact?.address?.postcode,
    uri: { addressForm: uriBase.ADDRESS_FORM.uri, postcode: uriBase.POSTCODE.uri },
    addressLookup: addressLookup
  }
}

export const setAddressData = (contactRole, accountRole) => async request => {
  const { userId, applicationId, addressLookup } = await request.cache().getData()
  const pageData = await request.cache().getPageData()

  // Get the full address from the journey cache (Number IS large enough: 9007199254740991)
  const dataAddress = mapLookedUpAddress(addressLookup)
  const apiAddress = dataAddress.find(a => Number.parseInt(a.uprn) === pageData.payload.uprn)

  const contactAccountOps = contactAccountOperations(contactRole, accountRole, applicationId, userId)
  await contactAccountOps.setAddress(apiAddress)
}
