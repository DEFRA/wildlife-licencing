
import { addressFormPage } from '../common/address-form/address-form-page.js'
import { contactURIs } from '../../../uris.js'
import { getAddressFormData, setAddressFormData } from '../common/address-form/address-form.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'
import { purchaseOrderCompletion } from './common.js'

const { ADDRESS_FORM, RESPONSIBLE } = contactURIs.INVOICE_PAYER

export const invoiceAddressForm = addressFormPage({
  page: ADDRESS_FORM.page,
  uri: ADDRESS_FORM.uri,
  checkData: [checkApplication, checkHasContact(ContactRoles.PAYER, RESPONSIBLE)],
  getData: getAddressFormData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION),
  setData: setAddressFormData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER),
  completion: purchaseOrderCompletion
})
