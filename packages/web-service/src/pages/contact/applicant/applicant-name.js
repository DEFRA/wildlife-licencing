import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { contactNameCompletion, getContactData, setContactData, checkContactData } from '../common/contact-name/contact-name.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'

const { NAME } = contactURIs.APPLICANT

export const applicantName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkContactData(ApiRequestEntities.APPLICANT, contactURIs.APPLICANT),
  getData: getContactData(ApiRequestEntities.APPLICANT),
  setData: setContactData(ApiRequestEntities.APPLICANT),
  completion: contactNameCompletion(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
