import { APIRequests } from '../../../../services/api-requests.js'
import { contactAccountOperations } from '../common.js'

export const getAddressData = (contactRole, accountRole, uriBase) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  return {
    contactName: contact?.fullName,
    accountName: account?.name,
    postcode: account?.address?.postcode || contact?.address?.postcode,
    uri: { addressForm: uriBase.ADDRESS_FORM.uri, postcode: uriBase.POSTCODE.uri },
    addressLookup: journeyData?.addressLookup
  }
}

export const setAddressData = (contactRole, accountRole) => async request => {
  const { userId, applicationId, addressLookup } = await request.cache().getData()
  const pageData = await request.cache().getPageData()
  // Get the full address from the journey cache (Number IS large enough: 9007199254740991)
  const { Address: lookupAddress } = addressLookup.find(a => Number.parseInt(a.Address.UPRN) === pageData.payload.uprn)
  const apiAddress = mapLookedUpAddress(lookupAddress)
  const contactAccountOps = await contactAccountOperations(contactRole, accountRole, applicationId, userId)
  await contactAccountOps.setAddress(apiAddress)
}

const ifPresent = (lookupAddress, apiKey, luKey) => (!!lookupAddress[luKey] && { [apiKey]: lookupAddress[luKey] })

export const mapLookedUpAddress = lookupAddress => Object.assign({ }, {
  ...ifPresent(lookupAddress, 'subBuildingName', 'SubBuildingName'),
  ...ifPresent(lookupAddress, 'buildingName', 'BuildingName'),
  ...ifPresent(lookupAddress, 'buildingNumber', 'BuildingNumber'),
  ...ifPresent(lookupAddress, 'street', 'Street'),
  ...ifPresent(lookupAddress, 'locality', 'Locality'),
  ...ifPresent(lookupAddress, 'dependentLocality', 'DependentLocality'),
  ...ifPresent(lookupAddress, 'town', 'Town'),
  ...ifPresent(lookupAddress, 'county', 'County'),
  ...ifPresent(lookupAddress, 'postcode', 'Postcode'),
  ...ifPresent(lookupAddress, 'country', 'Country'),
  ...ifPresent(lookupAddress, 'xCoordinate', 'XCoordinate'),
  ...ifPresent(lookupAddress, 'yCoordinate', 'YCoordinate'),
  ...ifPresent(lookupAddress, 'uprn', 'UPRN')
})
