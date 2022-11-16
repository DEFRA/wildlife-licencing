import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import {
  getContactNamesData,
  setContactNamesData,
  contactNamesCompletion
} from '../common/contact-names/contact-names.js'
import { checkHasApplication, checkHasNames } from '../common/common.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

export const ecologistNames = contactNamesPage({
  page: contactURIs.ECOLOGIST.NAMES.page,
  uri: contactURIs.ECOLOGIST.NAMES.uri,
  checkData: [checkHasApplication, checkHasNames(ContactRoles.ECOLOGIST, [ContactRoles.ADDITIONAL_ECOLOGIST], contactURIs.ECOLOGIST)],
  getData: getContactNamesData(ContactRoles.ECOLOGIST, [ContactRoles.ADDITIONAL_ECOLOGIST]),
  setData: setContactNamesData(ContactRoles.ECOLOGIST),
  completion: contactNamesCompletion(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST)
})
