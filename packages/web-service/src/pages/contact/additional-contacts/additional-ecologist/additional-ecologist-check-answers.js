import { checkApplication } from '../../../common/check-application.js'
import { contactURIs, TASKLIST } from '../../../../uris.js'
import { checkAnswersPage } from '../../../common/check-answers.js'
import { additionalContactGetCheckAnswersData } from '../common.js'
import { ContactRoles } from '../../common/contact-roles.js'
import { setCheckAnswersCompletion } from '../../common/check-answers/check-answers.js'

export const additionalEcologistCheckAnswers = checkAnswersPage({
  checkData: checkApplication,
  page: contactURIs.ADDITIONAL_ECOLOGIST.CHECK_ANSWERS.page,
  uri: contactURIs.ADDITIONAL_ECOLOGIST.CHECK_ANSWERS.uri,
  getData: additionalContactGetCheckAnswersData(ContactRoles.ADDITIONAL_ECOLOGIST),
  setData: setCheckAnswersCompletion(ContactRoles.ADDITIONAL_ECOLOGIST),
  completion: TASKLIST.uri
})
