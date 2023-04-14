
import { addressFormPage } from '../common/address-form/address-form-page.js'
import { contactURIs } from '../../../uris.js'
import { getAddressFormData, setAddressFormData } from '../common/address-form/address-form.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'
import { APIRequests } from '../../../services/api-requests.js'

const { ADDRESS_FORM, CHECK_ANSWERS, RESPONSIBLE, PURCHASE_ORDER } = contactURIs.INVOICE_PAYER

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)
  if (!applicationData.referenceOrPurchaseOrderNumber) {
    return PURCHASE_ORDER.uri
  } else {
    return CHECK_ANSWERS.uri
  }
}

export const invoiceAddressForm = addressFormPage({
  page: ADDRESS_FORM.page,
  uri: ADDRESS_FORM.uri,
  checkData: [checkApplication, checkHasContact(ContactRoles.PAYER, RESPONSIBLE)],
  getData: getAddressFormData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION),
  setData: setAddressFormData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER),
  completion
})
