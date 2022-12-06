import { contactURIs } from '../../../uris.js'
import { emailAddressPage } from '../common/email-address/email-address-page.js'
import { ContactRoles } from '../common/contact-roles.js'
import {
  getAdditionalContactEmailAddressData,
  setAdditionalContactEmailAddressData,
  additionalContactEmailCompletion
} from './common.js'
import { checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'

const { EMAIL, ADD } = contactURIs.ADDITIONAL_APPLICANT

export const additionalApplicantEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  checkData: [checkApplication, checkHasContact(ContactRoles.ADDITIONAL_APPLICANT, ADD)],
  getData: getAdditionalContactEmailAddressData(ContactRoles.ADDITIONAL_APPLICANT),
  setData: setAdditionalContactEmailAddressData(ContactRoles.ADDITIONAL_APPLICANT),
  completion: additionalContactEmailCompletion(ContactRoles.ADDITIONAL_APPLICANT, contactURIs.ADDITIONAL_APPLICANT)
}, ContactRoles.ADDITIONAL_APPLICANT)
