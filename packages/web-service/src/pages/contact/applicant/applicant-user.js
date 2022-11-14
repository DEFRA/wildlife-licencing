import { contactURIs } from '../../../uris.js'
import { getUserData, setUserData, userCompletion } from '../common/user/user.js'
import { checkHasApplication } from '../common/common.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

import { yesNoPage } from '../../common/yes-no.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
const { USER } = contactURIs.APPLICANT

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const state = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.LICENCE_HOLDER)
  if (state === tagStatus.NOT_STARTED) {
    await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.LICENCE_HOLDER, tagState: tagStatus.IN_PROGRESS })
  }
  return getUserData(ContactRoles.APPLICANT)(request)
}

export const applicantUser = yesNoPage({
  getData,
  page: USER.page,
  uri: USER.uri,
  setData: setUserData(ContactRoles.APPLICANT),
  completion: userCompletion(ContactRoles.APPLICANT, [ContactRoles.ADDITIONAL_APPLICANT], AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  checkData: checkHasApplication
})
