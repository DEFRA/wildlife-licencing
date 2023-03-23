import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { tagStatus } from '../../../services/status-tags.js'
import { workActivityURIs } from '../../../uris.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.WORK_ACTIVITY, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  return workActivityURIs.CHECK_YOUR_ANSWERS.uri
}

export default pageRoute({
  uri: workActivityURIs.LICENCE_COST.uri,
  page: workActivityURIs.LICENCE_COST.page,
  completion
})
