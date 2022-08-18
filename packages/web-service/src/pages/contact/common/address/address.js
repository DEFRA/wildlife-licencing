import { APIRequests } from '../../../../services/api-requests.js'

export const getAddressData = (contactType, contactOrganisation, uriBase) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[contactOrganisation].getByApplicationId(applicationId)
  return {
    contactName: contact?.fullName,
    accountName: account?.name,
    postcode: account?.address?.postcode || contact?.address?.postcode,
    uri: { addressForm: uriBase.ADDRESS_FORM.uri, postcode: uriBase.POSTCODE.uri },
    addressLookup: journeyData?.addressLookup
  }
}

export const setAddressData = (contactType, contactOrganisation) => async request => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()
  // Get the full address from the journey cache (Number IS large enough: 9007199254740991)
  const { Address: lookupAddress } = journeyData.addressLookup.find(a => Number.parseInt(a.Address.UPRN) === pageData.payload.uprn)
  const apiAddress = mapLookedUpAddress(lookupAddress)
  const { applicationId } = journeyData
  const account = await APIRequests[contactOrganisation].getByApplicationId(applicationId)
  if (account) {
    Object.assign(account, { address: apiAddress })
    await APIRequests[contactOrganisation].update(applicationId, account)
  } else {
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    Object.assign(contact, { address: apiAddress })
    await APIRequests[contactType].update(applicationId, contact)
  }
}

const mapLookedUpAddress = lookupAddress => Object.assign({ },
  {
    ...(!!lookupAddress.SubBuildingName && { subBuildingName: lookupAddress.SubBuildingName }),
    ...(!!lookupAddress.BuildingName && { buildingName: lookupAddress.BuildingName }),
    ...(!!lookupAddress.BuildingNumber && { buildingNumber: lookupAddress.BuildingNumber }),
    ...(!!lookupAddress.Street && { street: lookupAddress.Street }),
    ...(!!lookupAddress.Town && { town: lookupAddress.Town }),
    ...(!!lookupAddress.County && { county: lookupAddress.County }),
    ...{ postcode: lookupAddress.Postcode },
    ...(!!lookupAddress.Country && { country: lookupAddress.Country }),
    ...(!!lookupAddress.XCoordinate && { xCoordinate: lookupAddress.XCoordinate }),
    ...(!!lookupAddress.YCoordinate && { yCoordinate: lookupAddress.YCoordinate }),
    ...(!!lookupAddress.UPRN && { uprn: lookupAddress.UPRN })
  })
