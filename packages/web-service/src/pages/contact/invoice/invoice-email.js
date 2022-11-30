import { contactURIs } from '../../../uris.js'
import { getEmailAddressData, setEmailAddressData, emailAddressCompletion }
  from '../common/email-address/email-address.js'
import { emailAddressPage } from '../common/email-address/email-address-page.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasApplication, checkHasContact } from '../common/common-handler.js'

const { EMAIL, RESPONSIBLE } = contactURIs.INVOICE_PAYER

export const invoiceEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  checkData: [checkHasApplication, checkHasContact(ContactRoles.PAYER, RESPONSIBLE)],
  completion: emailAddressCompletion(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER),
  getData: getEmailAddressData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION),
  setData: setEmailAddressData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION)
}, ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION)
