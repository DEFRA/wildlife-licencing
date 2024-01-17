import { addressFormPage } from '../common/address-form/address-form-page.js'
import { contactURIs } from '../../../uris.js'
import { getAddressFormData, setAddressFormData } from '../common/address-form/address-form.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'

const { ADDRESS_FORM, CHECK_ANSWERS } = contactURIs.ECOLOGIST

export const ecologistAddressForm = addressFormPage({
  page: ADDRESS_FORM.page,
  uri: ADDRESS_FORM.uri,
  checkData: [checkApplication, checkHasContact(ContactRoles.ECOLOGIST)],
  getData: getAddressFormData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION),
  setData: setAddressFormData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST),
  completion: CHECK_ANSWERS.uri
})
