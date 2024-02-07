import { APIRequests } from '../../../../services/api-requests.js'
import { contactAccountOperations } from '../operations.js'

export const getPhoneNumberData = (contactRole, accountRole) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  return {
    phoneNumber: account?.contactDetails?.phoneNumber || contact?.contactDetails?.phoneNumber,
    contactName: contact?.fullName,
    accountName: account?.name
  }
}

export const setPhoneNumberData = (contactRole, accountRole) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contactAccountOps = contactAccountOperations(contactRole, accountRole, applicationId, userId)
  await contactAccountOps.setPhoneNumber(request.payload['phone-number'])
}

export const phoneNumberCompletion = (_contactRole, _accountRole, urlBase) => {
  return urlBase.CHECK_ANSWERS.uri
}
