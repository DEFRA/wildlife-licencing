import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import {
  getContactNamesData,
  setContactNamesData,
  contactNamesCompletion
} from '../common/contact-names/contact-names.js'
import { checkHasApplication, checkHasNames } from '../common/common.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

export const applicantNames = contactNamesPage({
  page: contactURIs.APPLICANT.NAMES.page,
  uri: contactURIs.APPLICANT.NAMES.uri,
  checkData: [checkHasApplication, checkHasNames(ContactRoles.APPLICANT, [ContactRoles.ADDITIONAL_APPLICANT], contactURIs.APPLICANT)],
  getData: getContactNamesData(ContactRoles.APPLICANT, [ContactRoles.ADDITIONAL_APPLICANT]),
  setData: setContactNamesData(ContactRoles.APPLICANT),
  completion: contactNamesCompletion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
