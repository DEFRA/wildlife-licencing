import { contactURIs } from '../../../uris.js'
import { checkAnswersPage } from '../../common/check-answers.js'

const { CHECK_ANSWERS } = contactURIs.APPLICANT

export const applicantCheckAnswers = checkAnswersPage({
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri
})
