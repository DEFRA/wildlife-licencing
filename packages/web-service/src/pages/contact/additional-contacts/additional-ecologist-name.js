import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { getContactData, setContactData } from '../common/contact-name/contact-name.js'
import { ContactRoles } from '../common/contact-roles.js'
import { additionalContactNameCompletion } from './common.js'
import { checkApplication } from '../../common/check-application.js'

const { NAME } = contactURIs.ADDITIONAL_ECOLOGIST

export const additionalEcologistName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkApplication,
  getData: getContactData(ContactRoles.ADDITIONAL_ECOLOGIST),
  setData: setContactData(ContactRoles.ADDITIONAL_ECOLOGIST),
  completion: additionalContactNameCompletion(ContactRoles.ADDITIONAL_ECOLOGIST, contactURIs.ADDITIONAL_ECOLOGIST)
}, ContactRoles.ADDITIONAL_ECOLOGIST, [ContactRoles.ADDITIONAL_ECOLOGIST, ContactRoles.ECOLOGIST])
