import { contactURIs } from '../../../uris.js'
import { getUserData, setUserData, userCompletion } from '../common/user/user.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { yesNoPage } from '../../common/yes-no.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { moveTagInProgress } from '../../common/tag-functions.js'
import { checkCanBeUser } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'

const { USER } = contactURIs.APPLICANT

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, SECTION_TASKS.LICENCE_HOLDER)
  return getUserData(ContactRoles.APPLICANT)(request)
}

export const applicantUser = yesNoPage({
  checkData: [checkApplication, checkCanBeUser([ContactRoles.ADDITIONAL_APPLICANT], contactURIs.APPLICANT)],
  getData: getData,
  page: USER.page,
  uri: USER.uri,
  setData: setUserData(ContactRoles.APPLICANT),
  completion: userCompletion(ContactRoles.APPLICANT, [ContactRoles.ADDITIONAL_APPLICANT],
    AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
