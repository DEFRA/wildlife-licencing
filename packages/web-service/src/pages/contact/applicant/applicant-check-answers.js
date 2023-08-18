import { contactURIs, TASKLIST } from '../../../uris.js'
import {
  getCheckAnswersData,
  setCheckAnswersCompletion
} from '../common/check-answers/check-answers.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkAccountComplete, checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'

const { CHECK_ANSWERS } = contactURIs.APPLICANT

export const applicantCheckAnswers = checkAnswersPage({
  checkData: [
    checkApplication,
    checkHasContact(ContactRoles.APPLICANT),
    checkAccountComplete(AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
  ],
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri,
  getData: getCheckAnswersData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  setData: setCheckAnswersCompletion(ContactRoles.APPLICANT),
  completion: TASKLIST.uri
})
