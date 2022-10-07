import { contactURIs } from '../../../uris.js'
import { getUserData, setUserData, userCompletion } from '../common/user/user.js'
import { checkHasApplication } from '../common/common.js'

import { yesNoPage } from '../../common/yes-no.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
const { USER } = contactURIs.APPLICANT

export const applicantUser = yesNoPage({
  page: USER.page,
  uri: USER.uri,
  checkData: checkHasApplication,
  getData: getUserData(ContactRoles.APPLICANT),
  setData: setUserData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  completion: userCompletion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
