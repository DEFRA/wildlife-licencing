import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import {
  getContactNamesData,
  setContactNamesData,
  contactNamesCompletion
} from '../common/contact-names/contact-names.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasNames } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'

export const ecologistNames = contactNamesPage({
  page: contactURIs.ECOLOGIST.NAMES.page,
  uri: contactURIs.ECOLOGIST.NAMES.uri,
  checkData: [checkApplication, checkHasNames(ContactRoles.ECOLOGIST, [ContactRoles.ADDITIONAL_ECOLOGIST], contactURIs.ECOLOGIST)],
  getData: getContactNamesData(ContactRoles.ECOLOGIST, [ContactRoles.ADDITIONAL_ECOLOGIST]),
  setData: setContactNamesData(ContactRoles.ECOLOGIST),
  completion: contactNamesCompletion(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST)
})
