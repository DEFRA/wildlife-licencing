import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { checkData } from '../common/common.js'
import { getContactData, setContactData } from '../common/contact-name/contact-name.js'

const { NAME, IS_ORGANISATION } = contactURIs.APPLICANT

export const getApplicantData = request => getContactData('APPLICANT')(request)
export const setApplicantData = request => setContactData('APPLICANT')(request)

export const applicantName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData,
  getData: getApplicantData,
  completion: IS_ORGANISATION.uri,
  setData: setApplicantData
})
