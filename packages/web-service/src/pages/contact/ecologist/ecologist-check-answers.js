import { contactURIs, TASKLIST } from '../../../uris.js'
import { getCheckAnswersData } from '../common/check-answers/check-answers.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { checkHasApplication } from '../common/common.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
const { CHECK_ANSWERS } = contactURIs.ECOLOGIST

export const completion = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.ECOLOGIST, tagState: tagStatus.COMPLETE })
  return TASKLIST.uri
}

const getData = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.ECOLOGIST, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  return getCheckAnswersData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION)(request)
}

export const ecologistCheckAnswers = checkAnswersPage({
  checkData: checkHasApplication,
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri,
  getData,
  completion
})
