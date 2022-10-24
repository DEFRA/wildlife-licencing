import { contactURIs, TASKLIST } from '../../../uris.js'
import { getCheckAnswersData } from '../common/check-answers/check-answers.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { checkHasApplication } from '../common/common.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
const { CHECK_ANSWERS } = contactURIs.INVOICE_PAYER

export const invoiceCheckAnswers = checkAnswersPage({
  checkData: checkHasApplication,
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri,
  getData: getCheckAnswersData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION),
  completion: TASKLIST.uri
})
