import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { checkData, getApplicantData, setApplicantData } from '../common/common.js'
const { NAME, IS_ORGANIZATION } = contactURIs.APPLICANT

export const applicantName = contactNamePage(NAME, checkData, getApplicantData, IS_ORGANIZATION.uri, setApplicantData)
