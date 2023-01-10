import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { contactNameCompletion, getContactData, setContactData } from '../common/contact-name/contact-name.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkApplication } from '../../common/check-application.js'

const { NAME } = contactURIs.INVOICE_PAYER

export const invoiceName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkApplication,
  getData: getContactData(ContactRoles.PAYER),
  setData: setContactData(ContactRoles.PAYER),
  completion: contactNameCompletion(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION,
    [AccountRoles.APPLICANT_ORGANISATION, AccountRoles.ECOLOGIST_ORGANISATION], contactURIs.INVOICE_PAYER)
}, ContactRoles.PAYER, [ContactRoles.PAYER])
