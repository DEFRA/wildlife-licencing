import { contactURIs } from '../../../uris.js'
import { getUserData, setUserData, userCompletion } from '../common/user/user.js'
import { checkHasApplication } from '../common/common.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { moveTagInProgress } from '../../common/move-tag-status-in-progress.js'
import { yesNoPage } from '../../common/yes-no.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
const { USER } = contactURIs.APPLICANT

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, SECTION_TASKS.LICENCE_HOLDER)
  return getUserData(ContactRoles.APPLICANT)(request)
}

export const applicantUser = yesNoPage({
  getData,
  page: USER.page,
  uri: USER.uri,
  setData: setUserData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  completion: userCompletion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  checkData: checkHasApplication
})
