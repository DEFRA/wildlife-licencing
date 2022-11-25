import { yesNoPage } from '../../common/yes-no.js'
import { checkHasApplication } from '../common/common.js'
import { contactURIs } from '../../../uris.js'
import { ContactRoles } from '../common/contact-roles.js'
import { addAdditionalContactCompletion, getAdditionalContactData, setAdditionalContactData } from './common.js'

export const addAdditionalApplicant = yesNoPage({
  page: contactURIs.ADDITIONAL_APPLICANT.ADD.page,
  uri: contactURIs.ADDITIONAL_APPLICANT.ADD.uri,
  getData: getAdditionalContactData(ContactRoles.ADDITIONAL_APPLICANT),
  setData: setAdditionalContactData(ContactRoles.ADDITIONAL_APPLICANT),
  checkData: checkHasApplication,
  completion: addAdditionalContactCompletion(ContactRoles.ADDITIONAL_APPLICANT, contactURIs.ADDITIONAL_APPLICANT)
})
