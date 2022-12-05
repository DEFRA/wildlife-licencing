import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import {
  getContactNamesData,
  setContactNamesData
} from '../common/contact-names/contact-names.js'
import { ContactRoles } from '../common/contact-roles.js'
import { additionalContactNamesCompletion } from './common.js'
import { checkHasNames } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'

export const additionalEcologistNames = contactNamesPage({
  page: contactURIs.ADDITIONAL_ECOLOGIST.NAMES.page,
  uri: contactURIs.ADDITIONAL_ECOLOGIST.NAMES.uri,
  checkData: [checkApplication, checkHasNames(ContactRoles.ADDITIONAL_ECOLOGIST, [ContactRoles.ECOLOGIST], contactURIs.ADDITIONAL_ECOLOGIST)],
  getData: getContactNamesData(ContactRoles.ADDITIONAL_ECOLOGIST, [ContactRoles.ECOLOGIST]),
  setData: setContactNamesData(ContactRoles.ADDITIONAL_ECOLOGIST),
  completion: additionalContactNamesCompletion(ContactRoles.ADDITIONAL_ECOLOGIST, contactURIs.ADDITIONAL_ECOLOGIST)
})
