import { accountNamesPage } from '../common/account-names/account-names-page.js'
import { contactURIs } from '../../../uris.js'
import { getAccountNamesData, setAccountNamesData, accountNamesCompletion } from '../common/account-names/account-names.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'
import { checkData } from '../common/common.js'
const { ORGANISATIONS } = contactURIs.APPLICANT

export const applicantOrganisations = accountNamesPage({
  page: ORGANISATIONS.page,
  uri: ORGANISATIONS.uri,
  checkData: checkData,
  getData: getAccountNamesData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION),
  setData: setAccountNamesData(ApiRequestEntities.APPLICANT_ORGANISATION),
  completion: accountNamesCompletion(ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
