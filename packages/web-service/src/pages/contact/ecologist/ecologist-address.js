
import { addressPage } from '../common/address/address-page.js'
import { contactURIs } from '../../../uris.js'
import { getAddressData, setAddressData } from '../common/address/address.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasAddress, checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'

const { ADDRESS, CHECK_ANSWERS, USER } = contactURIs.ECOLOGIST

export const ecologistAddress = addressPage({
  page: ADDRESS.page,
  uri: ADDRESS.uri,
  checkData: [checkApplication, checkHasContact(ContactRoles.ECOLOGIST, USER), checkHasAddress(contactURIs.APPLICANT)],
  getData: getAddressData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST),
  setData: setAddressData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST),
  completion: CHECK_ANSWERS.uri
})
