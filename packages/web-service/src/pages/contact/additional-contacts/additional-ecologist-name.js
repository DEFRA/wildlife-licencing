import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { getContactData, setContactData } from '../common/contact-name/contact-name.js'
import { checkHasContact } from '../common/common.js'
import { ContactRoles } from '../common/contact-roles.js'
import { additionalContactNameCompletion } from './common.js'

const { NAME } = contactURIs.ADDITIONAL_ECOLOGIST

export const additionalEcologistName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkHasContact(ContactRoles.ADDITIONAL_ECOLOGIST, contactURIs.ADDITIONAL_ECOLOGIST),
  getData: getContactData(ContactRoles.ADDITIONAL_ECOLOGIST),
  setData: setContactData(ContactRoles.ADDITIONAL_ECOLOGIST),
  completion: additionalContactNameCompletion(ContactRoles.ADDITIONAL_ECOLOGIST, contactURIs.ADDITIONAL_ECOLOGIST)
}, [ContactRoles.ADDITIONAL_ECOLOGIST, ContactRoles.ECOLOGIST])
