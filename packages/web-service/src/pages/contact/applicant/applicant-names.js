import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import { contactNamesCheckData, getContactNamesData, setContactNamesData, contactNamesCompletion } from '../common/contact-names/contact-names.js'

const applicantNamesCheckData = contactNamesCheckData('APPLICANT')
const getApplicantNamesData = getContactNamesData('APPLICANT')
const setApplicantNamesData = setContactNamesData('APPLICANT')
const applicantNamesCompletion = contactNamesCompletion('APPLICANT')

export const applicantNames = contactNamesPage(contactURIs.APPLICANT.NAMES,
  applicantNamesCheckData, getApplicantNamesData, applicantNamesCompletion, setApplicantNamesData)
