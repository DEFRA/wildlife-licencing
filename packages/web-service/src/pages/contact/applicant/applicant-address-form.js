
import { addressFormPage } from '../common/address-form/address-form-page.js'
import { contactURIs } from '../../../uris.js'
import { getAddressFormData, setAddressFormData } from '../common/address-form/address-form.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasApplication, checkHasContact } from '../common/common-handler.js'

const { ADDRESS_FORM, CHECK_ANSWERS, USER } = contactURIs.APPLICANT

export const applicantAddressForm = addressFormPage({
  page: ADDRESS_FORM.page,
  uri: ADDRESS_FORM.uri,
  checkData: [checkHasApplication, checkHasContact(ContactRoles.APPLICANT, USER)],
  getData: getAddressFormData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  setData: setAddressFormData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  completion: CHECK_ANSWERS.uri
})
