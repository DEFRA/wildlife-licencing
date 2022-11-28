import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import {
  getContactNamesData,
  setContactNamesData
} from '../common/contact-names/contact-names.js'
import { ContactRoles } from '../common/contact-roles.js'
import { additionalContactNamesCompletion } from './common.js'
import { checkHasApplication, checkHasNames } from '../common/common-handler.js'

export const additionalApplicantNames = contactNamesPage({
  page: contactURIs.ADDITIONAL_APPLICANT.NAMES.page,
  uri: contactURIs.ADDITIONAL_APPLICANT.NAMES.uri,
  checkData: [checkHasApplication, checkHasNames(ContactRoles.ADDITIONAL_APPLICANT, [ContactRoles.APPLICANT], contactURIs.ADDITIONAL_APPLICANT)],
  getData: getContactNamesData(ContactRoles.ADDITIONAL_APPLICANT, [ContactRoles.APPLICANT]),
  setData: setContactNamesData(ContactRoles.ADDITIONAL_APPLICANT),
  completion: additionalContactNamesCompletion(ContactRoles.ADDITIONAL_APPLICANT, contactURIs.ADDITIONAL_APPLICANT)
})
