import { contactURIs } from '../../../uris.js'
import { getUserData, setUserData, userCompletion } from '../common/user/user.js'
import { checkHasApplication } from '../common/common.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

import { yesNoPage } from '../../common/yes-no.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
const { USER } = contactURIs.APPLICANT

const getData = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.LICENCE_HOLDER, tagState: tagStatus.IN_PROGRESS })
  return getUserData(ContactRoles.APPLICANT)(request)
}

export const applicantUser = yesNoPage({
  page: USER.page,
  uri: USER.uri,
  checkData: checkHasApplication,
  getData,
  setData: setUserData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION),
  completion: userCompletion(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
})
