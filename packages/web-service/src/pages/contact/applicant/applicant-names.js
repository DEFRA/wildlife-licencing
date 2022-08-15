import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import { getContactNamesData, setContactNamesData, contactNamesCompletion } from '../common/contact-names/contact-names.js'
import { checkData } from '../common/common.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'

export const getApplicantNamesData = getContactNamesData(ApiRequestEntities.APPLICANT)
export const setApplicantNamesData = setContactNamesData(ApiRequestEntities.APPLICANT)
export const applicantNamesCompletion = contactNamesCompletion(ApiRequestEntities.APPLICANT,
  ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT)

export const applicantNames = contactNamesPage({
  page: contactURIs.APPLICANT.NAMES.page,
  uri: contactURIs.APPLICANT.NAMES.uri,
  checkData: checkData,
  getData: getApplicantNamesData,
  completion: applicantNamesCompletion,
  setData: setApplicantNamesData
})
