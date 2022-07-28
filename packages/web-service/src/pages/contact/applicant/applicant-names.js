import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import { contactNamesCheckData, getContactNamesData, setContactNamesData, contactNamesCompletion } from '../common/contact-names/contact-names.js'

export const applicantNamesCheckData = contactNamesCheckData('APPLICANT')
export const getApplicantNamesData = getContactNamesData('APPLICANT')
export const setApplicantNamesData = setContactNamesData('APPLICANT')
export const applicantNamesCompletion = contactNamesCompletion('APPLICANT')

export const applicantNames = contactNamesPage({
  page: contactURIs.APPLICANT.NAMES.page,
  uri: contactURIs.APPLICANT.NAMES.uri,
  checkData: applicantNamesCheckData,
  getData: getApplicantNamesData,
  completion: applicantNamesCompletion,
  setData: setApplicantNamesData
})
