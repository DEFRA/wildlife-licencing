import { contactURIs, TASKLIST } from '../../../uris.js'
import { getCheckAnswersData } from '../common/check-answers/check-answers.js'
import { ContactRoles, AccountRoles } from '../../../services/api-requests.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { checkHasApplication } from '../common/common.js'
const { CHECK_ANSWERS } = contactURIs.APPLICANT

export const applicantCheckAnswers = checkAnswersPage({
  checkData: checkHasApplication,
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri,
  getData: getCheckAnswersData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  completion: TASKLIST.uri
})
