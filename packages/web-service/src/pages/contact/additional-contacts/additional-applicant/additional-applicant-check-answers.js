import { checkApplication } from '../../../common/check-application.js'
import { contactURIs, TASKLIST } from '../../../../uris.js'
import { checkAnswersPage } from '../../../common/check-answers.js'
import { additionalContactGetCheckAnswersData } from '../common.js'
import { ContactRoles } from '../../common/contact-roles.js'
import { setCheckAnswersCompletion } from '../../common/check-answers/check-answers.js'

export const additionalApplicantCheckAnswers = checkAnswersPage({
  checkData: checkApplication,
  page: contactURIs.ADDITIONAL_APPLICANT.CHECK_ANSWERS.page,
  uri: contactURIs.ADDITIONAL_APPLICANT.CHECK_ANSWERS.uri,
  getData: additionalContactGetCheckAnswersData(ContactRoles.ADDITIONAL_APPLICANT),
  setData: setCheckAnswersCompletion(ContactRoles.ADDITIONAL_APPLICANT),
  completion: TASKLIST.uri
})
