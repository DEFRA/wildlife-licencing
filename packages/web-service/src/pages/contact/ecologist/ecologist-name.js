import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { contactNameCompletion, getContactData, setContactData } from '../common/contact-name/contact-name.js'
import { checkHasContact } from '../common/common.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

const { NAME } = contactURIs.ECOLOGIST

export const ecologistName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkHasContact(ContactRoles.ECOLOGIST, contactURIs.ECOLOGIST),
  getData: getContactData(ContactRoles.ECOLOGIST),
  setData: setContactData(ContactRoles.ECOLOGIST),
  completion: contactNameCompletion(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST)
}, ContactRoles.ECOLOGIST)
