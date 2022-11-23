import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { contactNameCompletion, getContactData, setContactData } from '../common/contact-name/contact-name.js'
import { checkHasApplication } from '../common/common.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

const { NAME } = contactURIs.APPLICANT

export const applicantName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkHasApplication,
  getData: getContactData(ContactRoles.APPLICANT),
  setData: setContactData(ContactRoles.APPLICANT),
  completion: contactNameCompletion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
}, [ContactRoles.APPLICANT, ContactRoles.ADDITIONAL_APPLICANT])
