import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import {
  checkContactNamesData,
  getContactNamesData,
  setContactNamesData,
  contactNamesCompletion
} from '../common/contact-names/contact-names.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'

export const checkApplicantNamesData = checkContactNamesData(ApiRequestEntities.APPLICANT, contactURIs.APPLICANT)
export const getApplicantNamesData = getContactNamesData(ApiRequestEntities.APPLICANT)
export const setApplicantNamesData = setContactNamesData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION)
export const applicantNamesCompletion = contactNamesCompletion(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT)

export const applicantNames = contactNamesPage({
  page: contactURIs.APPLICANT.NAMES.page,
  uri: contactURIs.APPLICANT.NAMES.uri,
  checkData: checkApplicantNamesData,
  getData: getApplicantNamesData,
  completion: applicantNamesCompletion,
  setData: setApplicantNamesData
})
