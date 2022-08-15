import { contactURIs } from '../../../uris.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'
import { emailAddressPage, getData, setData, checkData }
  from '../common/email-address/email-address.js'

const { EMAIL } = contactURIs.APPLICANT

export const applicantEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  completion: EMAIL.uri,
  getData: getData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION),
  setData: setData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION),
  checkData: checkData(ApiRequestEntities.APPLICANT)
})
