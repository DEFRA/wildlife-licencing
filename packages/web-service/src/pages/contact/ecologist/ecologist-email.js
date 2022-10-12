import { contactURIs } from '../../../uris.js'
import { getEmailAddressData, setEmailAddressData, emailAddressCompletion }
  from '../common/email-address/email-address.js'
import { emailAddressPage } from '../common/email-address/email-address-page.js'
import { checkHasContact } from '../common/common.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

const { EMAIL } = contactURIs.ECOLOGIST

export const ecologistEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  checkData: checkHasContact(ContactRoles.ECOLOGIST, contactURIs.ECOLOGIST),
  completion: emailAddressCompletion(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST),
  getData: getEmailAddressData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION),
  setData: setEmailAddressData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION)
})
