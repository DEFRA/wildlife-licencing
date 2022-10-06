import { contactURIs } from '../../../uris.js'
import { getEmailAddressData, setEmailAddressData, emailAddressCompletion }
  from '../common/email-address/email-address.js'
import { emailAddressPage } from '../common/email-address/email-address-page.js'
import { AccountRoles, checkHasContact, ContactRoles } from '../common/common.js'

const { EMAIL } = contactURIs.APPLICANT

export const applicantEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  checkData: checkHasContact(ContactRoles.APPLICANT, contactURIs.APPLICANT),
  completion: emailAddressCompletion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  getData: getEmailAddressData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  setData: setEmailAddressData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION)
})
