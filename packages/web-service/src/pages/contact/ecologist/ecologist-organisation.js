import {
  getContactAccountData,
  setContactAccountData,
  contactAccountCompletion
} from '../common/is-organisation/is-organisation.js'
import { contactURIs } from '../../../uris.js'
import { isOrganisation } from '../common/is-organisation/is-organisation-page.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasApplication, checkHasContact } from '../common/common-handler.js'

const { IS_ORGANISATION } = contactURIs.ECOLOGIST

export const ecologistOrganisation = isOrganisation({
  page: IS_ORGANISATION.page,
  uri: IS_ORGANISATION.uri,
  checkData: [checkHasApplication, checkHasContact(ContactRoles.ECOLOGIST)],
  getData: getContactAccountData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION),
  setData: setContactAccountData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION),
  completion: contactAccountCompletion(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST)
}, AccountRoles.ECOLOGIST_ORGANISATION)
