import { contactURIs, TASKLIST } from '../../../uris.js'
import {
  getCheckAnswersData,
  setCheckAnswersCompletion
} from '../common/check-answers/check-answers.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkAccountComplete, checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'
const { CHECK_ANSWERS } = contactURIs.ECOLOGIST

export const ecologistCheckAnswers = checkAnswersPage({
  checkData: [
    checkApplication,
    checkHasContact(ContactRoles.ECOLOGIST),
    checkAccountComplete(AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST)
  ],
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri,
  getData: getCheckAnswersData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION),
  setData: setCheckAnswersCompletion(ContactRoles.ECOLOGIST),
  completion: TASKLIST.uri
})
