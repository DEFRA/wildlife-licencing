import { isOrganization } from '../common/is-organization/is-organization.js'
import { contactURIs } from '../../../uris.js'
import { getApplicantOrganizationData, setApplicantOrganizationData, checkData } from '../common/common.js'
const { IS_ORGANIZATION } = contactURIs.APPLICANT

export const applicantCompany = isOrganization(IS_ORGANIZATION,
  checkData,
  getApplicantOrganizationData,
  IS_ORGANIZATION,
  setApplicantOrganizationData)
