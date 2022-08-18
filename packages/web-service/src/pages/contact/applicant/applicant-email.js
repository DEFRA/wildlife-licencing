import { contactURIs } from '../../../uris.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'
import { getEmailAddressData, setEmailAddressData, checkEmailAddressData }
  from '../common/email-address/email-address.js'
import { emailAddressPage } from '../common/email-address/email-address-page.js'

const { EMAIL } = contactURIs.APPLICANT

export const applicantEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  completion: EMAIL.uri,
  getData: getEmailAddressData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION),
  setData: setEmailAddressData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION),
  checkData: checkEmailAddressData(ApiRequestEntities.APPLICANT)
})
