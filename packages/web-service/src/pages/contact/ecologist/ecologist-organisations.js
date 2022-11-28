import { accountNamesPage } from '../common/account-names/account-names-page.js'
import { contactURIs } from '../../../uris.js'
import { getAccountNamesData, setAccountNamesData, accountNamesCompletion, accountNamesCheckData } from '../common/account-names/account-names.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasApplication, checkHasContact } from '../common/common-handler.js'
const { ORGANISATIONS } = contactURIs.ECOLOGIST

export const ecologistOrganisations = accountNamesPage({
  page: ORGANISATIONS.page,
  uri: ORGANISATIONS.uri,
  checkData: [
    checkHasApplication,
    checkHasContact(ContactRoles.ECOLOGIST),
    accountNamesCheckData(AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST)
  ],
  getData: getAccountNamesData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION),
  setData: setAccountNamesData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION),
  completion: accountNamesCompletion(AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST)
})
