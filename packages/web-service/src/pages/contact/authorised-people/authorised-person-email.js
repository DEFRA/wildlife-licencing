import { contactURIs } from '../../../uris.js'
import { emailAddressPage } from '../common/email-address/email-address-page.js'
import { checkAuthorisedPeopleData, getAuthorisedPeopleCompletion, getAuthorisedPeopleData } from './common.js'
import { ContactRoles } from '../common/contact-roles.js'
import { contactAccountOperationsForContactAccount } from '../common/operations.js'
import { checkApplication } from '../../common/check-application.js'

const { EMAIL } = contactURIs.AUTHORISED_PEOPLE

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  if (request.payload['change-email'] === 'yes') {
    const contactAcctOps = contactAccountOperationsForContactAccount(ContactRoles.AUTHORISED_PERSON, null,
      applicationId, userId, journeyData.authorisedPeople.contactId, null)
    await contactAcctOps.setEmailAddress(request.payload['email-address'])
  }
}

export const ofContact = contact => ({
  contactName: contact.fullName,
  email: contact?.contactDetails?.email
})

export const authorisedPersonEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  checkData: [checkApplication, checkAuthorisedPeopleData],
  getData: getAuthorisedPeopleData(ofContact),
  setData: setData,
  completion: getAuthorisedPeopleCompletion
}, null)
