import { contactURIs } from '../../../uris.js'
import { getUserData, setUserData, userCompletion } from '../common/user/user.js'
import { checkHasApplication } from '../common/common.js'

import { yesNoPage } from '../../common/yes-no.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
const { USER } = contactURIs.ECOLOGIST

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const state = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.ECOLOGIST)
  if (state === tagStatus.NOT_STARTED) {
    await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.ECOLOGIST, tagState: tagStatus.IN_PROGRESS })
  }
  return getUserData(ContactRoles.ECOLOGIST)(request)
}

export const ecologistUser = yesNoPage({
  getData,
  page: USER.page,
  uri: USER.uri,
  setData: setUserData(ContactRoles.ECOLOGIST),
  completion: userCompletion(ContactRoles.ECOLOGIST, [ContactRoles.ADDITIONAL_ECOLOGIST], AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST),
  checkData: checkHasApplication
})
