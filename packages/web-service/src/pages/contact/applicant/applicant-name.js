import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { contactNameCompletion, getContactData, setContactData } from '../common/contact-name/contact-name.js'
import { ContactRoles, AccountRoles } from '../../../services/api-requests.js'
import { checkHasContact } from '../common/common.js'

const { NAME } = contactURIs.APPLICANT

export const applicantName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkHasContact(ContactRoles.APPLICANT, contactURIs.APPLICANT),
  getData: getContactData(ContactRoles.APPLICANT),
  setData: setContactData(ContactRoles.APPLICANT),
  completion: contactNameCompletion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
}, ContactRoles.APPLICANT)
