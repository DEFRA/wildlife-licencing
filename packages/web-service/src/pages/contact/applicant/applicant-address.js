import { checkHasApplication } from '../common/common.js'
import { addressPage } from '../common/address/address-page.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'
import { contactURIs } from '../../../uris.js'
import { getAddressData, setAddressData } from '../common/address/address.js'

const { ADDRESS, CHECK_ANSWERS } = contactURIs.APPLICANT

export const applicantAddress = addressPage({
  page: ADDRESS.page,
  uri: ADDRESS.uri,
  checkData: checkHasApplication,
  getData: getAddressData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  setData: setAddressData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  completion: CHECK_ANSWERS.uri
})
