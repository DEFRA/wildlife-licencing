import { contactURIs, TASKLIST } from '../../../uris.js'
import { getCheckAnswersData } from '../common/check-answers/check-answers.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { checkData } from '../common/common.js'
const { CHECK_ANSWERS } = contactURIs.APPLICANT

export const applicantCheckAnswers = checkAnswersPage({
  checkData: checkData,
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri,
  getData: getCheckAnswersData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION),
  completion: TASKLIST.uri
})
