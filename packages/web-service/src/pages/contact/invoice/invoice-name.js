import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { contactNameCompletion, getContactData, setContactData } from '../common/contact-name/contact-name.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasApplication } from '../common/common-handler.js'

const { NAME } = contactURIs.INVOICE_PAYER

export const invoiceName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkHasApplication,
  getData: getContactData(ContactRoles.PAYER),
  setData: setContactData(ContactRoles.PAYER),
  completion: contactNameCompletion(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER)
}, [ContactRoles.PAYER])
