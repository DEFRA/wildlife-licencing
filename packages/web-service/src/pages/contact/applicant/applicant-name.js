import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { checkData } from '../common/common.js'
import { contactNameCompletion, getContactData, setContactData } from '../common/contact-name/contact-name.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'

const { NAME } = contactURIs.APPLICANT

export const applicantName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkData,
  getData: getContactData(ApiRequestEntities.APPLICANT),
  setData: setContactData(ApiRequestEntities.APPLICANT, contactURIs.APPLICANT),
  completion: contactNameCompletion(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
