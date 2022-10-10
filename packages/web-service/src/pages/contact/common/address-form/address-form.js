import { APIRequests } from '../../../../services/api-requests.js'
import { contactAccountOperations } from '../common.js'

export const getAddressFormData = (contactRole, accountRole) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  return {
    contactName: contact?.fullName,
    accountName: account?.name,
    postCode: !request.query['no-postcode']
  }
}

export const setAddressFormData = (contactRole, accountRole) => async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  const pageData = await request.cache().getPageData()
  const inputAddress = pageData.payload
  const apiAddress = mapInputAddress(inputAddress)
  const contactAccountOps = contactAccountOperations(contactRole, accountRole, applicationId, userId)
  await contactAccountOps.setAddress(apiAddress)
}

export const mapInputAddress = inputAddress => Object.assign({ },
  {
    ...(!!inputAddress['address-line-1'] && { addressLine1: inputAddress['address-line-1'] }),
    ...(!!inputAddress['address-line-2'] && { addressLine2: inputAddress['address-line-2'] }),
    ...(!!inputAddress['address-town'] && { town: inputAddress['address-town'] }),
    ...(!!inputAddress['address-county'] && { county: inputAddress['address-county'] }),
    ...(!!inputAddress['address-postcode'] && { postcode: inputAddress['address-postcode'] })
  })
