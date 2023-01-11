import { contactURIs, TASKLIST } from '../../../uris.js'
import { getCheckAnswersData } from '../common/check-answers/check-answers.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { APIRequests } from '../../../services/api-requests.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { checkAccountComplete, checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'
import { tagStatus } from '../../../services/status-tags.js'
const { CHECK_ANSWERS, USER } = contactURIs.ECOLOGIST

export const completion = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.ECOLOGIST, tagState: tagStatus.COMPLETE })
  return TASKLIST.uri
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.ECOLOGIST, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  return getCheckAnswersData(ContactRoles.ECOLOGIST, [ContactRoles.ADDITIONAL_ECOLOGIST], AccountRoles.ECOLOGIST_ORGANISATION)(request)
}

export const ecologistCheckAnswers = checkAnswersPage({
  checkData: [
    checkApplication,
    checkHasContact(ContactRoles.ECOLOGIST, USER),
    checkAccountComplete(AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST)
  ],
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri,
  getData,
  completion
})
