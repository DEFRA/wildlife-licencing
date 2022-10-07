import { checkAccountAndOrContactData } from '../common/common.js'
import { addressPage } from '../common/address/address-page.js'
import { contactURIs } from '../../../uris.js'
import { getAddressData, setAddressData } from '../common/address/address.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

const { ADDRESS, CHECK_ANSWERS } = contactURIs.APPLICANT

export const applicantAddress = addressPage({
  page: ADDRESS.page,
  uri: ADDRESS.uri,
  checkData: checkAccountAndOrContactData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  getData: getAddressData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  setData: setAddressData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  completion: CHECK_ANSWERS.uri
})
