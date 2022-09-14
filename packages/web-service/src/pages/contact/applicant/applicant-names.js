import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import {
  getContactNamesData,
  setContactNamesData,
  contactNamesCompletion
} from '../common/contact-names/contact-names.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'
import { checkHasContact } from '../common/common.js'

export const applicantNames = contactNamesPage({
  page: contactURIs.APPLICANT.NAMES.page,
  uri: contactURIs.APPLICANT.NAMES.uri,
  checkData: checkHasContact(ApiRequestEntities.APPLICANT, contactURIs.APPLICANT),
  getData: getContactNamesData(ApiRequestEntities.APPLICANT),
  setData: setContactNamesData(ApiRequestEntities.APPLICANT),
  completion: contactNamesCompletion(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
