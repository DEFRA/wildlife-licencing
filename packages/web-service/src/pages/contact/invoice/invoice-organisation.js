import {
  getContactAccountData,
  setContactAccountData,
  contactAccountCompletion
} from '../common/is-organisation/is-organisation.js'
import { contactURIs } from '../../../uris.js'
import { checkHasContact } from '../common/common.js'
import { isOrganisation } from '../common/is-organisation/is-organisation-page.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

const { IS_ORGANISATION } = contactURIs.INVOICE_PAYER

export const invoiceOrganisation = isOrganisation({
  page: IS_ORGANISATION.page,
  uri: IS_ORGANISATION.uri,
  checkData: checkHasContact(ContactRoles.PAYER, contactURIs.INVOICE_PAYER),
  getData: getContactAccountData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION),
  setData: setContactAccountData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION),
  completion: contactAccountCompletion(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER)
}, AccountRoles.PAYER_ORGANISATION)
