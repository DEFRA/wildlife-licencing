import { contactURIs } from '../../../uris.js'
import { emailAddressPage } from '../common/email-address/email-address-page.js'
import { checkAuthorisedPeopleData, getAuthorisedPeopleCompletion, getAuthorisedPeopleData } from './common.js'
import { ContactRoles } from '../common/contact-roles.js'
import { contactAccountOperationsForContactAccount } from '../common/operations.js'

const { EMAIL } = contactURIs.AUTHORISED_PEOPLE

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  const contactAcctOps = contactAccountOperationsForContactAccount(ContactRoles.AUTHORISED_PERSON, null,
    applicationId, userId, journeyData.authorisedPeople.contactId, null)
  await contactAcctOps.setEmailAddress(request.payload['email-address'])
}

export const authorisedPersonEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  checkData: checkAuthorisedPeopleData,
  getData: getAuthorisedPeopleData(c => ({
    contactName: c.fullName,
    email: c?.contactDetails?.email
  })),
  setData: setData,
  completion: getAuthorisedPeopleCompletion
})
