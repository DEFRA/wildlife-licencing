import { accountNamesPage } from '../common/account-names/account-names-page.js'
import { contactURIs } from '../../../uris.js'
import { getAccountNamesData, setAccountNamesData, accountNamesCompletion, accountNamesCheckData } from '../common/account-names/account-names.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasApplication, checkHasContact } from '../common/common.js'
const { ORGANISATIONS } = contactURIs.INVOICE_PAYER

export const invoiceOrganisations = accountNamesPage({
  page: ORGANISATIONS.page,
  uri: ORGANISATIONS.uri,
  checkData: [
    checkHasApplication,
    checkHasContact(ContactRoles.PAYER),
    accountNamesCheckData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER)
  ],
  getData: getAccountNamesData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION),
  setData: setAccountNamesData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION),
  completion: accountNamesCompletion(AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER)
})
