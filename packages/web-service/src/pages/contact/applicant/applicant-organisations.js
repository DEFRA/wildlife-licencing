import { accountNamesPage } from '../common/account-names/account-names-page.js'
import { contactURIs } from '../../../uris.js'
import { getAccountNamesData, setAccountNamesData, accountNamesCompletion, accountNamesCheckData } from '../common/account-names/account-names.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'
const { ORGANISATIONS, USER } = contactURIs.APPLICANT

export const applicantOrganisations = accountNamesPage({
  page: ORGANISATIONS.page,
  uri: ORGANISATIONS.uri,
  checkData: [
    checkApplication,
    checkHasContact(ContactRoles.APPLICANT, USER),
    accountNamesCheckData(AccountRoles.APPLICANT_ORGANISATION, [], contactURIs.APPLICANT)
  ],
  getData: getAccountNamesData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, []),
  setData: setAccountNamesData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  completion: accountNamesCompletion(AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
