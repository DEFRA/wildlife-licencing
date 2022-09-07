import { APIRequests } from '../../../../services/api-requests.js'
import { setAddress } from '../address/address.js'

export const getAddressFormData = (contactType, accountType) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  return {
    contactName: contact?.fullName,
    accountName: account?.name,
    postCode: !request.query['no-postcode']
  }
}

export const setAddressFormData = (contactType, accountType) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const pageData = await request.cache().getPageData()
  const inputAddress = pageData.payload
  const apiAddress = mapInputAddress(inputAddress)
  await setAddress(accountType, applicationId, apiAddress, contactType, journeyData)
}

const mapInputAddress = inputAddress => Object.assign({ },
  {
    ...(!!inputAddress['address-line-1'] && { addressLine1: inputAddress['address-line-1'] }),
    ...(!!inputAddress['address-line-2'] && { addressLine2: inputAddress['address-line-2'] }),
    ...(!!inputAddress['address-town'] && { town: inputAddress['address-town'] }),
    ...(!!inputAddress['address-county'] && { county: inputAddress['address-county'] }),
    ...(!!inputAddress['address-postcode'] && { postcode: inputAddress['address-postcode'] })
  })
