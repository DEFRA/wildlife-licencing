import { contactURIs } from '../../../uris.js'
import { getEmailAddressData, setEmailAddressData }
  from '../common/email-address/email-address.js'
import { emailAddressPage } from '../common/email-address/email-address-page.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkApplication } from '../../common/check-application.js'
import { APIRequests } from '../../../services/api-requests.js'

const { EMAIL } = contactURIs.APPLICANT

export const completion = (contactRole, accountRole, urlBase) => async request => {
  const { applicationId } = await request.cache().getData()
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  if (account) {
    if (account.contactDetails?.phoneNumber) {
      return urlBase.CHECK_ANSWERS.uri
    } else {
      return urlBase.PHONE_NUMBER.uri
    }
  } else {
    const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
    if (contact.contactDetails?.phoneNumber) {
      return urlBase.CHECK_ANSWERS.uri
    } else {
      return urlBase.PHONE_NUMBER.uri
    }
  }
}

export const licenceHolderEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  checkData: checkApplication,
  getData: getEmailAddressData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  setData: setEmailAddressData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  completion: completion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
}, ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION)
