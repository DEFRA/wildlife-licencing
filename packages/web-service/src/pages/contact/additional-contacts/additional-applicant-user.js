import { contactURIs } from '../../../uris.js'
import { getUserData, setUserData } from '../common/user/user.js'
import { checkHasApplication } from '../common/common.js'
import { yesNoPage } from '../../common/yes-no.js'
import { ContactRoles } from '../common/contact-roles.js'
import { additionalContactUserCompletion } from './common.js'
const { USER } = contactURIs.ADDITIONAL_APPLICANT

export const additionalApplicantUser = yesNoPage({
  page: USER.page,
  uri: USER.uri,
  checkData: checkHasApplication,
  getData: getUserData(ContactRoles.ADDITIONAL_APPLICANT),
  setData: setUserData(ContactRoles.ADDITIONAL_APPLICANT),
  completion: additionalContactUserCompletion(ContactRoles.ADDITIONAL_APPLICANT, [ContactRoles.APPLICANT], contactURIs.ADDITIONAL_APPLICANT)
})
