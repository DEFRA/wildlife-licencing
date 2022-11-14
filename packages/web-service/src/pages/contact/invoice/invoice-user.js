import { contactURIs } from '../../../uris.js'
import { getUserData, setUserData, userCompletion } from '../common/user/user.js'
import { checkHasApplication } from '../common/common.js'

import { yesNoPage } from '../../common/yes-no.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
const { USER } = contactURIs.INVOICE_PAYER

export const invoiceUser = yesNoPage({
  page: USER.page,
  uri: USER.uri,
  checkData: checkHasApplication,
  getData: getUserData(ContactRoles.PAYER),
  setData: setUserData(ContactRoles.PAYER),
  completion: userCompletion(ContactRoles.PAYER, [], AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER)
})
