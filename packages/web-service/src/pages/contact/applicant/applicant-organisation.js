import {
  getContactAccountData,
  setContactAccountData,
  contactAccountCompletion, checkContactAccountData
} from '../common/is-organisation/is-organisation.js'
import { contactURIs } from '../../../uris.js'
import { checkData } from '../common/common.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'
import { isOrganisation } from '../common/is-organisation/is-organisation-page.js'

const { IS_ORGANISATION } = contactURIs.APPLICANT

export const applicantOrganisation = isOrganisation({
  page: IS_ORGANISATION.page,
  uri: IS_ORGANISATION.uri,
  checkData: checkContactAccountData(ApiRequestEntities.APPLICANT, contactURIs.APPLICANT),
  getData: getContactAccountData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION),
  setData: setContactAccountData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION),
  completion: contactAccountCompletion(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
