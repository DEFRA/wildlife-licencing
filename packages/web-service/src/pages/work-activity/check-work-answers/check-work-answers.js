import pageRoute from '../../../routes/page-route.js'
import { workActivityURIs, TASKLIST } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { checkApplication } from '../../common/check-application.js'
import { tagStatus } from '../../../services/status-tags.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.WORK_ACTIVITY, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)

  const result = []

  console.log(applicationData)
  result.push({ key: 'workProposal', value: applicationData.proposalDescription })
  return result
}

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.WORK_ACTIVITY, tagState: tagStatus.COMPLETE })
  return TASKLIST.uri
}

export default pageRoute({
  uri: workActivityURIs.CHECK_YOUR_ANSWERS.uri,
  page: workActivityURIs.CHECK_YOUR_ANSWERS.page,
  checkData: checkApplication,
  completion,
  getData
})
