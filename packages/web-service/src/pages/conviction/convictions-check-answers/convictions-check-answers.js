import { Backlink } from '../../../handlers/backlink.js'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { tagStatus } from '../../../services/status-tags.js'
import { convictionsURIs, TASKLIST } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'

export const checkData = async (request, h) => {
  const { applicationId } = await request.cache().getData()
  const application = await APIRequests.APPLICATION.getById(applicationId)

  // When the user says there are convictions and does not mention the details should be redirected to enter the details of convictions
  if (application?.isRelatedConviction && !application?.detailsOfConvictions) {
    return h.redirect(convictionsURIs.CONVICTION_DETAILS.uri)
  }

  return null
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const application = await APIRequests.APPLICATION.getById(applicationId)
  const result = []
  let anyConvictions = 'No'
  if (application?.isRelatedConviction) {
    anyConvictions = 'Yes'
  }

  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.DECLARE_CONVICTIONS, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })

  result.push({ key: 'isAnyConviction', value: anyConvictions })
  if (application?.isRelatedConviction) {
    result.push({ key: 'convictionDetails', value: application?.detailsOfConvictions })
  }
  return result
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  // Mark the convections journey tag as complete
  await APIRequests.APPLICATION.tags(journeyData?.applicationId).set({ tag: SECTION_TASKS.DECLARE_CONVICTIONS, tagState: tagStatus.COMPLETE })

  return TASKLIST.uri
}

export default pageRoute({
  page: convictionsURIs.CHECK_CONVICTIONS_ANSWERS.page,
  uri: convictionsURIs.CHECK_CONVICTIONS_ANSWERS.uri,
  backlink: Backlink.NO_BACKLINK,
  checkData: [checkApplication, checkData],
  getData,
  completion
})
