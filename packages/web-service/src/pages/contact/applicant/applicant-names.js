import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import {
  getContactNamesData,
  setContactNamesData,
  contactNamesCompletion
} from '../common/contact-names/contact-names.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasNames } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'

export const applicantNames = contactNamesPage({
  page: contactURIs.APPLICANT.NAMES.page,
  uri: contactURIs.APPLICANT.NAMES.uri,
  checkData: [checkApplication, checkHasNames(ContactRoles.APPLICANT, [ContactRoles.ADDITIONAL_APPLICANT], contactURIs.APPLICANT)],
  getData: getContactNamesData(ContactRoles.APPLICANT, [ContactRoles.ADDITIONAL_APPLICANT]),
  setData: setContactNamesData(ContactRoles.APPLICANT),
  completion: contactNamesCompletion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
