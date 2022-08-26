import { accountNamesPage } from '../common/account-names/account-names-page.js'
import { contactURIs } from '../../../uris.js'
import { getAccountNamesData, setAccountNamesData, accountNamesCompletion, accountNamesCheckData } from '../common/account-names/account-names.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'
const { ORGANISATIONS } = contactURIs.APPLICANT

export const applicantOrganisations = accountNamesPage({
  page: ORGANISATIONS.page,
  uri: ORGANISATIONS.uri,
  checkData: accountNamesCheckData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  getData: getAccountNamesData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION),
  setData: setAccountNamesData(ApiRequestEntities.APPLICANT_ORGANISATION),
  completion: accountNamesCompletion(ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
