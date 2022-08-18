import { APIRequests } from '../../../../services/api-requests.js'

export const getAddressFormData = (contactType, contactOrganisation) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[contactOrganisation].getByApplicationId(applicationId)
  return {
    contactName: contact?.fullName,
    accountName: account?.name
  }
}

export const setAddressFormData = (contactType, contactOrganisation) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const pageData = await request.cache().getPageData()
  const inputAddress = pageData.payload
  const apiAddress = mapInputAddress(inputAddress)
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

const mapInputAddress = inputAddress => Object.assign({ },
  {
    ...(!!inputAddress['address-line-1'] && { addressLine1: inputAddress['address-line-1'] }),
    ...(!!inputAddress['address-line-2'] && { addressLine2: inputAddress['address-line-2'] }),
    ...(!!inputAddress['address-town'] && { town: inputAddress['address-town'] }),
    ...(!!inputAddress['address-county'] && { county: inputAddress['address-county'] })
  })
