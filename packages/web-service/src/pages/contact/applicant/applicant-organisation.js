import { isOrganisation } from '../common/is-organisation/is-organisation.js'
import { contactURIs } from '../../../uris.js'
import { checkData } from '../common/common.js'
import { getContactAccountData, setContactAccountData } from '../common/account/account.js'
const { IS_ORGANISATION } = contactURIs.APPLICANT

export const getApplicantOrganisationData = request => getContactAccountData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
export const setApplicantOrganisationData = request => setContactAccountData('APPLICANT_ORGANISATION')(request)

export const applicantOrganisation = isOrganisation({
  page: IS_ORGANISATION.page,
  uri: IS_ORGANISATION.uri,
  checkData,
  getApplicantOrganisationData,
  IS_ORGANISATION,
  setApplicantOrganisationData
})
