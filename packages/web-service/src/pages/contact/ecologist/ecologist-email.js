import { contactURIs } from '../../../uris.js'
import { getEmailAddressData, setEmailAddressData, emailAddressCompletion }
  from '../common/email-address/email-address.js'
import { emailAddressPage } from '../common/email-address/email-address-page.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasApplication, checkHasContact } from '../common/common-handler.js'

const { EMAIL, USER } = contactURIs.ECOLOGIST

export const ecologistEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  checkData: [checkHasApplication, checkHasContact(ContactRoles.ECOLOGIST, USER)],
  completion: emailAddressCompletion(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST),
  getData: getEmailAddressData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION),
  setData: setEmailAddressData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION)
}, ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION)
