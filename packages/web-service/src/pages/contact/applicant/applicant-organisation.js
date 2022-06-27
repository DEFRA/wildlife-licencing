import { isOrganization } from '../common/is-organization/is-organization.js'
import { contactURIs } from '../../../uris.js'
import { checkData } from '../common/common.js'
import { getContactAccountData, setContactAccountData } from '../common/account/account.js'
const { IS_ORGANIZATION } = contactURIs.APPLICANT

export const getApplicantOrganizationData = request => getContactAccountData('APPLICANT', 'APPLICANT_ORGANIZATION')(request)
export const setApplicantOrganizationData = request => setContactAccountData('APPLICANT_ORGANIZATION')(request)

export const applicantOrganisation = isOrganization(IS_ORGANIZATION,
  checkData,
  getApplicantOrganizationData,
  IS_ORGANIZATION,
  setApplicantOrganizationData)
