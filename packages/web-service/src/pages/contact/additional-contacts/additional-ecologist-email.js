import { contactURIs } from '../../../uris.js'
import { emailAddressPage } from '../common/email-address/email-address-page.js'
import { checkHasApplication, checkHasContact } from '../common/common.js'
import { ContactRoles } from '../common/contact-roles.js'
import {
  getAdditionalContactEmailAddressData,
  setAdditionalContactEmailAddressData,
  additionalContactEmailCompletion
} from './common.js'

const { EMAIL } = contactURIs.ADDITIONAL_ECOLOGIST

export const additionalEcologistEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  checkData: [checkHasApplication, checkHasContact(ContactRoles.ADDITIONAL_ECOLOGIST)],
  getData: getAdditionalContactEmailAddressData(ContactRoles.ADDITIONAL_ECOLOGIST),
  setData: setAdditionalContactEmailAddressData(ContactRoles.ADDITIONAL_ECOLOGIST),
  completion: additionalContactEmailCompletion(ContactRoles.ADDITIONAL_ECOLOGIST, contactURIs.ADDITIONAL_ECOLOGIST)
})
