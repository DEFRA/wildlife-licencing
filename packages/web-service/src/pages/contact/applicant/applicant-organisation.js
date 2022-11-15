import {
  getContactAccountData,
  setContactAccountData,
  contactAccountCompletion
} from '../common/is-organisation/is-organisation.js'
import { contactURIs } from '../../../uris.js'
import { checkHasApplication } from '../common/common.js'
import { isOrganisation } from '../common/is-organisation/is-organisation-page.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

const { IS_ORGANISATION } = contactURIs.APPLICANT

export const applicantOrganisation = isOrganisation({
  page: IS_ORGANISATION.page,
  uri: IS_ORGANISATION.uri,
  checkData: checkHasApplication,
  getData: getContactAccountData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  setData: setContactAccountData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  completion: contactAccountCompletion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
}, AccountRoles.APPLICANT_ORGANISATION)
