import { contactURIs } from '../../../uris.js'
import { getPhoneNumberData, setPhoneNumberData, phoneNumberCompletion } from '../common/phone-number/phone-number.js'
import { phoneNumberPage } from '../common/phone-number/phone-number-page.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkApplication } from '../../common/check-application.js'

const { PHONE_NUMBER } = contactURIs.APPLICANT

export const licenceHolderPhoneNumber = phoneNumberPage({
  page: PHONE_NUMBER.page,
  uri: PHONE_NUMBER.uri,
  checkData: checkApplication,
  getData: getPhoneNumberData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  setData: setPhoneNumberData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  completion: phoneNumberCompletion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
}, ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION)
