import { checkHasApplication, checkHasContact } from '../common/common.js'
import { addressFormPage } from '../common/address-form/address-form-page.js'
import { contactURIs } from '../../../uris.js'
import { getAddressFormData, setAddressFormData } from '../common/address-form/address-form.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

const { ADDRESS_FORM, CHECK_ANSWERS } = contactURIs.INVOICE_PAYER

export const invoiceAddressForm = addressFormPage({
  page: ADDRESS_FORM.page,
  uri: ADDRESS_FORM.uri,
  checkData: [checkHasApplication, checkHasContact(ContactRoles.PAYER)],
  getData: getAddressFormData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION),
  setData: setAddressFormData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER),
  completion: CHECK_ANSWERS.uri
})
