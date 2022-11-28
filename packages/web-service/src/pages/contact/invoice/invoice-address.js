
import { addressPage } from '../common/address/address-page.js'
import { contactURIs } from '../../../uris.js'
import { getAddressData, setAddressData } from '../common/address/address.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasAddress, checkHasApplication, checkHasContact } from '../common/common-handler.js'

const { ADDRESS, CHECK_ANSWERS } = contactURIs.INVOICE_PAYER

export const invoiceAddress = addressPage({
  page: ADDRESS.page,
  uri: ADDRESS.uri,
  checkData: [checkHasApplication, checkHasContact(ContactRoles.PAYER), checkHasAddress(contactURIs.INVOICE_PAYER)],
  getData: getAddressData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER),
  setData: setAddressData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER),
  completion: CHECK_ANSWERS.uri
})
