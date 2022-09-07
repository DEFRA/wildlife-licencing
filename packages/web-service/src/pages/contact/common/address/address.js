import { APIRequests } from '../../../../services/api-requests.js'
import { migrateAccount, migrateContact } from '../common.js'

export const getAddressData = (contactType, accountType, uriBase) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  return {
    contactName: contact?.fullName,
    accountName: account?.name,
    postcode: account?.address?.postcode || contact?.address?.postcode,
    uri: { addressForm: uriBase.ADDRESS_FORM.uri, postcode: uriBase.POSTCODE.uri },
    addressLookup: journeyData?.addressLookup
  }
}

export const setAddress = async (accountType, applicationId, apiAddress, contactType, journeyData) => {
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  if (account) {
    const immutable = await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)
    if (immutable) {
      await migrateAccount(applicationId, account, accountType, {
        contactDetails: account.contactDetails,
        address: apiAddress
      })
    } else {
      Object.assign(account, { address: apiAddress })
      await APIRequests[accountType].update(applicationId, account)
    }
  } else {
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    const immutable = await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
    if (immutable) {
      await migrateContact(journeyData.userId, applicationId, contact, contactType, {
        contactDetails: contact.contactDetails,
        address: contact.address
      })
    } else {
      Object.assign(contact, { address: apiAddress })
      await APIRequests[contactType].update(applicationId, contact)
    }
  }
}

export const setAddressData = (contactType, accountType) => async request => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()
  // Get the full address from the journey cache (Number IS large enough: 9007199254740991)
  const { Address: lookupAddress } = journeyData.addressLookup.find(a => Number.parseInt(a.Address.UPRN) === pageData.payload.uprn)
  const apiAddress = mapLookedUpAddress(lookupAddress)
  const { applicationId } = journeyData
  await setAddress(accountType, applicationId, apiAddress, contactType, journeyData)
}

const ifPresent = (lookupAddress, apiKey, luKey) => (!!lookupAddress[luKey] && { [apiKey]: lookupAddress[luKey] })

export const mapLookedUpAddress = lookupAddress => Object.assign({ }, {
  ...ifPresent(lookupAddress, 'subBuildingName', 'SubBuildingName'),
  ...ifPresent(lookupAddress, 'buildingName', 'BuildingName'),
  ...ifPresent(lookupAddress, 'buildingNumber', 'BuildingNumber'),
  ...ifPresent(lookupAddress, 'street', 'Street'),
  ...ifPresent(lookupAddress, 'town', 'Town'),
  ...ifPresent(lookupAddress, 'county', 'County'),
  ...ifPresent(lookupAddress, 'postcode', 'Postcode'),
  ...ifPresent(lookupAddress, 'country', 'Country'),
  ...ifPresent(lookupAddress, 'xCoordinate', 'XCoordinate'),
  ...ifPresent(lookupAddress, 'yCoordinate', 'YCoordinate'),
  ...ifPresent(lookupAddress, 'uprn', 'UPRN')
})
