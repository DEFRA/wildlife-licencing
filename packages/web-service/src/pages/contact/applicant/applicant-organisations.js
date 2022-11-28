import { accountNamesPage } from '../common/account-names/account-names-page.js'
import { contactURIs } from '../../../uris.js'
import { getAccountNamesData, setAccountNamesData, accountNamesCompletion, accountNamesCheckData } from '../common/account-names/account-names.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasApplication, checkHasContact } from '../common/common-handler.js'
const { ORGANISATIONS } = contactURIs.APPLICANT

export const applicantOrganisations = accountNamesPage({
  page: ORGANISATIONS.page,
  uri: ORGANISATIONS.uri,
  checkData: [checkHasApplication,
    checkHasContact(ContactRoles.APPLICANT),
    accountNamesCheckData(AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
  ],
  getData: getAccountNamesData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  setData: setAccountNamesData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  completion: accountNamesCompletion(AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
