import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import {
  getContactNamesData,
  setContactNamesData,
  contactNamesCompletion
} from '../common/contact-names/contact-names.js'
import { checkHasContact } from '../common/common.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

export const ecologistNames = contactNamesPage({
  page: contactURIs.ECOLOGIST.NAMES.page,
  uri: contactURIs.ECOLOGIST.NAMES.uri,
  checkData: checkHasContact(ContactRoles.ECOLOGIST, contactURIs.ECOLOGIST),
  getData: getContactNamesData(ContactRoles.ECOLOGIST),
  setData: setContactNamesData(ContactRoles.ECOLOGIST),
  completion: contactNamesCompletion(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST)
})
