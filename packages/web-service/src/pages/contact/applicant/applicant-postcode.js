import { contactURIs } from '../../../uris.js'
import { postcodePage } from '../common/postcode/postcode-page.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'
import { getPostcodeData, postcodeCompletion, setPostcodeData, postCodeCheckData } from '../common/postcode/postcode.js'

const { POSTCODE } = contactURIs.APPLICANT

export const applicantPostcode = postcodePage({
  page: POSTCODE.page,
  uri: POSTCODE.uri,
  checkData: postCodeCheckData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  getData: getPostcodeData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  setData: setPostcodeData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION),
  completion: postcodeCompletion(contactURIs.APPLICANT)
})
