import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import {
  getContactNamesData,
  setContactNamesData,
  contactNamesCompletion
} from '../common/contact-names/contact-names.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasApplication, checkHasNames } from '../common/common-handler.js'

const { NAMES } = contactURIs.INVOICE_PAYER

export const invoiceNames = contactNamesPage({
  page: NAMES.page,
  uri: NAMES.uri,
  checkData: [checkHasApplication, checkHasNames(ContactRoles.PAYER, [], contactURIs.INVOICE_PAYER)],
  getData: getContactNamesData(ContactRoles.PAYER),
  setData: setContactNamesData(ContactRoles.PAYER),
  completion: contactNamesCompletion(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER)
})
