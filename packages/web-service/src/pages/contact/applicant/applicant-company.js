import { isOrganization } from '../common/is-organization/is-organization.js'
import { contactURIs } from '../../../uris.js'
import { checkData } from '../common/common.js'
import { getContactAccountData, setContactAccountData } from '../common/account/account.js'
const { IS_ORGANIZATION } = contactURIs.APPLICANT

export const getApplicantCompanyData = request => getContactAccountData('APPLICANT', 'APPLICANT_ORGANIZATION')(request)
export const setApplicantCompanyData = request => setContactAccountData('APPLICANT_ORGANIZATION')(request)

export const applicantCompany = isOrganization(IS_ORGANIZATION,
  checkData,
  getApplicantCompanyData,
  IS_ORGANIZATION,
  setApplicantCompanyData)
