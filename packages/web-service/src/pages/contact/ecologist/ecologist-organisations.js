import { accountNamesPage } from '../common/account-names/account-names-page.js'
import { contactURIs } from '../../../uris.js'
import { getAccountNamesData, setAccountNamesData, accountNamesCompletion, accountNamesCheckData } from '../common/account-names/account-names.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'
const { ORGANISATIONS, USER } = contactURIs.ECOLOGIST

export const ecologistOrganisations = accountNamesPage({
  page: ORGANISATIONS.page,
  uri: ORGANISATIONS.uri,
  checkData: [
    checkApplication,
    checkHasContact(ContactRoles.ECOLOGIST, USER),
    accountNamesCheckData(AccountRoles.ECOLOGIST_ORGANISATION, [], contactURIs.ECOLOGIST)
  ],
  getData: getAccountNamesData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, []),
  setData: setAccountNamesData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION),
  completion: accountNamesCompletion(AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST)
})
