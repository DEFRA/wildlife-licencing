import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { getContactData, setContactData } from '../common/contact-name/contact-name.js'
import { checkHasApplication } from '../common/common.js'
import { ContactRoles } from '../common/contact-roles.js'
import { additionalContactNameCompletion } from './common.js'

const { NAME } = contactURIs.ADDITIONAL_APPLICANT

export const additionalApplicantName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkHasApplication,
  getData: getContactData(ContactRoles.ADDITIONAL_APPLICANT),
  setData: setContactData(ContactRoles.ADDITIONAL_APPLICANT),
  completion: additionalContactNameCompletion(ContactRoles.ADDITIONAL_APPLICANT, contactURIs.ADDITIONAL_APPLICANT)
}, [ContactRoles.ADDITIONAL_APPLICANT, ContactRoles.APPLICANT])
