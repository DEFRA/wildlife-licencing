import { contactURIs } from '../../../uris.js'
import { getEmailAddressData, setEmailAddressData, emailAddressCompletion }
  from '../common/email-address/email-address.js'
import { emailAddressPage } from '../common/email-address/email-address-page.js'
import { checkHasApplication } from '../common/common.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

const { EMAIL } = contactURIs.APPLICANT

export const applicantEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  checkData: checkHasApplication,
  completion: emailAddressCompletion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  getData: getEmailAddressData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  setData: setEmailAddressData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION)
})
