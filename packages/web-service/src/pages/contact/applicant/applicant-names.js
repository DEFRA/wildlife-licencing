import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import {
  getContactNamesData,
  setContactNamesData,
  contactNamesCompletion
} from '../common/contact-names/contact-names.js'
import { ContactRoles, AccountRoles } from '../../../services/api-requests.js'
import { checkHasContact } from '../common/common.js'

export const applicantNames = contactNamesPage({
  page: contactURIs.APPLICANT.NAMES.page,
  uri: contactURIs.APPLICANT.NAMES.uri,
  checkData: checkHasContact(ContactRoles.APPLICANT, contactURIs.APPLICANT),
  getData: getContactNamesData(ContactRoles.APPLICANT),
  setData: setContactNamesData(ContactRoles.APPLICANT),
  completion: contactNamesCompletion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
