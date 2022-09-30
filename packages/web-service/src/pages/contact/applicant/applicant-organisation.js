import {
  getContactAccountData,
  setContactAccountData,
  contactAccountCompletion
} from '../common/is-organisation/is-organisation.js'
import { contactURIs } from '../../../uris.js'
import { checkHasContact } from '../common/common.js'
import { ContactRoles, AccountRoles } from '../../../services/api-requests.js'
import { isOrganisation } from '../common/is-organisation/is-organisation-page.js'

const { IS_ORGANISATION } = contactURIs.APPLICANT

export const applicantOrganisation = isOrganisation({
  page: IS_ORGANISATION.page,
  uri: IS_ORGANISATION.uri,
  checkData: checkHasContact(ContactRoles.APPLICANT, contactURIs.APPLICANT),
  getData: getContactAccountData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  setData: setContactAccountData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  completion: contactAccountCompletion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
}, AccountRoles.APPLICANT_ORGANISATION)
