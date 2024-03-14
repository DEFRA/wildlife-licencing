import { addressFormPage } from '../common/address-form/address-form-page.js'
import { contactURIs } from '../../../uris.js'
import { getAddressFormData, setAddressFormData } from '../common/address-form/address-form.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'

const { ADDRESS_FORM, CHECK_ANSWERS } = contactURIs.APPLICANT

export const licenceHolderAddressForm = addressFormPage({
  page: ADDRESS_FORM.page,
  uri: ADDRESS_FORM.uri,
  checkData: [checkApplication, checkHasContact(ContactRoles.APPLICANT)],
  getData: getAddressFormData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  setData: setAddressFormData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  completion: CHECK_ANSWERS.uri
})
