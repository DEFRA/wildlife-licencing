import { AccountRoles, checkAccountAndOrContactData, ContactRoles } from '../common/common.js'
import { addressFormPage } from '../common/address-form/address-form-page.js'
import { contactURIs } from '../../../uris.js'
import { getAddressFormData, setAddressFormData } from '../common/address-form/address-form.js'

const { ADDRESS_FORM, CHECK_ANSWERS } = contactURIs.APPLICANT

export const applicantAddressForm = addressFormPage({
  page: ADDRESS_FORM.page,
  uri: ADDRESS_FORM.uri,
  checkData: checkAccountAndOrContactData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  getData: getAddressFormData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  setData: setAddressFormData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  completion: CHECK_ANSWERS.uri
})
