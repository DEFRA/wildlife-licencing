import { contactURIs, TASKLIST } from '../../../uris.js'
import { getCheckAnswersData } from '../common/check-answers/check-answers.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { checkAccountComplete, checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'

const { CHECK_ANSWERS, USER } = contactURIs.APPLICANT

export const getData = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.LICENCE_HOLDER, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  return getCheckAnswersData(ContactRoles.APPLICANT, [ContactRoles.ADDITIONAL_APPLICANT], AccountRoles.APPLICANT_ORGANISATION)(request)
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.LICENCE_HOLDER, tagState: tagStatus.COMPLETE })
  return TASKLIST.uri
}

export const applicantCheckAnswers = checkAnswersPage({
  checkData: [
    checkApplication,
    checkHasContact(ContactRoles.APPLICANT, USER),
    checkAccountComplete(AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT)
  ],
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri,
  getData,
  completion
})
