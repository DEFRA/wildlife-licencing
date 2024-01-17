import { contactURIs } from '../../../../uris.js'
import { contactNamePage } from '../../common/contact-name/contact-name-page.js'
import { getContactData, setContactData } from '../../common/contact-name/contact-name.js'
import { ContactRoles } from '../../common/contact-roles.js'
import { additionalContactCompletion } from '../common.js'
import { checkApplication } from '../../../common/check-application.js'

const { NAME } = contactURIs.ADDITIONAL_APPLICANT

export const additionalApplicantName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkApplication,
  getData: getContactData(ContactRoles.ADDITIONAL_APPLICANT),
  setData: setContactData(ContactRoles.ADDITIONAL_APPLICANT),
  completion: additionalContactCompletion(ContactRoles.ADDITIONAL_APPLICANT, contactURIs.ADDITIONAL_APPLICANT)
}, [ContactRoles.APPLICANT])
