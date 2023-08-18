import { checkApplication } from '../../../common/check-application.js'
import { contactURIs, TASKLIST } from '../../../../uris.js'
import { checkAnswersPage } from '../../../common/check-answers.js'
import { additionalContactGetCheckAnswersData, additionalContactSetCheckAnswersData } from '../common.js'
import { ContactRoles } from '../../common/contact-roles.js'

export const additionalEcologistCheckAnswers = checkAnswersPage({
  checkData: checkApplication,
  page: contactURIs.ADDITIONAL_ECOLOGIST.CHECK_ANSWERS.page,
  uri: contactURIs.ADDITIONAL_ECOLOGIST.CHECK_ANSWERS.uri,
  getData: additionalContactGetCheckAnswersData(ContactRoles.ADDITIONAL_ECOLOGIST),
  setData: additionalContactSetCheckAnswersData(ContactRoles.ADDITIONAL_ECOLOGIST),
  completion: TASKLIST.uri
})
