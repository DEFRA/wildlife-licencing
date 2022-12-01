import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { contactNameCompletion, getContactData, setContactData } from '../common/contact-name/contact-name.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasApplication } from '../common/common-handler.js'

const { NAME } = contactURIs.ECOLOGIST

export const ecologistName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkHasApplication,
  getData: getContactData(ContactRoles.ECOLOGIST),
  setData: setContactData(ContactRoles.ECOLOGIST),
  completion: contactNameCompletion(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, [], contactURIs.ECOLOGIST)
}, [ContactRoles.ECOLOGIST, ContactRoles.ADDITIONAL_ECOLOGIST])
