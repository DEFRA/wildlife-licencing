import { checkHasContact } from '../common/common.js'
import { addressPage } from '../common/address/address-page.js'
import { contactURIs } from '../../../uris.js'
import { getAddressData, setAddressData } from '../common/address/address.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

const { ADDRESS, CHECK_ANSWERS } = contactURIs.ECOLOGIST

export const ecologistAddress = addressPage({
  page: ADDRESS.page,
  uri: ADDRESS.uri,
  checkData: checkHasContact(ContactRoles.APPLICANT, contactURIs.APPLICANT),
  getData: getAddressData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST),
  setData: setAddressData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST),
  completion: CHECK_ANSWERS.uri
})
